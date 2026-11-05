// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// En desarrollo, /api/* se reenvía a nutricio_backend (Django) para evitar CORS.
// En producción define PUBLIC_API_URL (URL absoluta) o sirve ambos tras el mismo dominio.
const BACKEND = env.BACKEND_URL || 'http://127.0.0.1:8000';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/api': { target: BACKEND, changeOrigin: true },
      },
      allowedHosts: ['ablaze-acorn-retiree.ngrok-free.dev'],
    },
  },
});
