import axios from 'axios';

// Determine API base URL based on environment
let baseURL = '';

if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
  // Production: use Render backend
  baseURL = 'https://industry-newsletter-backend.onrender.com';
} else {
  // Development: use Vite proxy (empty string = /api proxied to localhost:5002)
  baseURL = '';
}

const api = axios.create({ baseURL });

export default api;
