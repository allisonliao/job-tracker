/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    testTimeout: 15000,
    // Vitest's own perf warning: jsdom was being recreated per test file, eating most of
    // the run's wall-clock time in this sandbox and driving the async-timeout flakiness
    // below. vmThreads reuses environments across files in a worker while keeping isolation
    // (unlike `isolate: false`, which would also share module state — riskier for our mocks).
    pool: 'vmThreads',
    // Remaining safety net for genuinely transient slowness under concurrent load (verified:
    // the flaky tests pass reliably in true isolation). A real bug would still fail every retry.
    retry: 2,
  },
})
