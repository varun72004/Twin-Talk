const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// AI Chat endpoint
router.post('/chat', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Limit message length
    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || apiKey === 'your-ai-api-key-here') {
      return res.status(503).json({ 
        error: 'AI service not configured',
        message: 'Please configure AI_API_KEY in server/.env file to use the AI assistant. You can get an API key from OpenAI or use any compatible LLM API.',
        configured: false
      });
    }

    // Check if using Gemini API
    const isGemini = apiUrl.includes('generativelanguage.googleapis.com');
    
    let response;
    let aiResponse;

    if (isGemini) {
      // Gemini API format
      const contents = [];
      
      // Find system instruction if available
      const systemMsg = conversationHistory.find(m => m.role === 'system');
      const systemInstruction = systemMsg 
        ? systemMsg.content 
        : 'You are a helpful assistant in a chat application. Keep responses concise and friendly.';
      
      // Add conversation history (last 10 messages, excluding system messages)
      const recentHistory = conversationHistory
        .filter(m => m.role !== 'system')
        .slice(-10);
      
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
      
      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      };

      response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'X-goog-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } else {
      // OpenAI API format
      const messages = [
        { role: 'system', content: 'You are a helpful assistant in a chat application. Keep responses concise and friendly.' },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ];

      response = await axios.post(
        apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      aiResponse = response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    }

    res.json({
      message: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI API Error:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Unable to connect to AI service. Please check your internet connection and API configuration.',
        configured: true
      });
    }
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data?.error;
      
      let message = 'AI service error occurred';
      if (status === 401) {
        message = 'Invalid API key. Please check your AI_API_KEY in server/.env';
      } else if (status === 429) {
        message = 'Rate limit exceeded. Please try again later.';
      } else if (status === 500) {
        message = 'AI service internal error. Please try again later.';
      } else if (errorData?.message) {
        message = errorData.message;
      }
      
      return res.status(status).json({ 
        error: 'AI service error',
        message: message,
        details: errorData?.message || 'Unknown error',
        configured: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: 'An unexpected error occurred. Please try again later.',
      configured: true
    });
  }
});

module.exports = router;

