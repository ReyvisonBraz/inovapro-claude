# Fase 4 · Tarefa 03 — Smoke E2E com Playwright (M7)

**Goal:** Ter ao menos um fluxo ponta-a-ponta automatizado. `playwright` já está no `devDependencies`, mas não há config nem specs. Um smoke E2E pega regressões que testes de unidade não veem (roteamento, auth real, render).

**Architecture:** Config do Playwright que sobe a API + o front (via `webServer`) e roda specs em `e2e/`. Primeiro fluxo: login → dashboard → criar uma OS → abrir o rastreio público por token. Roda localmente e, opcionalmente, em CI (job separado).

## Interfaces

- **Produz:** `playwright.config.ts`; `e2e/smoke.spec.ts`; scripts `e2e`, `e2e:ui`.

---

- [ ] **Step 1: Instalar os browsers do Playwright**

Run:
```powershell
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Config do Playwright**

Crie `playwright.config.ts` na raiz:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev:frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
```
> `@playwright/test` acompanha o pacote `playwright`. Se faltar, `npm i -D @playwright/test`.

- [ ] **Step 3: Scripts no `package.json`**

```json
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
```

- [ ] **Step 4: Spec de smoke — login e dashboard (primeiro, o mínimo verde)**

Crie `e2e/smoke.spec.ts`. Use credenciais de um usuário de teste (defina via env `E2E_USER`/`E2E_PASS`, não hardcode senha real):

```ts
import { test, expect } from '@playwright/test';

const USER = process.env.E2E_USER || 'admin';
const PASS = process.env.E2E_PASS || 'changeme';

test('login leva ao dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/login|usuário|usuario/i).fill(USER);
  await page.getByLabel(/senha/i).fill(PASS);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```
> Ajuste os seletores (`getByLabel`/`getByRole`) aos textos reais do `Login.tsx`. Prefira seletores acessíveis; se faltar `aria-label`, adicione-os (melhora a11y também).

- [ ] **Step 5: Rodar o smoke**

Run:
```powershell
$env:E2E_USER='admin'; $env:E2E_PASS='SUA_SENHA_DE_TESTE'; npm run e2e
```
Esperado: 1 teste verde. O `webServer` sobe API+front automaticamente.

- [ ] **Step 6: Ampliar o fluxo — criar OS e abrir rastreio público**

Adicione ao spec um teste que: navega para Ordens, cria uma OS mínima, captura o link/QR de rastreio (`?t=<token>`) e abre a página pública verificando que o status aparece. Isso exercita a mudança da Fase 2 (token) ponta-a-ponta.

- [ ] **Step 7: (Opcional) Job de E2E no CI**

Adicione um job separado no `ci.yml` (não bloqueante no início) que roda `npx playwright install --with-deps chromium` e `npm run e2e`, com `E2E_USER`/`E2E_PASS` vindos de secrets e um banco de teste dedicado. Mantenha `continue-on-error: true` até estabilizar.

- [ ] **Step 8: Ignorar artefatos**

Adicione ao `.gitignore`:
```
/test-results/
/playwright-report/
/e2e/.auth/
```

- [ ] **Step 9: Commit**

```powershell
git add playwright.config.ts e2e/ package.json .gitignore .github/workflows/ci.yml
git commit -m @'
test(e2e): smoke Playwright (login -> dashboard -> OS -> rastreio publico)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `npm run e2e` verde localmente com ao menos o fluxo de login.
- [ ] Fluxo de OS + rastreio público por token coberto.
- [ ] Artefatos do Playwright fora do git.

## Nota

- E2E é sensível a dados/ambiente. Rode contra um banco de dev/teste, nunca produção. Use um usuário de teste dedicado e senha via env.
