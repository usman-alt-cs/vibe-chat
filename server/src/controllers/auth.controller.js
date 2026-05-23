const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    if (!username || username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long' });

    // Check existing
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: 'Email already exists' });

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) return res.status(400).json({ error: 'Username already exists' });

    await User.create({ name, username, email, password });
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const userRow = await User.findPasswordById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, userRow.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    await User.updatePassword(req.userId, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // In JWT, logout is typically handled client-side by deleting the token.
  // This endpoint is just for API completeness.
  res.json({ message: 'Logged out successfully' });
};
