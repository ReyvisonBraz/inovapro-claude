import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/hooks/**',
        'src/lib/**',
        'src/store/**',
        'src/routes/**',
        'src/services/**',
        'src/middleware/**',
        'src/schemas/**',
      ],
      exclude: ['src/test/**', '**/*.d.ts'],
      // Catraca de qualidade: piso real medido (2026-07-09). Só sobe — nunca desce.
      // Aumentar a cada suíte de integração adicionada (F4-02).
      thresholds: {
        statements: 18,
        branches: 13,
        functions: 10,
        lines: 18,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
