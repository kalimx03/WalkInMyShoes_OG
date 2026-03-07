/**
 * vite.config.js — Vite 7.3.1 for WalkInMyShoes
 * A-Frame loaded as npm package. CSP handled here only (NOT in index.html).
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {

    // ─── Plugins ─────────────────────────────────────────────────────────────
    plugins: [react()],

    // ─── Path Aliases ────────────────────────────────────────────────────────
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['three'],
    },

    // ─── CSS ─────────────────────────────────────────────────────────────────
    css: {
      devSourcemap: isDev,
    },

    // ─── Dev Server ──────────────────────────────────────────────────────────
    server: {
      port: 5173,
      open: true,
      strictPort: true,

      headers: {
        // This is the ONLY place CSP should be defined.
        // index.html must NOT have a <meta http-equiv="Content-Security-Policy">.
        // Meta CSP tags override server headers and kill A-Frame's eval() calls.
        //
        // unsafe-eval  → A-Frame GLSL shader compiler uses new Function() / eval()
        // unsafe-inline → Vite HMR injects inline scripts in dev
        // No CDN URLs needed — A-Frame is an npm package, loaded locally
        'Content-Security-Policy':
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "connect-src 'self' wss: https:; " +
          "worker-src blob: 'self'; " +
          "img-src 'self' data: blob: https:; " +
          "media-src 'self' blob:; " +
          "frame-src 'self'; " +
          "font-src 'self' data:;",
      },
    },

    // ─── Dependency Pre-Bundling ──────────────────────────────────────────────
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'aframe',
        'aframe-extras',
      ],
      exclude: ['aws-amplify'],
    },

    // ─── Build ───────────────────────────────────────────────────────────────
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-aframe': ['aframe', 'aframe-extras'],
          },
        },
      },
      chunkSizeWarningLimit: 3000,
    },

    // ─── Env ─────────────────────────────────────────────────────────────────
    envPrefix: 'VITE_',
  };
});
