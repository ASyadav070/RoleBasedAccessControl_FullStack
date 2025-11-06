import axios from 'axios';

// Get API base URL from environment variable or default to localhost
const getApiBaseURL = () => {
  // Vite exposes env vars prefixed with VITE_
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authContextSetToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Function to set the auth token updater from AuthContext (F-V2-AUTH-05)
export const setAuthContextUpdater = (updateTokenFn) => {
  authContextSetToken = updateTokenFn;
};

// Function to set authorization header (F-V2-AUTH-04)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh or login endpoints to prevent infinite loops
    if (
      originalRequest.url === '/api/auth/refresh' || 
      originalRequest.url === '/api/auth/login' ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        const response = await api.post('/api/auth/refresh');
        const { accessToken, user } = response.data;

        // Update the authorization header with new token
        setAuthToken(accessToken);

        // Notify AuthContext of the new token
        if (authContextSetToken) {
          authContextSetToken(accessToken, user);
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth state
        processQueue(refreshError, null);
        setAuthToken(null);
        
        if (authContextSetToken) {
          authContextSetToken(null, null);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
