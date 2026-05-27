// src/services/api.js

const BASE_URL = 'http://localhost:8081/api';

const apiRequest = async (endpoint, options = {}) => {
  // Automatically grab the token if it exists in local storage
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If a token exists, inject the Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  // Handle DELETE requests that return no content (204 No Content)
  if (response.status === 204) {
    return true;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
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

  // Admin methods (Journey 3 Management)
  adminGetUsers: () => apiRequest('/admin/users'),
  
  adminToggleUserStatus: (userId) => apiRequest(`/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
  }),
  
  adminDeleteSession: (sessionId) => apiRequest(`/admin/sessions/${sessionId}`, {
    method: 'DELETE',
  }),
};