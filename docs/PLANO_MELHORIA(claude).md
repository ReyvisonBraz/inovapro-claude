# Plano de Melhoria — FINANCEIRO INOVA

## Contexto

Sistema de gestão financeira/operacional (React 19 + Node/Express + SQLite) com ~90% das features implementadas, mas com bugs críticos de runtime, inconsistências arquiteturais e falhas de segurança que impedem uso em produção. O foco desta sprint é **bugs críticos primeiro**, mantendo SQLite local e adicionando testes automatizados.

---

## Fase 1 — Bugs Críticos de Runtime (bloqueadores imediatos)

### 1.1 `GlobalModals.tsx` — Bugs de tipo

**Arquivo:** `src/components/layout/GlobalModals.tsx`

---

**Bug A — linha ~136:** `warningType` recebe `'duplicate'`, valor que não existe no union type

```ts
// Errado (linha 136)
setWarningType('duplicate');

// Correto — adicionar 'duplicate' ao union type em useModalStore.ts
```

**Fix:**

Abrir `src/store/useModalStore.ts`, linha 27–28. O union type atual é:
```ts
warningType: 'category' | 'description' | 'both'
```
Alterar para:
```ts
warningType: 'category' | 'description' | 'both' | 'duplicate'
```

---

**Bug B — linha ~121:** Propriedade `adminPassword` não existe em `AppSettings`

```ts
// Errado (linha 121)
if (passwordInput === settings.adminPassword)

// Correto — usar o campo correto do tipo AppSettings
if (passwordInput === settings.settingsPassword)
```

---

**Bug C — linha ~174:** `clientPaymentToDelete` é `number`, mas código trata como `{ id: number }`

```ts
// Errado (linha 174)
await deleteClientPaymentAPI(clientPaymentToDelete.id);

// Correto — clientPaymentToDelete já é o id numérico diretamente
await deleteClientPaymentAPI(clientPaymentToDelete);
```

---

### 1.2 `App.tsx` — Import faltando + logout incorreto

**Arquivo:** `src/App.tsx`

---

**Bug A — linha ~113:** `printBlankForm(settings)` chamada sem import

A função **existe** em `src/lib/printUtils.ts` (linhas 3–146) mas **não está importada** em `App.tsx`.

**Fix:** Adicionar no topo de `App.tsx`:
```ts
import { printBlankForm } from './lib/printUtils';
```

---

**Bug B — linha ~159:** `logout()` navega para `/dashboard` em vez de `/login`

```ts
// Errado (linha 159)
navigate('/dashboard');

// Correto — após logout, usuário deve ir para tela de login
navigate('/login');
```

---

### 1.3 Consolidar dois clientes de API (axios vs fetch)

**Problema:** Dois módulos paralelos causam bugs sutis de resposta e error handling:

| Arquivo | Tipo | Resposta | Usado por |
|---|---|---|---|
| `src/lib/api.ts` | Axios com interceptors | `res.data` (envelope axios) | `useTransactions`, `useCustomers`, etc. |
| `src/services/api.ts` | Fetch puro | JSON cru (sem envelope) | `useClientPayments` |

**Fix — migrar `useClientPayments.ts` para axios:**

1. Em `src/hooks/useClientPayments.ts`, linha 3, trocar:
```ts
// Antes
import { api } from '../services/api';

// Depois
import api from '../lib/api';
```

2. Em cada chamada de API dentro de `useClientPayments.ts`, adicionar `.data` para extrair o payload do envelope axios:
```ts
// Antes (fetch retorna JSON cru)
const res = await api.get(url);
return res;

// Depois (axios retorna { data, status, ... })
const res = await api.get(url);
return res.data;
```
Linhas afetadas: 15, 26, 44, 46, 61, 75.

3. Corrigir inconsistência de `limit` em `useClientPayments.ts`:

| Linha | Valor atual | Valor correto |
|---|---|---|
| ~15 | `limit=20` na URL | manter |
| ~89 | `limit: 10` no estado default | alterar para `20` |

4. Após migração validada, **deletar `src/services/api.ts`**.

