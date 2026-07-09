# Fase 1 · Tarefa 01 — Autorização RBAC no backend (B1)

**Goal:** Fazer o backend **negar** ações para quem não tem a role/permissão, fechando a escalada de privilégio em que um `employee` cria usuário `owner`, apaga usuários e deleta qualquer registro.

**Architecture:** Os middlewares `requireRole` e `requirePermission` já existem em [../../../src/middleware/roles.ts](../../../src/middleware/roles.ts) — só nunca foram usados. Aplicamos autorização em **nível de montagem** no agregador [../../../src/routes/index.ts](../../../src/routes/index.ts): cada router de feature ganha `requirePermission(<feature>)`, e os routers administrativos (`users`, `settings`, `audit-logs`, `debug`) ganham `requireRole('owner')`. Dois routers de dados de referência (`catalog`, `categories`) recebem guarda interna. `requireAuth` global já roda antes (em `server.ts`), então `req.user` está disponível.

**Decisão de projeto (documentar):** a autorização do backend é **baseada em role** (`ROLE_PERMISSIONS[role]` em `roles.ts`), porque o JWT carrega apenas `role` (ver [../../../src/middleware/auth.ts](../../../src/middleware/auth.ts) `JwtPayload`). O frontend usa permissões por usuário; o backend usa as permissões da role. É suficiente e seguro para fechar o buraco agora. Um refinamento (embutir `permissions` no JWT) fica para fase posterior — **fora do escopo desta tarefa**.

## Mapa de autorização (a fonte da verdade desta tarefa)

| Mount em `index.ts` | Middleware | Roles que passam |
|---------------------|-----------|------------------|
| `/users` | `requireRole('owner')` | owner |
| `/settings` | `requireRole('owner')` | owner |
| `/audit-logs` | `requireRole('owner')` | owner |
| `/debug` | `requireRole('owner')` | owner |
| `/transactions` | `requirePermission('manage_transactions')` | owner, manager, employee |
| `/client-payments` | `requirePermission('manage_payments')` | owner, manager, employee |
| `/service-orders` | `requirePermission('manage_service_orders')` | owner, manager, employee |
| `/customers` | `requirePermission('manage_customers')` | owner, manager, employee |
| `/inventory` | `requirePermission('manage_inventory')` | owner, manager, employee |
| `/stats` | `requirePermission('view_dashboard')` | owner, manager, employee |
| `/export-all` | `requirePermission('view_reports')` | owner, manager |
| `/receipts` | `requirePermission('manage_payments')` | owner, manager, employee |
| `/ai` | (só `requireAuth`) | qualquer autenticado *(rate-limit vem na Fase 2)* |
| `/` (catalog) | guarda interna: `requirePermission('manage_service_orders')` | owner, manager, employee |
| `/categories` | GET aberto; `POST`/`DELETE`: `requireRole('owner','manager')` | escrita: owner, manager |

> `manager` e `employee` **não** têm `manage_settings` nem `manage_users` em `ROLE_PERMISSIONS`, então `requireRole('owner')` nesses mounts os bloqueia corretamente. `employee` não tem `view_reports`, então não exporta — comportamento desejado.

## Interfaces

- **Consome:** `requireRole(...roles)`, `requirePermission(permission)` de `../../../src/middleware/roles.ts` (assinaturas já existentes: retornam `(req, res, next) => void`, respondem 401 se `!req.user`, 403 se sem permissão).
- **Produz:** `src/routes/index.ts` com a cadeia de autorização; nenhuma assinatura pública muda; as URLs continuam idênticas.

---

- [ ] **Step 1: Instalar supertest (dependência de teste HTTP)**

Run:
```powershell
npm install -D supertest @types/supertest
```
Esperado: adiciona ambos em `devDependencies`. Confirme com `npm ls supertest`.

- [ ] **Step 2: Escrever o teste de autorização (vai FALHAR)**

Crie `src/test/authz.routes.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Prisma e storage são mockados: este teste valida SÓ a camada de
// autorização (401/403), que roda ANTES de qualquer handler tocar o banco.
vi.mock('../lib/prisma.js', () => {
  const model = new Proxy({}, { get: () => vi.fn().mockResolvedValue([]) });
  const prisma = new Proxy({}, {
    get: (_t, prop) =>
      typeof prop === 'string' && prop.startsWith('$')
        ? vi.fn().mockImplementation(async (arg: any) =>
            typeof arg === 'function' ? arg(model) : [])
        : model,
  });
  return { prisma, default: prisma };
});
vi.mock('../lib/storage.js', () => ({
  uploadPhotoToStorage: vi.fn(),
  isStorageConfigured: () => false,
}));

import protectedRoutes from '../routes/index';

// App de teste: injeta um req.user configurável (stub do requireAuth global).
function appAs(user: { userId: number; username: string; role: string } | null) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { if (user) (req as any).user = user; next(); });
  app.use('/api', protectedRoutes);
  return app;
}

const owner = { userId: 1, username: 'admin', role: 'owner' };
const manager = { userId: 2, username: 'gerente', role: 'manager' };
const employee = { userId: 3, username: 'func', role: 'employee' };

describe('Autorização por rota (RBAC)', () => {
  it('employee NÃO pode criar usuário (owner-only) → 403', async () => {
    const res = await request(appAs(employee))
      .post('/api/users')
      .send({ username: 'x', password: 'y', role: 'owner', name: 'X' });
    expect(res.status).toBe(403);
  });

  it('manager NÃO pode listar usuários → 403', async () => {
    const res = await request(appAs(manager)).get('/api/users');
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode alterar configurações → 403', async () => {
    const res = await request(appAs(employee)).post('/api/settings').send({ appName: 'hack' });
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode ler audit logs → 403', async () => {
    const res = await request(appAs(employee)).get('/api/audit-logs');
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode exportar (view_reports) → 403', async () => {
    const res = await request(appAs(employee)).get('/api/export-all');
    expect(res.status).toBe(403);
  });

  it('employee PODE acessar transações (tem manage_transactions) → não 403/401', async () => {
    const res = await request(appAs(employee)).get('/api/transactions');
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });

  it('owner PODE criar usuário → não 403/401', async () => {
    const res = await request(appAs(owner))
      .post('/api/users')
      .send({ username: 'novo', password: 'senha123', role: 'employee', name: 'Novo' });
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });

  it('requisição sem usuário autenticado → 401 em rota protegida', async () => {
    const res = await request(appAs(null)).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Rodar o teste e ver FALHAR**

Run:
```powershell
npx vitest run src/test/authz.routes.test.ts
```
Esperado: os casos "→ 403" **falham** (hoje retornam 2xx/5xx porque não há autorização). Isto prova que o teste captura o buraco.

- [ ] **Step 4: Aplicar autorização no agregador de rotas**

Edite `src/routes/index.ts`. Adicione o import e envolva cada mount conforme o mapa. Substitua o bloco de `router.use(...)` por:

```ts
import { requireRole, requirePermission } from '../middleware/roles.js';

