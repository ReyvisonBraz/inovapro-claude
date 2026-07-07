# Fase 3 · Tarefa 01 — ESLint real (flat config) (M9)

**Goal:** Ter linting de verdade. Hoje `"lint": "tsc --noEmit"` (só tipos) e existe `eslint-plugin-unused-imports` no `devDependencies` **sem** ESLint instalado nem config. Sem lint, bugs de dependências de hooks, imports mortos e `console` esquecido passam batido.

**Architecture:** ESLint 9 com flat config (`eslint.config.js`), TypeScript-ESLint, `eslint-plugin-react-hooks` (pega `useEffect` com deps erradas — vários no código) e `eslint-plugin-unused-imports`. Separamos os scripts: `lint` = ESLint, `typecheck` = `tsc` (criado na Fase 0). CI roda os dois.

## Interfaces

- **Produz:** `eslint.config.js`; scripts `lint`, `lint:fix`; CI atualizado.

---

- [ ] **Step 1: Instalar ESLint e plugins**

Run:
```powershell
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals
```
(`eslint-plugin-unused-imports` já está no projeto.)

- [ ] **Step 2: Criar `eslint.config.js` (flat config)**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'supabase/**', 'backups/**', 'scripts/**', 'prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'unused-imports': unusedImports },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
```
> Começamos com `no-explicit-any` e `no-console` como **`warn`** (não `error`) para não travar o CI de imediato — a Tarefa 02 zera os warnings e aí podemos promover a `error`.

- [ ] **Step 3: Ajustar os scripts do `package.json`**

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "verify": "eslint . && tsc --noEmit && vitest run",
```
> `verify` agora inclui lint. Se o volume de warnings for grande, mantenha `verify` sem falhar em warning (ESLint só falha em `error`); os `error` já configurados são `no-unused-imports` e regras recomendadas.

- [ ] **Step 4: Rodar o ESLint e medir**

Run:
```powershell
npm run lint
```
Esperado: lista de problemas. Anote quantos `error` vs `warning`. **Corrija os `error`** agora (provavelmente imports não usados e algumas regras recomendadas). Use `npm run lint:fix` para os auto-corrigíveis.

- [ ] **Step 5: Corrigir os `error` restantes até `npm run lint` sair limpo de erros**

Trate um arquivo por vez. `react-hooks/rules-of-hooks` como `error` pode apontar violações reais — corrija-as (não silencie). Se algum `warning` de deps for tecnicamente correto suprimir, use `// eslint-disable-next-line react-hooks/exhaustive-deps` com comentário justificando.

- [ ] **Step 6: Atualizar o CI**

Em `.github/workflows/ci.yml`, troque o passo "TypeScript check" por dois passos:

```yaml
      - name: Lint
        run: npm run lint

      - name: TypeScript check
        run: npm run typecheck
```

- [ ] **Step 7: Gate**

Run:
```powershell
npm run verify
```
Esperado: ESLint sem `error`, `tsc` 0 erros, testes verdes.

- [ ] **Step 8: Commit**

```powershell
git add eslint.config.js package.json package-lock.json .github/workflows/ci.yml
git commit -m @'
chore(lint): adiciona ESLint (flat config) com react-hooks e unused-imports

- lint = eslint; typecheck = tsc (separados)
- CI roda lint + typecheck + testes
- no-console e no-explicit-any como warning (zerados na proxima tarefa)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `npm run lint` roda ESLint e sai sem `error`.
- [ ] CI executa lint e typecheck separados.
- [ ] Contagem de warnings registrada (baseline para a Tarefa 02).
