import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
      '/tmdb': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmdb/, ''),
        headers: env.VITE_TMDB_ACCESS_TOKEN
          ? { Authorization: `Bearer ${env.VITE_TMDB_ACCESS_TOKEN}` }
          : {},
        logLevel: 'info',
      },
    },
  },
};
});
