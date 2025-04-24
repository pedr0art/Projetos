import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: true, // permite acesso externo via IP local
    port: 5173  // porta padrão do Vite
  },
  plugins: [react()]
});
