import React from 'react';

function Sidebar({ user, onlineUsers, allUsers, currentRoom, setCurrentRoom, onLogout, isAIAssistantOpen, setIsAIAssistantOpen, onStartPersonalChat }) {
  const rooms = ['general', 'random', 'tech', 'gaming'];
  
  // Separate users into online and offline
  const onlineUsersList = allUsers.filter(u => u.isOnline);
  const offlineUsersList = allUsers.filter(u => !u.isOnline);
  
  // Check if current room is a DM
  const isDMRoom = currentRoom.startsWith('dm:');
  const getDMTargetUser = () => {
    if (!isDMRoom) return null;
    const dmParts = currentRoom.split(':');
    const targetUserId = dmParts[1] === user?.id ? dmParts[2] : dmParts[1];
    return allUsers.find(u => u.id === targetUserId);
  };

  return (
    <aside 
      className="w-64 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 flex flex-col h-screen shadow-xl backdrop-blur-sm"
      role="complementary"
      aria-label="Chat sidebar"
    >
      {/* User Info */}
      <div className="p-5 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform transition-transform hover:scale-110">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="font-bold text-gray-800">{user?.username || 'User'}</p>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-2 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
            aria-label="Logout"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rooms */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
          Rooms
        </h2>
        <nav aria-label="Chat rooms">
          <ul className="space-y-2">
            {rooms.map(room => (
              <li key={room}>
                <button
                  onClick={() => setCurrentRoom(room)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transform ${
                    currentRoom === room
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:scale-105 hover:shadow-md'
                  }`}
                  aria-current={currentRoom === room ? 'page' : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">#</span>
                    <span className="capitalize">{room}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Personal Chats */}
        {isDMRoom && (
          <div className="mt-6">
            <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></span>
              Direct Message
            </h2>
            <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {getDMTargetUser()?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${getDMTargetUser()?.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{getDMTargetUser()?.username || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Online Users */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></span>
            Online ({onlineUsersList.length + 1})
          </h2>
          <ul className="space-y-2" aria-label="Online users">
            <li className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-colors">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{user?.username || 'You'}</span>
                <span className="text-xs text-gray-400 ml-2">(You)</span>
              </div>
            </li>
            {onlineUsersList.map(onlineUser => (
              <li 
                key={onlineUser.id} 
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-all duration-300 cursor-pointer group animate-fade-in"
                onClick={() => onStartPersonalChat(onlineUser.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {onlineUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{onlineUser.username}</span>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPersonalChat(onlineUser.id);
                  }}
                  title="Start chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Offline Users */}
        {offlineUsersList.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></span>
              Offline ({offlineUsersList.length})
            </h2>
            <ul className="space-y-2" aria-label="Offline users">
              {offlineUsersList.map(offlineUser => (
                <li 
                  key={offlineUser.id} 
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-all duration-300 cursor-pointer group opacity-60 hover:opacity-100"
                  onClick={() => onStartPersonalChat(offlineUser.id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {offlineUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{offlineUser.username}</span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartPersonalChat(offlineUser.id);
                    }}
                    title="Start chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Assistant Toggle */}
      <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <button
          onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transform ${
            isAIAssistantOpen
              ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:scale-105 shadow-md'
          }`}
          aria-label={isAIAssistantOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-semibold">AI Assistant</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

