import axios from 'axios';
import { mockDsaBackend } from './mockDsaBackend';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_hostel_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seamless fallback: If backend server is offline or not deployed separately (e.g. on Vercel),
// the in-browser DSA engine automatically executes all queries, data structures, and algorithms!
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkOrNotFound = !error.response || error.response.status === 404 || error.response.status >= 500;

    if (isNetworkOrNotFound && config) {
      try {
        console.warn(`[SmartHostel] Backend offline or 404 for ${config.url}. Using In-Browser DSA Engine.`);
        const method = config.method || 'get';
        const url = config.url || '';
        let requestData = config.data;
        if (typeof requestData === 'string') {
          try {
            requestData = JSON.parse(requestData);
          } catch (e) {
            // Keep raw string
          }
        }
        const mockResult = await mockDsaBackend.handleRequest(method, url, requestData);
        return {
          data: mockResult,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } catch (mockErr) {
        console.error('[SmartHostel] In-browser fallback error:', mockErr);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('smart_hostel_token');
      localStorage.removeItem('smart_hostel_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
