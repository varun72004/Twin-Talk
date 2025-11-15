import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await axios.post(
        '/api/ai/chat',
        {
          message: userMessage,
          conversationHistory
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: response.data.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again later.';
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
        
        // Special handling for not configured
        if (error.response.status === 503 && !errorData?.configured) {
          errorMessage = 'AI Assistant is not configured. Please add your AI_API_KEY to server/.env file. You can get an API key from OpenAI or use any compatible LLM API.';
        }
      }
      
      const errorMsg = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg z-50"
      role="dialog"
      aria-label="AI Assistant"
      aria-modal="true"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary-600 text-white">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
          aria-label="Close AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Ask me anything! I'm here to help.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="break-words">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI assistant..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
            aria-label="AI assistant input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message to AI"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default AIAssistant;

