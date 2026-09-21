import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Do not ask Vite to spawn the default browser on Windows.
    // Open http://localhost:5173 manually instead.
    open: false,
  },
});
