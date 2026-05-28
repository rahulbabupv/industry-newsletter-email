import axios from 'axios';

// Determine API base URL
// In production (Vercel): use Render backend
// In development (localhost): use Vite proxy (empty = /api)
let baseURL = 'https://industry-newsletter-backend.onrender.com';

// Only use Vite proxy in local development
if (import.meta.env.MODE === 'development' && window.location.hostname === 'localhost') {
  baseURL = '';
}

console.log('API baseURL:', baseURL, 'Hostname:', window.location.hostname, 'Mode:', import.meta.env.MODE);

const api = axios.create({ baseURL });

export default api;
