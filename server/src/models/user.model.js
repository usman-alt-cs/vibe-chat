const db = require('../utils/db');
const bcrypt = require('bcrypt');

const User = {
  create: async (user) => {
    const { name, username, email, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.execute(
      'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
      [name, username, email, hashedPassword]
    );
    return result.lastID;
  },

  findByEmail: async (email) => {
    return db.getSingle('SELECT * FROM users WHERE email = ?', [email]);
  },

  findByUsername: async (username) => {
    return db.getSingle('SELECT * FROM users WHERE username = ?', [username]);
  },

  findById: async (id) => {
    return db.getSingle('SELECT id, name, username, email, created_at FROM users WHERE id = ?', [id]);
  },

  findPasswordById: async (id) => {
    return db.getSingle('SELECT password FROM users WHERE id = ?', [id]);
  },

  updateProfile: async (id, name, username) => {
    await db.execute(
      'UPDATE users SET name = ?, username = ? WHERE id = ?',
      [name, username, id]
    );
  },

  updatePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  },

  search: async (query, currentUserId) => {
    // Only search by username or name, limited to 20 results, excluding the current user.
    return db.query(
      `SELECT id, name, username FROM users 
       WHERE id != ? AND (username LIKE ? OR name LIKE ?) 
       LIMIT 20`,
      [currentUserId, `%${query}%`, `%${query}%`]
    );
  }
};

module.exports = User;
