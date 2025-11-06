const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide both username and password' 
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // Respond with user info (non-sensitive) and token
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    // Log error details in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }
    
    res.status(500).json({ 
      message: 'Server error during login',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    res.json({
      _id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get user error:', error);
    }
    
    res.status(500).json({ 
      message: 'Server error fetching user data',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  loginUser,
  getMe,
};
