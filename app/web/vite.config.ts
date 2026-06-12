import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API = `http://127.0.0.1:${process.env.PORT ?? 4777}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5183,
    proxy: {
      '/api': {
        target: API,
        changeOrigin: true,
        // SSE precisa de streaming sem buffer
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.setHeader('Accept-Encoding', 'identity'));
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
