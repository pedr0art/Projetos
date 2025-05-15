import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // importante para build do Electron
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: false // ← ESSENCIAL
  }
});
