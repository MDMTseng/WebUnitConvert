import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    // Add length and key if needed by tests
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Assign the mock to the global object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true // Allow tests to potentially spy/modify if necessary
});

// You can add other global mocks or setup here if needed
// For example, mocking fetch:
// global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}) })); 