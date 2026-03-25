# Fase 2 — Refatoração do Frontend: React Router + Context API

> **Objetivo**: Desmontar o God Component `App.tsx` (3.200+ linhas) em peças gerenciáveis, implementar roteamento real com React Router, e organizar estado global com Context API.

---

## Pré-requisitos

- ✅ Fase 1 concluída (backend modular com JWT)
- Frontend rodando com `npm run dev`
- `fetchWithAuth` já está implementado em `App.tsx`

## Dependências a instalar

```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

---

## Etapa 2.1 — Instalar e Configurar React Router

### Por quê?
Atualmente a navegação usa `useState<Screen>('dashboard')` — uma string que troca o componente renderizado em um switch/case gigante. Isso impede:
- URLs reais (impossível compartilhar link direto para uma OS)
- Botão "voltar" do navegador
- Deep links do mobile/web
- Code splitting (carregamento lazy de páginas)

### O que fazer

1. **Instalar** `react-router-dom`

2. **Criar arquivo de rotas** `src/routes.tsx`:
```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { ServiceOrders } from './pages/ServiceOrders';
import { Customers } from './pages/Customers';
import { ClientPayments } from './pages/ClientPayments';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,  // Layout com sidebar
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'service-orders', element: <ServiceOrders /> },
      { path: 'service-orders/:id', element: <ServiceOrders /> },
      { path: 'customers', element: <Customers /> },
      { path: 'payments', element: <ClientPayments /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
```

3. **Criar `src/layouts/AppLayout.tsx`** — Extrair o layout (sidebar + top bar + área de conteúdo) do `App.tsx`:
```tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Sidebar, TopBar, etc.

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={(path) => navigate(path)} />
      <main className="flex-1 overflow-auto">
        <TopBar user={user} onLogout={logout} />
        <Outlet />  {/* Renderiza a rota filha aqui */}
      </main>
    </div>
  );
}
```

4. **Atualizar `main.tsx`**:
```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
```

5. **Migrar SidebarItem** para usar `<Link>` ou `useNavigate()` em vez de `setActiveScreen()`.

6. **Remover** o estado `activeScreen` e todo o switch/case de renderização do `App.tsx`.

### Arquivos a criar/modificar
| Ação | Arquivo |
|------|---------|
| NOVO | `src/routes.tsx` |
| NOVO | `src/layouts/AppLayout.tsx` |
| MODIFICAR | `src/main.tsx` |
| MODIFICAR | `src/components/layout/SidebarItem.tsx` |
| DELETAR conteúdo | A lógica de navegação em `App.tsx` |

### Verificação
- [ ] Acessar `http://localhost:3000/` → Dashboard
- [ ] Acessar `http://localhost:3000/transactions` → Transações
- [ ] Acessar `http://localhost:3000/service-orders` → Ordens de Serviço
- [ ] Botão "voltar" do navegador funciona
- [ ] Deep link `/service-orders?osId=5` abre OS #5

---

## Etapa 2.2 — Criar Contexts (Estado Global Tipado)

### Por quê?
O `App.tsx` tem **50+ hooks `useState`** e **30+ funções fetch**. Toda a lógica de dados e UI está num único componente. Isso torna o componente impossível de manter, debugar, e testar.

### Contexts a criar

#### 1. `AuthContext` — Autenticação + Usuário Logado
```
src/contexts/AuthContext.tsx
```

**Estado**:
- `user: User | null`
- `isAuthenticated: boolean`
- `token: string | null`

**Ações**:
- `login(username, password): Promise<void>`
- `logout(): void`
- `hasPermission(permission: string): boolean`

**Lógica a extrair de `App.tsx`**:
- `currentUser`, `isAuthenticated` (estados)
- `handleLogin`, `handleLogout` (funções)
- `hasPermission` (function)
- Token management (localStorage)

---

#### 2. `SettingsContext` — Configurações do App
```
src/contexts/SettingsContext.tsx
```

**Estado**:
- `settings: AppSettings`
- `isLoading: boolean`

**Ações**:
- `fetchSettings(): Promise<void>`
- `updateSettings(settings: Partial<AppSettings>): Promise<void>`
- `addCategory(name, type): Promise<void>`
- `deleteCategory(id): Promise<void>`
- `categories: Category[]`

**Lógica a extrair de `App.tsx`**:
- `settings`, `categories` (estados)
- `fetchSettings`, `updateSettings`, `fetchCategories`, `addCategory`, `deleteCategory`
- `settingsPassword`, `isSettingsLocked`

> **Nota**: O hook `useAppSettings` já existe em `src/hooks/useAppSettings.ts` mas NÃO é usado pelo `App.tsx`. Avaliar se pode ser reutilizado ou integrado ao context.

---

#### 3. `UIContext` — Estado de Interface
```
src/contexts/UIContext.tsx
```

**Estado**:
- `toast: { message, type, visible }`
- `confirmDialog: { message, onConfirm, visible }`
- `fontSize: number`
- `isSidebarCollapsed: boolean`

**Ações**:
- `showToast(message, type): void`
- `showConfirmDialog(message, onConfirm): void`

**Lógica a extrair de `App.tsx`**:
- `toast`, `showToast`
- `showConfirmDialog`, `confirmMessage`, `onConfirmAction`
- `fontSize`, `sidebarCollapsed`

---

### Padrão de implementação

Cada context deve seguir esta estrutura:

