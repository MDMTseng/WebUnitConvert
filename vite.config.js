import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs', // Specify the output directory
  },
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/tests/setup.js', // Optional setup file
  },
})
