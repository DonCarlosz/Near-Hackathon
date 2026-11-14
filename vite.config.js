import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'window',
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/Post Artifacts/**', '**/*.mp4', '**/*.mp3']
    }
  }
});
