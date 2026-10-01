import axios from 'axios';

export const TOKEN_KEY = 'shopsphere_token';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // An expired/invalid token on a protected call signs the user out everywhere.
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('shopsphere:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error.response) return error.response.data?.message || fallback;
  if (error.request) return 'Cannot reach the server. Check your connection and that the API is running.';
  return fallback;
};

export default api;
