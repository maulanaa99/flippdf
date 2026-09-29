import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'page-flip', 'qrcode'],
  },
  build: {
    target: 'esnext',
  }
});
