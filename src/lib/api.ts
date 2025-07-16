const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  console.log('Getting auth token:', token ? 'Token exists' : 'No token found');
  return token;
};

// Set auth token in localStorage
const setAuthToken = (token: string) => {
  console.log('Setting auth token:', token ? 'Token set' : 'Empty token');
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  console.log('Removing auth token');
  localStorage.removeItem('auth_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}, requireAuth: boolean = true) => {
  const token = getAuthToken();
  console.log('Making API request to:', endpoint, 'with token:', token ? 'Present' : 'Missing');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(requireAuth && token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('Request headers:', config.headers);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    console.error('API request failed:', response.status, response.statusText);
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('Error details:', error);
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false); // Don't require auth for login
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  },

  getCurrentUser: () => apiRequest('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  create: (userData: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id: string) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Kambing API
export const kambingAPI = {
  getAll: () => apiRequest('/kambing'),
  getById: (id: string) => apiRequest(`/kambing/${id}`),
  create: (data: any) => apiRequest('/kambing', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/kambing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/kambing/${id}`, {
    method: 'DELETE',
  }),
};

// Kandang API
export const kandangAPI = {
  getAll: () => apiRequest('/kandang'),
  create: (data: any) => apiRequest('/kandang', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/kandang/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/kandang/${id}`, {
    method: 'DELETE',
  }),
  recordGate: (kandangId: string, kambingId: string) => apiRequest(`/kandang/${kandangId}/gate`, {
    method: 'POST',
    body: JSON.stringify({ kambing_id: kambingId }),
  }),
};

// Vaksin API
export const vaksinAPI = {
  getAll: () => apiRequest('/vaksin'),
  create: (data: any) => apiRequest('/vaksin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/vaksin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/vaksin/${id}`, {
    method: 'DELETE',
  }),
};

// Vaksinisasi API
export const vaksinisasiAPI = {
  getAll: () => apiRequest('/vaksinisasi'),
  getById: (id: string) => apiRequest(`/vaksinisasi/${id}`),
  create: (data: any) => apiRequest('/vaksinisasi', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/vaksinisasi/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/vaksinisasi/${id}`, {
    method: 'DELETE',
  }),
};

// History API
export const historyAPI = {
  getGateHistory: () => apiRequest('/history/gate'),
  getGateHistoryById: (id: string) => apiRequest(`/history/gate/${id}`),
  updateGateHistory: (id: string, data: any) => apiRequest(`/history/gate/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteGateHistory: (id: string) => apiRequest(`/history/gate/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => apiRequest('/history/stats'),
};

export { getAuthToken, setAuthToken, removeAuthToken };