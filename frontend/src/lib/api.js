import axios from 'axios';

// In development, VITE_API_URL is empty and Vite's proxy forwards /api → localhost:5000.
// In production, VITE_API_URL is the Render backend URL (e.g. https://your-app.onrender.com).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
