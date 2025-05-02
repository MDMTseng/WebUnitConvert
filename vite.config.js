import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Custom plugin to copy CNAME file to build output
const copyCustomFiles = () => {
  return {
    name: 'copy-custom-files',
    closeBundle: () => {
      const cnameContent = 'unitconverter.xception.tech';
      const outDir = 'docs';
      const cnamePath = path.resolve(outDir, 'CNAME');
      
      // Create CNAME file in build output
      fs.writeFileSync(cnamePath, cnameContent);
      console.log('✓ CNAME file created in build output');
    }
  }
};

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    visualizer({
      filename: 'docs/stats.html',
      open: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Unit Converter Pro',
        short_name: 'UnitConv',
        description: 'A comprehensive unit converter application.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Option 1: Increase the maximum file size for precaching
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB
        
        // Option 2: Exclude stats.html from precaching
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/stats.html']
      }
    }),
    copyCustomFiles()
  ],
  build: {
    outDir: 'docs',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
