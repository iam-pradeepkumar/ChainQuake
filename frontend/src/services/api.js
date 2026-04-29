import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const companiesApi = {
  getAll: () => api.get('/companies'),
  getOne: (id) => api.get(`/companies/${id}`),
};

export const riskApi = {
  getData: () => api.get('/risk'),
  getGraph: () => api.get('/risk/graph'),
};

export const alertsApi = {
  getAll: () => api.get('/alerts'),
};

export const newsApi = {
  getAll: () => api.get('/news'),
};

export const simulateApi = {
  run: (data) => api.post('/simulate', data),
  reset: () => api.post('/simulate/reset'),
};

export const chatApi = {
  send: (message) => api.post('/chat', { message }),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (token) => api.post('/auth/google', null, { headers: { Authorization: `Bearer ${token}` } }),
  getUsers: () => api.get('/auth/users'),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
