const User = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (users:manage - Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id username role createdAt')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get users error:', error);
    }
    
    res.status(500).json({ 
      message: 'Server error fetching users',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  getUsers,
};
