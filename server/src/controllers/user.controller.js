const User = require('../models/user.model');

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const users = await User.search(q, req.userId);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username } = req.body;

    if (!name || name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    if (!username || username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters long' });

    // Check if new username is taken
    const existing = await User.findByUsername(username);
    if (existing && existing.id !== req.userId) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    await User.updateProfile(req.userId, name, username);
    
    const updatedUser = await User.findById(req.userId);
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
