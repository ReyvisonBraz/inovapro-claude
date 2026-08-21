import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Suíte de INTEGRAÇÃO: roda contra PostgreSQL real (Postgres descartável no CI,
 * container local via scripts/test-db.sh). Provam invariantes financeiros, de
 * estoque e de concorrência que os testes unitários (prisma mockado) não provam.
 *
 * Padrão de arquivo: `*.itest.ts` sob src/test/integration/ — o vitest.config.ts
 * padrão (unit) não os captura, mantendo o verify rápido e sem banco.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/integration/**/*.itest.ts'],
    setupFiles: ['./src/test/integration/setup.ts'],
    globals: true,
    // Sequencial por arquivo: cada suíte TRUNCATE o banco; nunca paralelizar.
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});