/* =============================================================================
   CommerceOS — Test Setup
   =============================================================================
   Global test configuration for Vitest with Testing Library.
   ============================================================================= */

import '@testing-library/jest-dom/vitest';

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Suppress specific console errors during tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress act() warnings from React 19
  if (typeof args[0] === 'string' && args[0].includes('inside a test was not wrapped in act')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
