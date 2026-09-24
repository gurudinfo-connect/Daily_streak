import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://daily-streak-black.vercel.app/login/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
