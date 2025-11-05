import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Validate token by fetching current user
          const response = await axios.get('/api/auth/me');
          
          setToken(storedToken);
          setUser(response.data);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      const { token: newToken, ...userData } = response.data;

      // Store token in localStorage (F-AUTH-03)
      localStorage.setItem('token', newToken);

      // Set Authorization header for all subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

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
    // Remove token from localStorage (F-AUTH-05)
    localStorage.removeItem('token');

    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];

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
