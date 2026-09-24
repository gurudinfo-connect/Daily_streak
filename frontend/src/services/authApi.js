import apiClient from './apiClient';

export const login = (email, password) => apiClient.post('/auth/login', { email, password }).then((r) => r.data);
export const register = (email, password, name) =>
  apiClient.post('/auth/register', { email, password, name }).then((r) => r.data);
export const getMe = () => apiClient.get('/auth/me').then((r) => r.data);
