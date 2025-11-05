const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Permission Matrix based on PRD Section 5
const PERMISSIONS = {
  Admin: [
    'posts:read',
    'posts:create',
    'posts:update:any',
    'posts:delete:any',
    'users:manage',
  ],
  Editor: [
    'posts:read',
    'posts:create',
    'posts:update:own',
    'posts:delete:own',
  ],
  Viewer: [
    'posts:read',
  ],
};

// Middleware to protect routes (verify JWT)
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.userId).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware factory to authorize based on permissions
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    // Access denied by default (F-RBAC-02)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
