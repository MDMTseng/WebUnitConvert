import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global APIs like describe, test, expect
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.js', // Path to setup file
    // Optional: Configure coverage
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      // Optional thresholds
      // lines: 80,
      // functions: 80,
      // branches: 80,
      // statements: 80,
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/main.jsx', // Entry point usually doesn't need coverage
        'src/**/*.d.ts',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/setupTests.js',
        'src/vite-env.d.ts',
        // Add other exclusions as needed
      ],
    },
  },
}); 