---

## Fase 2 — Segurança

### 2.1 Hashing de senhas com bcrypt

**Arquivo:** `server.ts`

**Instalar dependências:**
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

**Passo a passo:**

1. **Senha padrão do admin — linha ~357:**
```ts
// Antes (plain text hardcoded)
db.prepare("INSERT INTO users (...) VALUES (?, ?, ?, ?, ?)")
  .run('admin', 'admin', 'owner', 'Administrador', allPermissions);

// Depois
const defaultPassword = process.env.ADMIN_PASSWORD || 'admin';
const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
db.prepare("INSERT INTO users (...) VALUES (?, ?, ?, ?, ?)")
  .run('admin', hashedPassword, 'owner', 'Administrador', allPermissions);
```

2. **Endpoint POST `/api/login` — linha ~892–913:**
```ts
// Antes (comparação direta)
const user = db.prepare(
  "SELECT * FROM users WHERE username = ? AND password = ?"
).get(username, password);

// Depois (buscar por username, comparar com bcrypt)
const user = db.prepare(
  "SELECT * FROM users WHERE username = ?"
).get(username);
if (!user || !bcrypt.compareSync(password, user.password)) {
  return res.status(401).json({ error: 'Credenciais inválidas' });
}
```

3. **Endpoint de atualização de senha (Settings):** hash antes de salvar com `bcrypt.hashSync(newPassword, 10)`.

4. **Migração de senhas existentes no banco:** adicionar script de migração que leia todos os usuários com senha em plain text e atualize com hash.

---

### 2.2 Remover senhas hardcoded

| Arquivo | Linha | Problema | Fix |
|---|---|---|---|
| `server.ts` | ~141 | `settingsPassword TEXT DEFAULT '1234'` no CREATE TABLE | Trocar para `DEFAULT ''` |
| `server.ts` | ~296 | `"TEXT DEFAULT '1234'"` na migração de coluna | Trocar para `"TEXT DEFAULT ''"` |
| `server.ts` | ~357 | `'admin'` como senha padrão hardcoded | Ler de `process.env.ADMIN_PASSWORD` |
| `src/store/useSettingsStore.ts` | ~28 | `settingsPassword: '1234'` no estado inicial | Trocar para `settingsPassword: ''` |

---

### 2.3 Remover logs de dados sensíveis

**Arquivo:** `server.ts`

| Linha | Log | Ação |
|---|---|---|
| ~485 | `console.log('[TRANSACTION POST] Received body:', req.body)` | **Remover** — loga dados do usuário |
| ~498 | `console.log('[TRANSACTION POST] Validation error:', error.issues)` | Manter, mas usar `logger.warn()` |
| ~501 | `console.log('[TRANSACTION POST] Server error:', error)` | Usar `logger.error()`, sem dados sensíveis |
| ~509 | `console.log('[TRANSACTION DELETE] Deleting transaction ID:', txId)` | Usar `logger.info()` |
| ~526/528 | Delete success/not found logs | Usar `logger.info()` |

**Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx`

| Log | Ação |
|---|---|
| `console.log('Submitting Service Order Data:', data)` | **Remover** — loga dados completos do formulário |
| `console.log('Validation Errors:', errors)` | Manter apenas em ambiente dev |

---

### 2.4 Validação de Base64 de fotos

**Arquivo:** `server.ts` — endpoint POST `/api/service-orders`

Adicionar validação no schema Zod:
```ts
// Adicionar ao schema de arrivalPhotoBase64
arrivalPhotoBase64: z.string()
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/)
  .refine(
    (val) => Buffer.byteLength(val, 'base64') <= 2 * 1024 * 1024,
    { message: 'Foto não pode exceder 2MB' }
  )
  .optional()
  .nullable(),
```
Linhas afetadas: ~63, ~236, ~331 (onde `arrivalPhotoBase64` é definido no schema).

---

## Fase 3 — Qualidade de Código e Type Safety

### 3.1 Corrigir tipagem fraca

**Arquivo:** `src/types.ts`

| Linha | Problema | Fix |
|---|---|---|
| ~67 | `paymentHistory?: string` armazena JSON serializado | Criar interface e usar helper de parse |

```ts
// Adicionar em types.ts
export interface PaymentHistoryEntry {
  amount: number;
  date: string;
  installmentNumber?: number;
}

