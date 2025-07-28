import axios from 'axios';

// Token storage
let authToken: string | null = localStorage.getItem('authToken');
let currentUser: string | null = localStorage.getItem('currentUser');

// Create axios instance with base configuration
const api = axios.create({
  // In development, use relative URLs to leverage the proxy configuration
  // In production, use /api prefix which will be handled by nginx
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '',
  timeout: 60000, // Increased from 10000 to 60000 (60 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions
export const setAuthToken = (token: string, username: string) => {
  authToken = token;
  currentUser = username;
  localStorage.setItem('authToken', token);
  localStorage.setItem('currentUser', username);
};

export const clearAuthToken = () => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

export const getAuthToken = () => authToken;
export const getCurrentUser = () => currentUser;
export const isAuthenticated = () => !!authToken;

// Request interceptor for adding auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    });
    
    // Add JWT token to requests if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
      
      // Handle 401 Unauthorized - clear token and redirect to login
      if (error.response.status === 401) {
        clearAuthToken();
        // You can add a redirect to login here if needed
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 