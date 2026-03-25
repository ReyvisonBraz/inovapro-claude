# Fase 4 — Qualidade, Testes e DevOps

> **Objetivo**: Adicionar testes automatizados, configurar linting/formatação, implementar variáveis de ambiente seguras, e preparar CI/CD básico.

---

## Pré-requisitos

- ✅ Fases 1-3 concluídas
- Backend e frontend modulares
- Componentes quebrados em peças testáveis

---

## Etapa 4.1 — Configurar Vitest + Testing Library

### Por quê?
O projeto tem **zero testes**. Qualquer mudança pode quebrar funcionalidades sem que ninguém saiba. Testes são obrigatórios para um projeto escalável.

### Dependências

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuração

1. **Adicionar ao `vite.config.ts`**:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  // ...config existente
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

2. **Criar `src/test/setup.ts`**:
```typescript
import '@testing-library/jest-dom';

// Mock global fetch para testes
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

3. **Adicionar script ao `package.json`**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Etapa 4.2 — Testes Unitários do Frontend

### O que testar (prioridade)

#### 1. Hooks de dados (Alta prioridade)
```
src/hooks/__tests__/
├── useAuth.test.ts
├── useCustomers.test.ts
├── useTransactions.test.ts
├── useServiceOrders.test.ts
└── usePayments.test.ts
```

**Exemplo de teste de hook**:
```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

describe('useAuth', () => {
  it('deve iniciar sem usuário autenticado', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('deve fazer login com sucesso', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 1, username: 'admin', role: 'owner', token: 'fake-jwt',
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      await result.current.login('admin', 'admin');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('admin');
  });

  it('deve recusar credenciais inválidas', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Credenciais inválidas' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await expect(
      act(async () => { await result.current.login('wrong', 'wrong'); })
    ).rejects.toThrow();
  });
});
```

#### 2. Utilitários (Alta prioridade)
```
src/lib/__tests__/
└── utils.test.ts
```

**Testar**:
- `formatCurrency(4500)` → `"R$ 4.500,00"`
- `formatMonthYear(new Date())` → formato correto
- `cn(...)` → merge de classes correta

#### 3. Componentes UI (Média prioridade)
```
src/components/__tests__/
├── Login.test.tsx
├── StatCard.test.tsx
├── ServiceOrderCard.test.tsx
└── TransactionRow.test.tsx
```

**Exemplo**:
```typescript
// src/components/__tests__/Login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../Login';

describe('Login', () => {
  it('deve renderizar campos de usuário e senha', () => {
    render(<Login onLogin={vi.fn()} />);
    expect(screen.getByPlaceholderText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
  });

  it('deve chamar onLogin ao submeter', async () => {
    const mockLogin = vi.fn();
    render(<Login onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText(/usuário/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: 'admin' } });
    fireEvent.click(screen.getByText(/entrar/i));
    
    // verificar que fetch foi chamado
  });
});
```

#### 4. Zod Schemas (Alta prioridade)
```
server/validators/__tests__/
└── schemas.test.ts
```

**Testar**:
- `TransactionSchema.parse({valid})` → sem erro
- `TransactionSchema.parse({invalid})` → erro de validação
- `CustomerSchema` sem `firstName` → erro obrigatório
- `ServiceOrderSchema` com `partsUsed` tipado → sucesso

---

## Etapa 4.3 — Testes de API (Backend)

### Dependências
```bash
npm install -D supertest @types/supertest
```

### Estrutura
```
server/__tests__/
├── auth.test.ts              ← Login, JWT, users CRUD
├── transactions.test.ts      ← CRUD transações
├── customers.test.ts         ← CRUD clientes
├── payments.test.ts          ← CRUD pagamentos + receipts
├── serviceOrders.test.ts     ← CRUD OS + inventory reconciliation
├── inventory.test.ts         ← CRUD inventário
└── helpers/
    └── testApp.ts            ← Express app configurado para testes (sem Vite)
