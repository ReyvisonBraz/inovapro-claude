# Fase 2 · Tarefa 04 — Validação Zod universal nas rotas de escrita (M6)

**Goal:** Toda rota de escrita valida o corpo com Zod. Hoje só 4 de ~15 arquivos usam `validate(...)`; `users`, `inventory`, `settings`, `categories` e `catalog` aceitam `req.body` cru — abrindo espaço para dados inválidos, `role` arbitrária em `/users` e `pixKey`/secrets sem validação em `/settings`.

**Architecture:** Criamos schemas de servidor em [../../../src/routes/schemas.ts](../../../src/routes/schemas.ts) (co-localizados com os existentes) e aplicamos o middleware `validate(schema)` de [../../../src/middleware/validate.ts](../../../src/middleware/validate.ts) nas rotas de escrita. Regra: `role` restrita ao enum; senha obrigatória na criação de usuário; números coeridos.

## Interfaces

- **Produz em `src/routes/schemas.ts`:**
  - `UserCreateSchema`, `UserUpdateSchema`
  - `InventoryItemSchema`
  - `SettingsSchema`
  - `CategorySchema`
  - `BrandSchema`, `ModelSchema`, `EquipmentTypeSchema`, `ServiceOrderStatusSchema`
- **Consome:** `validate(...)` já existente.

---

- [ ] **Step 1: Teste de validação (vai FALHAR — sem validação hoje)**

Crie `src/test/validation.routes.test.ts`. Foca em `/users` (o mais crítico) com prisma mockado:

```ts
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../lib/prisma.js', () => ({
  prisma: { user: { create: vi.fn().mockResolvedValue({ id: 1 }), findMany: vi.fn().mockResolvedValue([]) } },
}));

import usersRoutes from '../routes/users';

const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

describe('Validação de /api/users', () => {
  it('rejeita role inválida com 400', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', password: 'senha123', name: 'Joao', role: 'superadmin' });
    expect(res.status).toBe(400);
  });

  it('rejeita usuário sem senha (criação) com 400', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', name: 'Joao', role: 'employee' });
    expect(res.status).toBe(400);
  });

  it('aceita payload válido (não 400)', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', password: 'senha123', name: 'Joao', role: 'employee', permissions: [] });
    expect(res.status).not.toBe(400);
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/validation.routes.test.ts
```
Esperado: os casos de rejeição falham (hoje retornam 200/500, não 400).

- [ ] **Step 3: Adicionar os schemas de servidor**

Em `src/routes/schemas.ts`, adicione:

```ts
export const UserCreateSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  name: z.string().min(1),
  role: z.enum(['owner', 'manager', 'employee']),
  permissions: z.array(z.string()).optional().default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['owner', 'manager', 'employee']),
  password: z.string().min(6).optional(),          // opcional na edição
  permissions: z.array(z.string()).optional().default([]),
});

export const InventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['product', 'service']),
  sku: z.string().optional().nullable(),
  costPrice: z.coerce.number().nonnegative().optional(),
  salePrice: z.coerce.number().nonnegative().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().int().optional(),
  stockLevel: z.coerce.number().int().optional(),
  minQuantity: z.coerce.number().int().optional(),
  version: z.number().int().nonnegative().optional(),
});

export const SettingsSchema = z.object({
  appName: z.string().optional(),
  appVersion: z.string().optional(),
  fiscalYear: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  categories: z.string().optional(),
  incomeCategories: z.string().optional(),
  expenseCategories: z.string().optional(),
  profileName: z.string().optional(),
  profileAvatar: z.string().optional(),
  initialBalance: z.coerce.number().optional(),
  showWarnings: z.boolean().optional(),
  hiddenColumns: z.array(z.string()).optional(),
  settingsPassword: z.string().optional(),
  receiptLayout: z.string().optional(),
  receiptLogo: z.string().optional(),
  shopWhatsapp: z.string().optional(),
  sendPulseClientId: z.string().optional(),
  sendPulseClientSecret: z.string().optional(),
  sendPulseTemplateId: z.string().optional(),
  osPrintConfig: z.string().optional(),
}).passthrough(); // settings tem muitos campos; passthrough evita quebrar campos novos

export const CategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
});

export const BrandSchema = z.object({ name: z.string().min(1), equipmentType: z.string().optional().nullable() });
export const ModelSchema = z.object({ brandId: z.coerce.number().int().positive(), name: z.string().min(1) });
export const EquipmentTypeSchema = z.object({ name: z.string().min(1), icon: z.string().optional().nullable() });
export const ServiceOrderStatusSchema = z.object({
  name: z.string().min(1), color: z.string().optional(), priority: z.coerce.number().optional(), isDefault: z.coerce.number().optional(),
});
```

- [ ] **Step 4: Aplicar `validate` em `users.ts`**

```ts
import { validate } from '../middleware/validate.js';
import { UserCreateSchema, UserUpdateSchema } from './schemas.js';

router.post('/', validate(UserCreateSchema), async (req, res) => { /* handler */ });
router.put('/:id', validate(UserUpdateSchema), async (req, res) => { /* handler */ });
```

- [ ] **Step 5: Aplicar `validate` nas demais rotas**

- `inventory.ts`: `POST` e `PUT` → `validate(InventoryItemSchema)`.
- `settings.ts`: `POST` → `validate(SettingsSchema)`.
- `categories.ts`: `POST` → `validate(CategorySchema)` (mantendo o `requireRole` da Fase 1: a ordem é `requireRole(...)`, depois `validate(...)`).
- `catalog.ts`: aplicar por rota — `brands` POST/PUT → `validate(BrandSchema)`; `models` → `ModelSchema`; `equipment-types` → `EquipmentTypeSchema`; `service-order-statuses` → `ServiceOrderStatusSchema`.

> Em `inventory.ts`, com o body já validado e coerido, os `parseFloat`/`parseInt` manuais podem ser simplificados — mas isso é opcional; o mínimo é adicionar o `validate`.

- [ ] **Step 6: Rodar o teste e ver PASSAR**

Run:
```powershell
npx vitest run src/test/validation.routes.test.ts
```
Esperado: 3 verdes.

- [ ] **Step 7: Gate completo**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros; suíte verde.

- [ ] **Step 8: Commit**

```powershell
git add src/routes/schemas.ts src/routes/users.ts src/routes/inventory.ts src/routes/settings.ts src/routes/categories.ts src/routes/catalog.ts src/test/validation.routes.test.ts
git commit -m @'
fix(validation): valida body com Zod em users/inventory/settings/categories/catalog

- role restrita ao enum; senha minima na criacao de usuario
- primaryColor valida hex; numeros coeridos
- testes cobrindo rejeicao 400 e aceite

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `POST /api/users` com `role: 'superadmin'` → 400 (provado por teste).
- [ ] Todas as rotas de escrita passam por `validate(...)`.
- [ ] `npm run verify` verde.

## Nota de compatibilidade

- O front envia `showWarnings`/`hiddenColumns` em formatos que o handler converte (`showWarnings ? 1 : 0`, `JSON.stringify`). O `SettingsSchema` aceita `boolean`/`array`; o handler mantém a conversão. Rode o smoke de salvar Configurações após aplicar, para garantir que nenhum campo legítimo é rejeitado (`passthrough` protege campos não listados).
