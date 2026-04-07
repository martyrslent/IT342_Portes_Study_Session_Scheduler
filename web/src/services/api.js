// src/services/api.js

const BASE_URL = 'http://localhost:8081/api';

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Network response was not ok');
  }
  return response.json();
};

// This object acts as a Service Facade
export const apiService = {
  // Session methods
  getSessions: () => apiRequest('/sessions'),
  createSession: (sessionData) => apiRequest('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),

  // Auth methods
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};