import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import MessageInput from './MessageInput';
import VoiceInput from './VoiceInput';
import AIAssistant from './AIAssistant';
import axios from 'axios';

function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({}); // Store messages per room
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All users with online status
  const [currentRoom, setCurrentRoom] = useState('general');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const voiceTextRef = useRef(null);

  // Get messages for current room
  const messages = messagesByRoom[currentRoom] || [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize Socket.IO connection with multi-device support
    // Use environment variable for production, localhost for development
    const apiUrl = process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'], // Fallback to polling for better device compatibility
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join-room', currentRoom);
    });

    newSocket.on('receive-message', (message) => {
      // Store message in the appropriate room
      setMessagesByRoom(prev => {
        const roomId = message.roomId || currentRoom;
        // Check if message already exists (avoid duplicates)
        const existingMessages = prev[roomId] || [];
        if (existingMessages.find(m => m.id === message.id)) {
          return prev;
        }
        return {
          ...prev,
          [roomId]: [...existingMessages, message]
        };
      });
    });

    // Handle room messages when joining (for persistence)
    newSocket.on('room-messages', ({ roomId, messages }) => {
      setMessagesByRoom(prev => ({
        ...prev,
        [roomId]: messages
      }));
    });

    // Handle message deletion
    newSocket.on('message-deleted', ({ messageId, roomId }) => {
      setMessagesByRoom(prev => {
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.filter(msg => msg.id !== messageId)
        };
      });
    });

    // Handle delete errors
    newSocket.on('delete-error', ({ message }) => {
      console.error('Delete error:', message);
      // You could show a toast notification here
    });

    newSocket.on('user-online', (userData) => {
      setOnlineUsers(prev => {
        if (!prev.find(u => u.userId === userData.userId)) {
          return [...prev, userData];
        }
        return prev;
      });
      // Update all users list
      setAllUsers(prev => prev.map(u => 
        u.id === userData.userId ? { ...u, isOnline: true } : u
      ));
    });

    newSocket.on('user-offline', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
      // Update all users list
      setAllUsers(prev => prev.map(u => 
        u.id === userData.userId ? { ...u, isOnline: false } : u
      ));
    });

    // Handle users list from server
    newSocket.on('users-list', (users) => {
      setAllUsers(users);
    });

    newSocket.on('users-list-updated', (users) => {
      setAllUsers(users);
    });

    // Handle DM room creation
    newSocket.on('dm-room-created', ({ roomId, targetUserId }) => {
      setCurrentRoom(roomId);
    });

    newSocket.on('user-typing', (data) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u.userId !== data.userId), data];
        } else {
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [navigate, currentRoom]);

  useEffect(() => {
    if (socket && currentRoom) {
      // Leave previous room and join new room
      // Note: We don't clear messages anymore - they're stored per room
      socket.emit('join-room', currentRoom);
    }
  }, [currentRoom, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (message, type = 'text', fileUrl = null) => {
    if (!socket || !message.trim()) return;

    socket.emit('send-message', {
      roomId: currentRoom,
      message: message.trim(),
      type,
      fileUrl
    });
  };

  const deleteMessage = (messageId) => {
    if (!socket) return;

    socket.emit('delete-message', {
      messageId,
      roomId: currentRoom
    });
  };

  const startPersonalChat = (targetUserId) => {
    if (!socket) return;
    socket.emit('join-dm', targetUserId);
  };

  const handleLogout = () => {
    logout();
    if (socket) {
      socket.close();
    }
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100" role="main" aria-label="Chat application">
      <Sidebar
        user={user}
        onlineUsers={onlineUsers}
        allUsers={allUsers}
        currentRoom={currentRoom}
        setCurrentRoom={setCurrentRoom}
        onLogout={handleLogout}
        isAIAssistantOpen={isAIAssistantOpen}
        setIsAIAssistantOpen={setIsAIAssistantOpen}
        onStartPersonalChat={startPersonalChat}
      />
      <div className="flex-1 flex flex-col relative">
        <ChatArea
          messages={messages}
          currentUser={user}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          onDeleteMessage={deleteMessage}
        />
        <div className="border-t bg-white p-4">
          <MessageInput
            onSendMessage={sendMessage}
            socket={socket}
            currentRoom={currentRoom}
            onVoiceTextUpdate={voiceTextRef}
          />
          <VoiceInput onSendMessage={sendMessage} setMessageText={voiceTextRef} />
        </div>
        <AIAssistant
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
        />
      </div>
    </div>
  );
}

export default Chat;

