import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Permission Matrix (matches PRD Section 5)
const PERMISSIONS = {
  Admin: {
    'posts:read': true,
    'posts:create': true,
    'posts:update': 'any',
    'posts:delete': 'any',
    'users:manage': true,
  },
  Editor: {
    'posts:read': true,
    'posts:create': true,
    'posts:update': 'own',
    'posts:delete': 'own',
  },
  Viewer: {
    'posts:read': true,
  },
};

// Hook to check permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const can = (action, ownerId = null) => {
    if (!user) return false;

    const userPermissions = PERMISSIONS[user.role] || {};
    const permission = userPermissions[action];

    // If permission doesn't exist, deny
    if (!permission) return false;

    // If permission is true, allow
    if (permission === true) return true;

    // If permission is 'any', allow (Admin case)
    if (permission === 'any') return true;

    // If permission is 'own', check ownership
    if (permission === 'own') {
      if (ownerId === null) return true; // No owner to check against
      return ownerId === user._id;
    }

    return false;
  };

  return { can };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Set the Authorization header
          setAuthToken(storedToken);
          
          // Validate token by fetching current user
          const response = await api.get('/api/auth/me');
          
          setToken(storedToken);
          setUser(response.data);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      const { token: newToken, ...userData } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Set Authorization header for all subsequent requests
      setAuthToken(newToken);

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Remove Authorization header
    setAuthToken(null);

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
