import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // A atualização é controlada pela interface da aplicação. Isso evita que
        // uma aba continue executando um bundle antigo sem avisar o usuário.
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['icons/*.svg'],
        manifest: {
          name: 'INOVA PRO',
          short_name: 'INOVA',
          description: 'Sistema de gestão financeira e ordens de serviço',
          theme_color: '#070b14',
          background_color: '#070b14',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          runtimeCaching: [
            // Dados operacionais (OS, clientes, estoque e pagamentos) não devem
            // ser armazenados pelo service worker. O React Query já mantém um
            // cache curto em memória; um cache persistente aqui pode mostrar uma
            // lista antiga após uma gravação ou entre versões do aplicativo.
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['motion'],
            'chart-vendor': ['recharts'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers'],
            'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          },
        },
      },
      target: 'es2022',
    },
    optimizeDeps: {
      include: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});
