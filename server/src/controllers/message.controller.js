const Message = require('../models/message.model');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.getRecentConversations(req.userId);
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    const messages = await Message.getConversation(req.userId, userId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { userId } = req.params; // Receiver ID
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = await Message.create(req.userId, userId, message.trim());
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
