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
      
        // Mettre en cache les assets du projet 
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}', 'images/*.{jpg,png,webp}'],
      },
      
      // Configuration Manifest
      manifest: {
        name: 'GAP Caisse',
        short_name: 'GAP',
        theme_color: '#ffffff',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    })

  ],
})
