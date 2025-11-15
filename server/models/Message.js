const fs = require('fs');
const path = require('path');

const messagesFile = path.join(__dirname, '../data/messages.json');

// Initialize messages file if it doesn't exist
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify({}, null, 2));
}

class Message {
  // Get all messages organized by room
  static getAllMessages() {
    try {
      const data = fs.readFileSync(messagesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  // Get messages for a specific room
  static getMessagesByRoom(roomId) {
    const allMessages = this.getAllMessages();
    return allMessages[roomId] || [];
  }

  // Save all messages
  static saveMessages(messagesByRoom) {
    fs.writeFileSync(messagesFile, JSON.stringify(messagesByRoom, null, 2));
  }

  // Add a new message
  static addMessage(messageData) {
    const { roomId, id, userId, username, message, type, fileUrl, timestamp } = messageData;
    
    const allMessages = this.getAllMessages();
    
    if (!allMessages[roomId]) {
      allMessages[roomId] = [];
    }
    
    const newMessage = {
      id,
      userId,
      username,
      message,
      type: type || 'text',
      fileUrl: fileUrl || null,
      roomId,
      timestamp,
      deleted: false
    };
    
    allMessages[roomId].push(newMessage);
    this.saveMessages(allMessages);
    
    return newMessage;
  }

  // Delete a message (soft delete - mark as deleted)
  static deleteMessage(messageId, roomId, userId) {
    const allMessages = this.getAllMessages();
    
    if (!allMessages[roomId]) {
      return null;
    }
    
    const messageIndex = allMessages[roomId].findIndex(
      msg => msg.id === messageId && msg.userId === userId
    );
    
    if (messageIndex === -1) {
      return null;
    }
    
    // Soft delete - mark as deleted
    allMessages[roomId][messageIndex].deleted = true;
    allMessages[roomId][messageIndex].deletedAt = new Date().toISOString();
    
    this.saveMessages(allMessages);
    
    return allMessages[roomId][messageIndex];
  }

  // Get non-deleted messages for a room
  static getActiveMessagesByRoom(roomId) {
    const messages = this.getMessagesByRoom(roomId);
    return messages.filter(msg => !msg.deleted);
  }
}

module.exports = Message;

