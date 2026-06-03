import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://movie-box.co/wefeed-h5api-bff',
        changeOrigin: true,
        rewrite: (path) => {
          const rewritten = path.replace(/^\/api/, '');
          console.log(`[Vite Proxy] ${path} → ${rewritten}`);
          return rewritten;
        },
        headers: {
          Origin: 'https://movie-box.co',
          Referer: 'https://movie-box.co/',
          'User-Agent': 'Mozilla/5.0',
          'X-Client-Info': '{"timezone":"Asia/Calcutta"}',
        },
        logLevel: 'info',
      },
      '/stream-api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stream-api/, ''),
        logLevel: 'info',
      },
    },
  },
});
