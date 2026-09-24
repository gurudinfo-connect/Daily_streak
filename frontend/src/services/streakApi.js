import apiClient from './apiClient';

// Centralized API layer — components never call axios/fetch directly.
export const getStreak = () => apiClient.get('/daily-streak').then((r) => r.data);
export const getStatus = () => apiClient.get('/daily-streak/status').then((r) => r.data);
export const claimStreak = (day) => apiClient.post('/daily-streak/claim', { day }).then((r) => r.data);
export const getHistory = () => apiClient.get('/daily-streak/history').then((r) => r.data);
