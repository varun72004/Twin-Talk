import React, { useState, useRef } from 'react';
import axios from 'axios';

function MessageInput({ onSendMessage, socket, currentRoom, onVoiceTextUpdate }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  // Expose setMessage function to parent
  React.useEffect(() => {
    if (onVoiceTextUpdate) {
      onVoiceTextUpdate.current = {
        setMessage: (text) => {
          setMessage(text);
          messageInputRef.current?.focus();
        }
      };
    }
  }, [onVoiceTextUpdate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !uploading) {
      onSendMessage(message);
      setMessage('');
      stopTyping();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { roomId: currentRoom, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket?.emit('typing', { roomId: currentRoom, isTyping: false });
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileUrl = response.data.fileUrl;
      onSendMessage(`Shared an image: ${file.name}`, 'image', fileUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3" aria-label="Message input form">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="p-3 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-110 hover:bg-blue-50 active:scale-95"
        aria-label="Upload image"
        title="Upload image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        aria-label="File input"
      />
      
      <div className="flex-1 relative">
        <input
          ref={messageInputRef}
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type a message..."
          className="w-full px-5 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
          disabled={uploading}
          aria-label="Message input"
          aria-describedby="message-help"
        />
        {uploading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <span id="message-help" className="sr-only">
        Press Enter to send, Shift+Enter for new line
      </span>
      
      <button
        type="submit"
        disabled={!message.trim() || uploading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium"
        aria-label="Send message"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Send
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}

export default MessageInput;

