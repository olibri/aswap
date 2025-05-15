import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills';



// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: { 'process.env': {} },

  base: '/',              
  preview: {
    port: 8080,
    strictPort: true,
  },

  server: {
    host: true,
    port: 8080,
    strictPort: true,
    origin: 'http://localhost:8080',

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
