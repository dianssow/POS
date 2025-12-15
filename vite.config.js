import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "tailwindcss";
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  plugins: [react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      
      workbox: {
        // Caching  images for (http://localhost:3000/uploads/...)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === import.meta.env.VITE_API_URL && url.pathname.startsWith('/uploads/'),
            
            // Cache First (Essaie d'abord le cache, puis le réseau)
            handler: 'CacheFirst',

            options: {
              cacheName: 'produits-images-cache',
              expiration: {
                maxEntries: 500, 
                maxAgeSeconds: 30 * 24 * 60 * 60, 
              },
              cacheableResponse: {
                statuses: [0, 200], 
              },
            },
          },
        ],
        // Mettre en cache les assets du projet 
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}', 'images/*.{jpg,png,webp}'],
      },
      
      // Configuration Manifest
      manifest: {
        name: 'Madina POS Offline',
        short_name: 'POS',
        theme_color: '#ffffff',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    })

  ],
})
