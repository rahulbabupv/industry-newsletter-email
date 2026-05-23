import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // During development, forward /api/* requests to the Express backend
    // so the frontend never has to know the backend URL.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // Help Vite bundle jsPDF and html2canvas correctly
  optimizeDeps: {
    include: ['jspdf', 'html2canvas'],
  },
});
