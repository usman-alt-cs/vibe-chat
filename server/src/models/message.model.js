const db = require('../utils/db');

const Message = {
  create: async (senderId, receiverId, message) => {
    const result = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    );
    // Return the created message
    return db.getSingle('SELECT * FROM messages WHERE id = ?', [result.lastID]);
  },

  getConversation: async (userId1, userId2) => {
    return db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId1, userId2, userId2, userId1]
    );
  },

  getRecentConversations: async (userId) => {
    // We want the last message for each distinct user the current user has chatted with
    return db.query(
      `SELECT m.*, 
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.name, u.username
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       WHERE m.id IN (
           SELECT MAX(id)
           FROM messages
           WHERE sender_id = ? OR receiver_id = ?
           GROUP BY CASE 
                      WHEN sender_id = ? THEN receiver_id 
                      ELSE sender_id 
                    END
       )
       ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );
  }
};

module.exports = Message;
