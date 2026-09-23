import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Project Pages: https://yelzhan-1.github.io/readly/  (set VITE_BASE=/readly/ in CI)
  // Local `npm run dev` stays at http://127.0.0.1:5173/
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
