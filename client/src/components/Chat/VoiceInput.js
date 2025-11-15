import React, { useState, useEffect, useRef } from 'react';

function VoiceInput({ onSendMessage, setMessageText }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const displayText = finalTranscriptRef.current + interimTranscript;
      setTranscript(displayText);
      
      // Update message input box in real-time
      if (setMessageText && setMessageText.current && setMessageText.current.setMessage) {
        setMessageText.current.setMessage(displayText.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Don't auto-send, just populate the message box
      // User can review and edit before sending
      if (finalTranscriptRef.current.trim() && setMessageText && setMessageText.current && setMessageText.current.setMessage) {
        setMessageText.current.setMessage(finalTranscriptRef.current.trim());
      }
      // Reset for next recording
      finalTranscriptRef.current = '';
      setTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSendMessage, setMessageText]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center justify-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
          isListening
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
      >
        <div className="flex items-center space-x-2">
          {isListening ? (
            <>
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Voice Input</span>
            </>
          )}
        </div>
      </button>
      {transcript && (
        <p className="ml-4 text-sm text-gray-600" aria-live="polite">
          {transcript}
        </p>
      )}
    </div>
  );
}

export default VoiceInput;