// Alterar o campo
paymentHistory?: string; // mantém no DB como JSON
// Adicionar helper para parse seguro
export function parsePaymentHistory(raw?: string): PaymentHistoryEntry[] {
  if (!raw) return [];
  try { return JSON.parse(raw); }
  catch { return []; }
}
```

**Arquivo:** `src/store/useModalStore.ts`

| Linha | Problema | Fix |
|---|---|---|
| ~51 | `customerPaymentsWarning: any[]` | Tipar com interface específica de `types.ts` |

```ts
// Definir em types.ts
export interface CustomerPaymentWarning {
  customerId: number;
  customerName: string;
  totalOutstanding: number;
  overdueCount: number;
}

// Usar em useModalStore.ts
customerPaymentsWarning: CustomerPaymentWarning[];
```

---

### 3.2 URLSearchParams em useTransactions

**Arquivo:** `src/hooks/useTransactions.ts`, linha ~36

```ts
// Antes — concatenação manual frágil
let url = `/transactions?page=${transactionsPage}&limit=20&search=${encodeURIComponent(searchTerm)}`;
if (filterType !== 'all') url += `&type=${filterType}`;
if (filterCategory !== 'all') url += `&category=${filterCategory}`;

// Depois — URLSearchParams (encoding automático, sem bugs de & duplo)
const params = new URLSearchParams({
  page: transactionsPage.toString(),
  limit: '20',
  search: searchTerm,
});
if (filterType !== 'all') params.set('type', filterType);
if (filterCategory !== 'all') params.set('category', filterCategory);
const url = `/transactions?${params.toString()}`;
```

---

### 3.3 Definir WarningType como tipo exportado

**Arquivo:** `src/types.ts`

```ts
// Adicionar tipo exportado (atualmente o union está inline em useModalStore.ts)
export type WarningType = 'category' | 'description' | 'both' | 'duplicate';
```

**Arquivo:** `src/store/useModalStore.ts`, linha ~27

```ts
// Antes
warningType: 'category' | 'description' | 'both'

// Depois
import type { WarningType } from '../types';
warningType: WarningType
```

---

## Fase 4 — Testes Automatizados

**Stack:** Vitest + React Testing Library + MSW (Mock Service Worker)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom msw @vitest/ui @vitest/coverage-v8 jsdom
```

### 4.1 Configuração

**Criar `vitest.config.ts` na raiz:**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

**Criar `src/test/setup.ts`:**
```ts
import '@testing-library/jest-dom';
```

**Criar `src/test/mocks/handlers.ts`:**
```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/transactions', () => HttpResponse.json({ data: [], meta: { total: 0 } })),
  http.post('/api/login', () => HttpResponse.json({ token: 'test-token' })),
  // adicionar handlers conforme necessário
];
```

**Adicionar scripts em `package.json`:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

### 4.2 Escopo de testes prioritários

| Arquivo de Teste | O que testar |
|---|---|
| `src/hooks/useTransactions.test.ts` | Filtragem, paginação, CRUD, URLSearchParams correto |
| `src/hooks/useClientPayments.test.ts` | Criação de pagamento, registro de parcela, limit=20 |
| `src/hooks/useCustomers.test.ts` | Detecção de duplicatas (CPF/telefone) |
| `src/components/layout/GlobalModals.test.tsx` | Modal de senha (Bug B fix), deleção de pagamento (Bug C fix) |
| `src/lib/utils.test.ts` | Funções de formatação (currency, date) |
| `src/lib/printUtils.test.ts` | printBlankForm não lança exceção |
| `server.test.ts` | Endpoints: login com bcrypt, CRUD de transações, validação Base64 |

---

## Fase 5 — Implementações Pendentes

### 5.1 Validação de variáveis de ambiente