```tsx
// src/contexts/ExampleContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ExampleContextType {
  data: DataType[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  addItem: (item: DataType) => Promise<void>;
}

const ExampleContext = createContext<ExampleContextType | undefined>(undefined);

export function ExampleProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/example');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ExampleContext.Provider value={{ data, isLoading, fetchData, addItem }}>
      {children}
    </ExampleContext.Provider>
  );
}

export function useExample() {
  const context = useContext(ExampleContext);
  if (!context) throw new Error('useExample must be used within ExampleProvider');
  return context;
}
```

### Arquivos a criar
| Arquivo | Substituirá no App.tsx |
|---------|----------------------|
| `src/contexts/AuthContext.tsx` | ~30 linhas de estado + 3 funções |
| `src/contexts/SettingsContext.tsx` | ~50 linhas de estado + 5 funções |
| `src/contexts/UIContext.tsx` | ~40 linhas de estado + 3 funções |

### Verificação
- [ ] Login/logout funciona via AuthContext
- [ ] Settings carregam via SettingsContext
- [ ] Toast e confirmações funcionam via UIContext
- [ ] Nenhuma prop drilling de `currentUser` ou `settings`

---

## Etapa 2.3 — Consumir Hooks Existentes

### Situação Atual
Os seguintes hooks JÁ existem no projeto mas **NÃO são usados** pelo `App.tsx`:
- `src/hooks/useAppSettings.ts`
- `src/hooks/useCustomers.ts`
- `src/hooks/useTransactions.ts` (se existir)
- `src/hooks/useInventory.ts` (se existir)
- `src/hooks/useUsers.ts` (se existir)

### O que fazer
1. **Auditar** cada hook — verificar se está completo e correto
2. **Atualizar** cada hook para usar `fetchWithAuth` (se ainda usar `fetch` direto)
3. **Integrar** cada hook no context correspondente ou diretamente nos componentes de página
4. **Remover** as funções de fetch duplicadas do `App.tsx`

### Verificação
- [ ] Hook `useCustomers` é usado pela página de Clientes
- [ ] Hook `useTransactions` é usado pela página de Transações
- [ ] Funções duplicadas removidas do `App.tsx`

---

## Etapa 2.4 — Expandir API Service Tipado

### Situação Atual
O `src/services/api.ts` tem métodos genéricos (`get`, `post`, `put`, `patch`, `delete`) com JWT.

### O que fazer
Criar serviços por domínio que tipam as respostas:

```typescript
// src/services/transactionsService.ts
import { api } from './api';
import { Transaction, PaginatedResponse } from '../types';

export const transactionsService = {
  list: (page: number, search: string): Promise<PaginatedResponse<Transaction>> =>
    api.get(`/api/transactions?page=${page}&limit=20&search=${search}`),
  
  create: (data: Omit<Transaction, 'id'>): Promise<{ id: number }> =>
    api.post('/api/transactions', data),
  
  update: (id: number, data: Partial<Transaction>): Promise<{ success: boolean }> =>
    api.put(`/api/transactions/${id}`, data),
  
  delete: (id: number): Promise<{ success: boolean }> =>
    api.delete(`/api/transactions/${id}`),
};
```

### Serviços a criar
| Arquivo | Endpoints |
|---------|-----------|
| `src/services/transactionsService.ts` | CRUD transações + stats |
| `src/services/customersService.ts` | CRUD clientes + payments |
| `src/services/paymentsService.ts` | CRUD pagamentos + receipts |
| `src/services/serviceOrdersService.ts` | CRUD OS + statuses |
| `src/services/inventoryService.ts` | CRUD inventário |
| `src/services/settingsService.ts` | Settings + categories + brands + models |
| `src/services/authService.ts` | Login + users CRUD |

### Verificação
- [ ] Cada serviço tipado retorna o tipo correto
- [ ] Componentes usam os serviços ao invés de `fetchWithAuth` direto
- [ ] Zero uso de `any` nas chamadas de API

---

## Etapa 2.5 — Eliminar Componentes Duplicados

### Duplicatas identificadas
| Raiz | Subpasta | Manter |
|------|----------|--------|
| `src/components/SidebarItem.tsx` | `src/components/layout/SidebarItem.tsx` | `layout/` |
| `src/components/StatCard.tsx` | `src/components/layout/StatCard.tsx` (se existir) | verificar |

### O que fazer
1. **Comparar** as versões (qual tem mais features?)
2. **Manter** a versão da subpasta organizada
3. **Atualizar** os imports em todos os arquivos que usam a versão antiga
4. **Deletar** os arquivos duplicados

### Verificação
- [ ] Zero arquivos duplicados
- [ ] Todos os imports atualizados
- [ ] Build sem erros (`npm run build`)

---

## Meta Final da Fase 2

Ao concluir todas as etapas:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Linhas do `App.tsx` | 3.218 | ~200 (apenas providers + router) |
| Estados no `App.tsx` | 50+ useState | 0 (tudo em contexts) |
| Funções fetch no `App.tsx` | 30+ | 0 (tudo em services/hooks) |
| Navegação | String `activeScreen` | React Router com URLs |
| Componentes duplicados | 2+ | 0 |

### Checklist geral
- [ ] React Router instalado e configurado
- [ ] Layout extraído para `AppLayout.tsx`
- [ ] AuthContext criado e funcionando
- [ ] SettingsContext criado e funcionando
- [ ] UIContext criado e funcionando
- [ ] Hooks existentes integrados
- [ ] Serviços de API tipados criados
- [ ] Duplicatas eliminadas
- [ ] `App.tsx` reduzido a ~200 linhas
- [ ] Build sem erros
- [ ] Teste manual de todas as páginas
