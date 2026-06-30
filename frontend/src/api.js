// API Configuration and Fetch Wrapper
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// API endpoints
const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    health: '/health',
    hello: '/hello',
    // Authentication endpoints
    login: '/api/auth/login',
    verifyToken: '/api/auth/verify-token',
    getCurrentUser: '/api/auth/me',
  },
};

// Generic API call helper
export const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add authorization header if token is provided
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Check if response is ok
    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.detail || 'API request failed';
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  login: (phone) => {
    return apiCall(apiConfig.endpoints.login, 'POST', { phone });
  },

  verifyToken: (token) => {
    return apiCall(apiConfig.endpoints.verifyToken, 'POST', { token });
  },

  getCurrentUser: (token) => {
    return apiCall(apiConfig.endpoints.getCurrentUser, 'GET', null, token);
  },
};

// Health check
export const healthCheck = () => {
  return apiCall(apiConfig.endpoints.health);
};

// Hello endpoint
export const sayHello = () => {
  return apiCall(apiConfig.endpoints.hello);
};

export default apiConfig;