Adicionar no topo de `server.ts`:
```ts
const requiredEnvVars = ['PORT'];
requiredEnvVars.forEach(v => {
  if (!process.env[v]) {
    console.warn(`[CONFIG] Env var ${v} not set, using default`);
  }
});
```

Para o `.env` (criar `.env.example` como template):
```
PORT=3001
ADMIN_PASSWORD=admin
```

### 5.2 Update check em Settings.tsx

**Arquivo:** `src/components/settings/Settings.tsx`, linhas ~78–98

Atualmente: três `setTimeout` aninhados simulando atualização (fake).

**Opção A (recomendada — mais simples e honesta):**
Remover o botão "Verificar atualizações" da UI completamente.

**Opção B (se quiser manter):**
Implementar endpoint `GET /api/version` em `server.ts` que retorna:
```ts
import pkg from './package.json';
app.get('/api/version', (_req, res) => {
  res.json({ version: pkg.version });
});
```
E no frontend, comparar com a versão esperada. Remover os `setTimeout`.

---

## Tabela Consolidada de Arquivos

| Arquivo | Fase | Mudanças | Risco |
|---|---|---|---|
| `src/components/layout/GlobalModals.tsx` | 1 | Corrigir 3 bugs (linha 121, 136, 174) | Baixo |
| `src/App.tsx` | 1 | Adicionar import printBlankForm; fix navigate('/login') | Baixo |
| `src/store/useModalStore.ts` | 1 + 3 | Adicionar 'duplicate' ao union; tipar any[] | Baixo |
| `src/hooks/useClientPayments.ts` | 1 | Migrar para axios (.data); fix limit 10→20 | Médio |
| `src/services/api.ts` | 1 | Deletar após migração | Baixo |
| `server.ts` | 2 | bcrypt; remover hardcoded; remover logs sensíveis; validar Base64 | Alto |
| `src/store/useSettingsStore.ts` | 2 | Remover senha default '1234' | Baixo |
| `src/types.ts` | 3 | Tipar paymentHistory; exportar WarningType; CustomerPaymentWarning | Baixo |
| `src/hooks/useTransactions.ts` | 3 | URLSearchParams | Baixo |
| `src/components/service-orders/ServiceOrderForm.tsx` | 2 | Remover console.log de dados do formulário | Baixo |
| `vitest.config.ts` | 4 | Criar do zero | Baixo |
| `src/test/setup.ts` | 4 | Criar do zero | Baixo |
| `src/test/mocks/handlers.ts` | 4 | Criar do zero | Baixo |
| `.env.example` | 5 | Criar template de variáveis | Baixo |

---

## Checklist de Verificação por Fase

### Fase 1 — Verificação manual
- [ ] Abrir modal de confirmação de senha → aceitar senha correta sem erro de tipo
- [ ] Deletar um pagamento de cliente → sem erro `cannot read .id of number`
- [ ] Fazer logout → redireciona para `/login` (não `/dashboard`)
- [ ] Abrir impressão de OS em branco → função executa sem `ReferenceError`
- [ ] Usar filtros em Transações → URL formada corretamente sem `&` duplicado

### Fase 2 — Verificação de segurança
- [ ] Login com credenciais corretas funciona após migração de hash
- [ ] Login com senha errada retorna 401
- [ ] Alterar senha nas configurações → nova senha funciona no próximo login
- [ ] Console do servidor não exibe dados de transações (`req.body`)
- [ ] Upload de imagem >2MB retorna erro de validação

### Fase 3 — Type check
- [ ] `npm run tsc --noEmit` retorna 0 erros
- [ ] Nenhum uso de `any` nos arquivos alterados

### Fase 4 — Testes
```bash
npm run test          # todos os testes passam
npm run test:coverage # cobertura >70% nos hooks críticos
```

### Regressão Manual (fluxo completo)
1. Criar cliente
2. Criar OS para esse cliente
3. Registrar pagamento de cliente
4. Verificar no dashboard
5. Testar filtros de transação (por tipo, data, categoria)
6. Criar usuário novo nas configurações
7. Login com novo usuário
