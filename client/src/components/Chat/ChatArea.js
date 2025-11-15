import React, { useState } from 'react';

function ChatArea({ messages, currentUser, typingUsers, messagesEndRef, onDeleteMessage }) {
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 relative"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      style={{
        background: `
          linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM60 91c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM35 41c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 60c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%236366f1' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'cover, 200px 200px',
        backgroundPosition: 'center, 0 0',
        backgroundAttachment: 'fixed',
        backgroundBlendMode: 'normal, normal'
      }}
    >
      {/* Animated floating orbs */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)
          `,
          backgroundSize: '400% 400%',
          animation: 'backgroundMove 30s ease infinite'
        }}
      />
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.2) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.2) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(236, 72, 153, 0.15) 0px, transparent 50%)
          `,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 25s ease infinite'
        }}
      />
      
      <div className="relative z-10">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-lg font-medium animate-pulse">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isOwnMessage = message.userId === currentUser?.id;
            const showDelete = isOwnMessage && hoveredMessageId === message.id;
            
            const handleDelete = () => {
              if (window.confirm('Are you sure you want to delete this message?')) {
                onDeleteMessage(message.id);
              }
            };
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group animate-message-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onMouseEnter={() => isOwnMessage && setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div
                  className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    isOwnMessage
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-blue-500/30'
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-gray-200/50'
                  }`}
                >
                  {showDelete && (
                    <button
                      onClick={handleDelete}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 animate-fade-in z-10"
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {message.username.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {message.username}
                      </p>
                    </div>
                  )}
                  {message.type === 'image' && message.fileUrl ? (
                    <div className="rounded-xl overflow-hidden shadow-inner">
                      <img
                        src={message.fileUrl}
                        alt={`Image shared by ${message.username}`}
                        className="max-w-full h-auto transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <p className="break-words leading-relaxed">{message.message}</p>
                  )}
                  {message.type === 'voice' && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        <span className="w-1 h-4 bg-current rounded-full animate-pulse"></span>
                        <span className="w-1 h-6 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                      <p className="text-xs opacity-75 italic">
                        Voice message
                      </p>
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${isOwnMessage ? 'opacity-80' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {typingUsers.length > 0 && (
        <div className="flex justify-start mt-4 animate-fade-in" role="status" aria-live="polite">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 px-4 py-3 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatArea;

