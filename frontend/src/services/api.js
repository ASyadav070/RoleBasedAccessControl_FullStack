import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true, // F-V2-API-03: Enable sending cookies
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

// Response interceptor for automatic token refresh (F-V2-AUTH-05)
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // CRITICAL: Don't try to refresh if the failed request was the refresh endpoint itself
    // This prevents an infinite loop
    if (originalRequest.url === '/api/auth/refresh' || originalRequest.url === '/api/auth/login') {
      return Promise.reject(error);
    }

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // F-V2-AUTH-05: Attempt to refresh the access token
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
        // If refresh fails, user needs to log in again
        console.error('Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear auth state
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
