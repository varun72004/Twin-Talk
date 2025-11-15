const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, '../data/users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

class User {
  static async findById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  static async findByUsername(username) {
    const users = this.getAllUsers();
    return users.find(u => u.username === username) || null;
  }

  static async findByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  static getAllUsers() {
    try {
      const data = fs.readFileSync(usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }

  static async create(userData) {
    const { username, email, password } = userData;
    
    // Check if user already exists
    if (await this.findByUsername(username)) {
      throw new Error('Username already exists');
    }
    if (await this.findByEmail(email)) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const users = this.getAllUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = User;