// ... (imports de rotas existentes permanecem) ...

// Administrativo — somente owner
router.use('/users', requireRole('owner'), usersRoutes);
router.use('/settings', requireRole('owner'), settingsRoutes);
router.use('/audit-logs', requireRole('owner'), auditLogRoutes);
router.use('/debug', requireRole('owner'), debugRoutes);

// Features — por permissão de role
router.use('/transactions', requirePermission('manage_transactions'), transactionsRoutes);
router.use('/client-payments', requirePermission('manage_payments'), clientPaymentsRoutes);
router.use('/service-orders', requirePermission('manage_service_orders'), serviceOrdersRoutes);
router.use('/customers', requirePermission('manage_customers'), customersRoutes);
router.use('/inventory', requirePermission('manage_inventory'), inventoryRoutes);
router.use('/stats', requirePermission('view_dashboard'), statsRoutes);
router.use('/export-all', requirePermission('view_reports'), exportRoutes);
router.use('/receipts', requirePermission('manage_payments'), receiptsRoutes);

// Referência / IA
router.use('/categories', categoriesRoutes);   // guarda de escrita dentro do arquivo
router.use('/', catalogRoutes);                 // guarda dentro do arquivo (Step 5)
router.use('/ai', aiRoutes);                    // qualquer autenticado (rate-limit na Fase 2)
```

> Preserve a ordem: registre `catalogRoutes` (mount `'/'`) **por último** entre os que usam `'/'`, como já está hoje, para não interceptar as demais features.

- [ ] **Step 5: Guardar as escritas do catálogo (uma linha)**

Edite `src/routes/catalog.ts`. Logo após `const router = Router();`, adicione:

```ts
import { requirePermission } from '../middleware/roles.js';

// Todo o catálogo é configuração de OS: exige manage_service_orders.
router.use(requirePermission('manage_service_orders'));
```
(`router.use(mw)` sem path aplica a todas as rotas **deste** router apenas. `employee` tem `manage_service_orders`, então as leituras de marcas/modelos/tipos/status continuam funcionando.)

- [ ] **Step 6: Guardar as escritas de categorias**

Edite `src/routes/categories.ts`. Adicione o import e insira `requireRole('owner', 'manager')` **como 2º argumento** nas rotas `POST /` e `DELETE /:id` (mantendo o handler):

```ts
import { requireRole } from '../middleware/roles.js';

// GET permanece aberto a qualquer autenticado.
router.post('/', requireRole('owner', 'manager'), async (req, res) => { /* handler existente */ });
router.delete('/:id', requireRole('owner', 'manager'), async (req, res) => { /* handler existente */ });
```
> Não altere a lógica interna dos handlers — só acrescente o middleware antes deles.

- [ ] **Step 7: Rodar o teste de autorização e ver PASSAR**

Run:
```powershell
npx vitest run src/test/authz.routes.test.ts
```
Esperado: todos os 8 testes verdes.

- [ ] **Step 8: Rodar o gate completo**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros e agora **58 testes** verdes (50 antigos + 8 novos).

- [ ] **Step 9: Commit**

```powershell
git add src/routes/index.ts src/routes/catalog.ts src/routes/categories.ts src/test/authz.routes.test.ts package.json package-lock.json
git commit -m @'
fix(security): aplica RBAC no backend (fecha escalada de privilegio)

- requireRole(owner) em /users, /settings, /audit-logs, /debug
- requirePermission por feature nas demais rotas
- guarda de escrita em catalog e categories
- testes HTTP de autorizacao com supertest (8 casos)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `src/test/authz.routes.test.ts` verde (403 para role errada, 401 sem auth, não-403 para role certa).
- [ ] `npm run verify` verde.
- [ ] Verificação manual rápida: com token de `employee`, `POST /api/users` retorna 403.

## Notas de segurança e follow-ups (não fazer aqui)

- O JWT só carrega `role`; embutir `permissions` por usuário no token é melhoria futura.
- `requireRole('owner','manager')` em categorias é uma política; o owner pode endurecer para `owner` apenas depois.
- A validação de corpo de `/users` (role válida, força de senha) é tratada na Fase 2 (`04-validacao-zod.md`); esta tarefa cuida só de **quem pode chamar**.