```

### Helper de testes (`testApp.ts`)
```typescript
import express from 'express';
import routes from '../../routes/index';
import { errorHandler } from '../../middleware/errorHandler';

// App sem Vite (apenas API routes para teste)
export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(routes);
  app.use(errorHandler);
  return app;
}

// Helper para obter JWT de teste
export async function getTestToken(app: express.Application): Promise<string> {
  const res = await supertest(app)
    .post('/api/login')
    .send({ username: 'admin', password: 'admin' });
  return res.body.token;
}
```

### Exemplo de teste de API
```typescript
// server/__tests__/transactions.test.ts
import supertest from 'supertest';
import { createTestApp, getTestToken } from './helpers/testApp';

const app = createTestApp();

describe('POST /api/transactions', () => {
  let token: string;

  beforeAll(async () => {
    token = await getTestToken(app);
  });

  it('deve criar uma transação válida', async () => {
    const res = await supertest(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Teste',
        category: 'Vendas',
        type: 'income',
        amount: 100,
        date: '2026-03-22',
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('deve rejeitar transação sem descrição', async () => {
    const res = await supertest(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Vendas', type: 'income', amount: 100, date: '2026-03-22' });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await supertest(app)
      .post('/api/transactions')
      .send({ description: 'Teste', category: 'Vendas', type: 'income', amount: 100, date: '2026-03-22' });

    expect(res.status).toBe(401);
  });
});
```

---

## Etapa 4.4 — ESLint + Prettier

### Dependências
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier
```

### Configuração ESLint (`.eslintrc.cjs`)
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',  // Alerta para 'any' — objetivo é eliminar
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['error'] }],  // Forçar uso de logger
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
};
```

### Configuração Prettier (`.prettierrc`)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true
}
```

### Scripts no `package.json`
```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

### O que esperar
A primeira execução do lint vai mostrar **centenas de warnings** (uso de `any`, console.log, etc.). O objetivo é:
1. Configurar as regras
2. Rodar `lint:fix` para correções automáticas
3. Corrigir os warnings restantes manualmente ao longo do tempo
4. Nunca adicionar novos warnings

---

## Etapa 4.5 — Variáveis de Ambiente

### Criar `.env` real (a partir do `.env.example`)
```bash
cp .env.example .env
```

### Editar `.env` com valores seguros:
```env
PORT=3000
JWT_SECRET=gerar-uma-string-aleatoria-de-64-caracteres
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
```

### Adicionar `.env` ao `.gitignore`
```gitignore
# Variáveis de ambiente
.env
.env.local
!.env.example
```

### Validar no `server/config.ts`
Já está implementado — o `config.ts` lê as variáveis com defaults para desenvolvimento.

---

## Etapa 4.6 — Docker (Opcional)

### `Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "--loader", "tsx", "server/index.ts"]
```

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./finance.db:/app/finance.db
```

---

## Cobertura de Testes Mínima Recomendada

| Área | Cobertura Mínima | Tipo |
|------|-----------------|------|
| Auth (login/JWT) | 90%+ | API + Unit |
| CRUD Transações | 80%+ | API |
| CRUD Clientes | 80%+ | API |
| CRUD OS | 70%+ | API |
| Zod Schemas | 100% | Unit |
| Utilitários (`utils.ts`) | 100% | Unit |
| Contexts | 80%+ | Unit |
| Componentes UI | 50%+ | Component |

---

## Checklist geral da Fase 4

- [ ] Vitest configurado e rodando
- [ ] Testes unitários para hooks e utilitários
- [ ] Testes de API para todas as rotas críticas
- [ ] ESLint + Prettier configurados
- [ ] `.env` real criado (NÃO commitado)
- [ ] `.env.example` atualizado com todas as variáveis
- [ ] `.gitignore` inclui `.env`
- [ ] Scripts `test`, `lint`, `format` no package.json
- [ ] `npm run test:run` passa sem erros
- [ ] `npm run lint` passa sem erros (ou apenas warnings aceitáveis)
- [ ] Docker configurado (opcional)
