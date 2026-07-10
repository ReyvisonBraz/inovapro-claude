import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'backups/**',
      'scripts/**',
      'prisma/migrations/**',
      'public/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      // Hooks: erro em violação de regra; deps incompletas como aviso (limpeza gradual).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // catch {} vazio é padrão legítimo no código (ignorar erro esperado).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // console.log/info/debug proibido fora dos loggers (warn/error liberados).
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // unused-imports cuida de imports/vars não usados (auto-fix).
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Os loggers SÃO a implementação de log: console livre aqui.
    files: ['src/lib/logger.ts', 'src/lib/server-logger.ts'],
    rules: { 'no-console': 'off' },
  },
);
