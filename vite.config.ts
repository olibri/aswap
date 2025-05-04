import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills';



// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),     nodePolyfills() ],
  define: {
    'process.env': {}
  },

 base: "/",
 preview: {
  port: 8080,
  strictPort: true,
 },
 server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8085',
      changeOrigin: true,
      secure: false,
    },
  },
  port: 8080,
  strictPort: true,
  host: true,
  origin: "http://0.0.0.0:8080",
 },
})
