# Plano de Execução — InovaPro Refatoração

> Acompanhamento ao vivo. Cada etapa concluída é marcada com ✅ antes de avançar.
> Legenda: ⏳ Aguardando | 🔄 Em andamento | ✅ Concluído | ⚠️ Requer atenção especial

---

## CONTEXTO GERAL

Este plano foi elaborado após análise técnica profunda do codebase InovaPro (~15.000 linhas, ~120 arquivos). As mudanças seguem ordem de risco crescente: do mais seguro ao mais impactante. Cada etapa tem no máximo 3–5 arquivos envolvidos e é validada isoladamente antes de avançar.

**Stack:** React + Zustand + TanStack Query + React Hook Form + Zod (frontend) | Express + Prisma + PostgreSQL (backend) | TypeScript em ambos.

---

## FASE 0 — Segurança Crítica (Executar Imediatamente)

> **Por que está separada:** Vulnerabilidade de segurança independente das demais fases. Não depende de nenhuma outra mudança.

### Etapa 0.1: Corrigir fallback inseguro do JWT_SECRET

**Arquivos envolvidos:**
- `src/middleware/auth.ts` (linha 4)

**O que fazer:**
```typescript
// ANTES (vulnerabilidade crítica — qualquer um que leia o código pode forjar tokens):
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// DEPOIS (falha em startup se não configurado — comportamento correto):
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[auth] JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar.');
}
```

**Contexto do risco:** Se alguém obtiver acesso ao código-fonte (repositório, build artifact), pode usar o fallback para criar JWTs assinados válidos e se passar por qualquer usuário — incluindo owners. Ambiente de produção sem `JWT_SECRET` configurado seria completamente comprometido.

**Riscos da mudança:** Mínimo. O servidor vai recusar o start se a variável não estiver configurada — comportamento desejado. Garantir que `.env` local tenha `JWT_SECRET` definido antes de aplicar.

**Verificar antes:**
1. `grep -r "JWT_SECRET" .env .env.example` — confirmar que a variável existe no ambiente

**Validação:**
- [ ] Servidor inicia normalmente com `JWT_SECRET` definido no `.env`
- [ ] Sem `JWT_SECRET` → servidor rejeita start com mensagem clara (não sobe silenciosamente)
- [ ] Login de owner funciona normalmente
- [ ] `npm run build`

**Ordem de execução:**
1. Verificar que `JWT_SECRET` está no `.env` local
2. Editar `src/middleware/auth.ts` linha 4
3. Testar start do servidor
4. Testar login

---

## FASE 1 — Limpeza de Código Morto

> Risco mínimo: arquivos com zero importações confirmadas. TypeScript confirma automaticamente no build se algo foi esquecido.

### Etapa 1.1: Remover `useServiceOrderForm.ts`

**Arquivos envolvidos:**
- `src/hooks/useServiceOrderForm.ts` ← DELETAR (211 linhas)

**O que fazer:**
Verificar com grep antes de deletar. Confirmado: 0 importações no codebase.

**Riscos:** Nenhum. O hook é um resquício de versão anterior que nunca foi removido.

**Validação:**
- [ ] `grep -r "useServiceOrderForm" src/` → 0 resultados
- [ ] Deletar arquivo
- [ ] `npm run build` → zero erros

---

### Etapa 1.2: Remover `useDashboardStats.ts`

**Arquivos envolvidos:**
- `src/hooks/useDashboardStats.ts` ← DELETAR (64 linhas)

**O que fazer:**
`useStats.ts` já faz a mesma coisa via backend. Este hook filtra/agrega no cliente o que já vem do servidor — duplicação desnecessária.

**Riscos:** Nenhum. Confirmado: 0 importações no codebase.

**Validação:**
- [ ] `grep -r "useDashboardStats" src/` → 0 resultados
- [ ] Deletar arquivo
- [ ] `npm run build` → zero erros

---

### Etapa 1.3: Remover `useFilteredData.ts`

**Arquivos envolvidos:**
- `src/hooks/useFilteredData.ts` ← DELETAR (129 linhas)

**O que fazer:**
Hook que refiltrava no cliente dados já filtrados pelo backend. Causa inconsistências com paginação (filtra só a página atual).

**IMPORTANTE:** Os filtros do `useFilterStore.ts` usados por este hook **não devem ser removidos** — eles são usados diretamente pelos hooks de cada entidade via backend queries:
- `osSearchTerm`, `osStatusFilter`, `osPriorityFilter`, `osSortBy`, `osDateFilter` → `useServiceOrders.ts`
- `searchTerm`, `filterType`, `filterCategory`, `dateFilterMode`, etc. → `useTransactions.ts`
- `customerSearchTerm` → `useCustomers.ts`
- `paymentSearchTerm`, `paymentFilterStatus` → `useClientPayments.ts`
- `inventorySearchTerm`, `inventoryCategoryFilter` → usados nas páginas de estoque
- `reportMonth`, `reportPeriodFilter`, etc. → `useStats.ts`
- `showReportFilters` → `EnhancedReports.tsx` (ATENÇÃO: este está em uso — NÃO remover)

**Riscos:** Nenhum no delete. A confusão seria tentar remover filtros do FilterStore junto — não fazer isso agora.

**Validação:**
- [ ] `grep -r "useFilteredData" src/` → 0 resultados
- [ ] Deletar arquivo
- [ ] `npm run build` → zero erros
- [ ] Testar filtros nas 5 páginas no browser: Transações, Clientes, OS, Estoque, Relatórios

---

## FASE 2 — Unificar Sistema de Permissões

> **Contexto completo (descoberto na análise profunda):**
> - Não-owners têm suas permissões **armazenadas no banco** em formato frontend (`manage_transactions`, `view_dashboard`) — porque são atribuídas via `AVAILABLE_PERMISSIONS` nas telas Settings.tsx / UserManagement.tsx
> - Owners têm permissões **hardcoded** no login handler de `src/routes/auth.ts` (7 permissões, mas faltam `manage_service_orders` e `manage_inventory`)
> - `roles.ts` define `ROLE_PERMISSIONS` em formato `transaction:read` (backend) mas essa definição **nunca é chamada** para atribuir permissões — é letra morta
> - **Inconsistência real de bug:** Settings.tsx tem `manage_service_orders` mas não `manage_users`. UserManagement.tsx tem `manage_users` mas não `manage_service_orders`. Nenhuma lista tem `manage_inventory`. Resultado: admin pode criar usuários sem poder atribuir `manage_inventory` nunca.

### Etapa 2.1: Criar fonte única de verdade para permissões disponíveis

**Arquivos envolvidos:**
- `src/constants/permissions.ts` ← CRIAR (arquivo novo)

**O que fazer:**
Criar a lista única de permissões do sistema:
```typescript
export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard',        label: 'Ver Painel/Dashboard' },
  { id: 'manage_transactions',   label: 'Gerenciar Transações (Fluxo)' },
  { id: 'manage_payments',       label: 'Vendas e Pagamentos' },
  { id: 'manage_service_orders', label: 'Ordens de Serviço' },
  { id: 'manage_customers',      label: 'Clientes' },
  { id: 'manage_inventory',      label: 'Estoque' },
  { id: 'view_reports',          label: 'Relatórios' },
  { id: 'manage_settings',       label: 'Configurações' },
  { id: 'manage_users',          label: 'Gerenciar Usuários' },
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number]['id'];

export const OWNER_PERMISSIONS: Permission[] = [
  'view_dashboard', 'manage_transactions', 'manage_payments', 'manage_service_orders',
  'manage_customers', 'manage_inventory', 'view_reports', 'manage_settings', 'manage_users'
];
```

**Riscos:** Nenhum — arquivo novo.

**Validação:**
- [ ] `npm run build` → zero erros de tipo

---

### Etapa 2.2: Atualizar `Settings.tsx` e `UserManagement.tsx` para importar de `permissions.ts`

**Arquivos envolvidos:**
- `src/components/settings/Settings.tsx`
- `src/components/settings/UserManagement.tsx` (ou caminho equivalente)

**O que fazer:**
- Substituir as duas `AVAILABLE_PERMISSIONS` locais pela importada de `src/constants/permissions.ts`
- Verificar que os checkboxes de permissões continuam renderizando corretamente
- Agora um admin pode atribuir `manage_inventory` e `manage_service_orders` a não-owners

**Riscos:** Baixo. O TypeScript garante que a nova lista é compatível. A mudança visual é: aparecerão `manage_inventory` e `manage_service_orders` em lugares que não tinham antes.

**Validação:**
- [ ] `npm run build` → zero erros
- [ ] Abrir Settings → editar um usuário não-owner → confirmar que todos os 9 checkboxes aparecem
- [ ] Salvar permissões e relogar → confirmar que são aplicadas

---

### Etapa 2.3: Corrigir permissões hardcoded do owner em `src/routes/auth.ts`

**Arquivos envolvidos:**
- `src/routes/auth.ts` (linhas 32-34)

**O que fazer:**
```typescript
// ANTES (incompleto — falta manage_service_orders e manage_inventory):
if (user.role === 'owner') {
  permissions = ['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users'];
}

// DEPOIS (usa constante centralizada):
import { OWNER_PERMISSIONS } from '../constants/permissions';
// ...
if (user.role === 'owner') {
  permissions = [...OWNER_PERMISSIONS];
}
```

**ATENÇÃO sobre JWTs existentes:** Permissões **não estão no JWT** (confirmado na análise). Estão no objeto `user` retornado pelo login e armazenado em localStorage. Owners logados com JWT antigo ainda têm o fallback `currentUser.role === 'owner' → return true` no `hasPermission()`, então não sofrerão regressão. Mas para garantir consistência, os owners devem fazer logout/login após essa mudança.

**Riscos:** Baixo para a aplicação. Owners precisam relogar para ver as novas permissões no objeto user (mas o acesso já funcionava pelo bypass de role).

**Validação:**
- [ ] `npm run build` → zero erros
- [ ] Login como owner → inspecionar localStorage `currentUser.permissions` → deve conter todos os 9 itens
- [ ] Verificar que todas as páginas estão acessíveis para owner

---

### Etapa 2.4: Atualizar `roles.ts` para usar formato unificado

**Arquivos envolvidos:**
- `src/middleware/roles.ts`

**O que fazer:**
Substituir `ROLE_PERMISSIONS` de formato `transaction:read` para o formato unificado frontend. Esta definição atualmente não é usada para atribuir permissões a ninguém, mas serve como referência para o middleware `requirePermission()` e deve ser consistente:

```typescript
import { OWNER_PERMISSIONS, Permission } from '../constants/permissions';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [...OWNER_PERMISSIONS],
  manager: [
    'view_dashboard', 'manage_transactions', 'manage_payments',
    'manage_service_orders', 'manage_customers', 'manage_inventory', 'view_reports'
  ],
  employee: [
    'view_dashboard', 'manage_transactions', 'manage_payments',
    'manage_service_orders', 'manage_customers', 'manage_inventory'
  ],
};
```

**Riscos:** Baixo. `ROLE_PERMISSIONS` não é usado para atribuição de permissões. O middleware `requirePermission()` existe mas as rotas não o usam. Nenhuma funcionalidade atual depende deste objeto.

**Validação:**
- [ ] `npm run build` → zero erros de tipo
- [ ] `npx tsc --noEmit` → zero erros

---

## FASE 3 — Corrigir CSS-in-JS no `App.tsx`

> Simples e isolado. A tag `<style>` recria o elemento DOM a cada render do App, o que é incorreto.

### Etapa 3.1: Substituir `<style>` inline por `useEffect + style.setProperty`

**Arquivos envolvidos:**
- `src/App.tsx` (linhas ~227-231)

**O que fazer:**
```typescript
// REMOVER do JSX:
<style>{`:root { --color-primary: ${settings?.primaryColor || '#1152d4'}; }`}</style>

// ADICIONAR dentro do componente App (antes do return):
useEffect(() => {
  document.documentElement.style.setProperty(
    '--color-primary',
    settings?.primaryColor ?? '#1152d4'
  );
}, [settings?.primaryColor]);
```

**Contexto técnico:** `settings` carrega de forma assíncrona. No primeiro render, `settings` é `undefined` e a cor padrão `'#1152d4'` é aplicada. Quando `settings` carrega, o `useEffect` atualiza a variável CSS — comportamento idêntico ao atual mas sem recriar a tag `<style>` a cada render.

**Riscos:** Mínimo. Pode haver uma discrepância de 1 frame se o tema personalizado demorar para carregar, mas isso já acontecia com o método anterior.

**Validação:**
- [ ] `npm run build`
- [ ] Abrir app → cor primária aplicada corretamente
- [ ] Mudar cor primária nas configurações → UI atualiza
- [ ] Inspecionar DevTools: nenhuma tag `<style>` no `<head>` com variável CSS

---

## FASE 4 — Middleware de Validação Zod no Backend

> Eliminar 7 blocos try/catch ZodError idênticos espalhados pelas rotas.
> **Atenção especial:** `inventory.ts` não usa Zod — requer abordagem diferente. `client-payments.ts` tem apenas 1 dos 3 handlers com Zod.

### Etapa 4.1: Criar `src/middleware/validate.ts`

**Arquivos envolvidos:**
- `src/middleware/validate.ts` ← CRIAR

**O que fazer:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Falha na validação',
        details: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

**Nota sobre `req.body = result.data`:** O schema Zod usa `.strip()` por padrão (remove campos desconhecidos). Se alguma rota depende de campos extras no body que não estão no schema, eles serão removidos. Verificar isso para cada rota antes de aplicar.

**Riscos:** Nenhum — arquivo novo.

**Validação:**
- [ ] `npm run build` → zero erros

---

### Etapa 4.2: Aplicar `validate()` em `transactions.ts` (2 blocos Zod)

**Arquivos envolvidos:**
- `src/routes/transactions.ts`

**O que fazer:**
Substituir os blocos ZodError nos handlers POST e PUT. Verificar primeiro se o schema usado no handler (`TransactionSchema` ou similar) cobre todos os campos necessários para a operação.

```typescript
// ANTES:
router.post('/', async (req, res) => {
  try {
    const data = SomeSchema.parse(req.body);
    // ...lógica...
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: '...', details: err.issues });
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DEPOIS:
router.post('/', validate(SomeSchema), async (req, res) => {
  try {
    const data = req.body; // já validado e tipado pelo middleware
    // ...lógica...
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

**Validação:**
- [ ] `npm run build`
- [ ] POST `/transactions` body inválido → 400 com `details`
- [ ] POST `/transactions` body válido → funciona normalmente
- [ ] PUT `/transactions/:id` idem

---

### Etapa 4.3: Aplicar `validate()` em `customers.ts` e `service-orders.ts` (4 blocos Zod)

**Arquivos envolvidos:**
- `src/routes/customers.ts` (2 blocos: POST e PUT)
- `src/routes/service-orders.ts` (2 blocos: POST e PUT)

**O que fazer:** Mesmo padrão da Etapa 4.2. Para `service-orders.ts`, verificar se o handler PUT usa o mesmo schema do POST ou um schema de atualização parcial.

**Validação:** Testar POST e PUT com body inválido/válido após cada arquivo.

---

### Etapa 4.4: Aplicar `validate()` em `client-payments.ts` (1 bloco Zod)

**Arquivos envolvidos:**
- `src/routes/client-payments.ts`

**O que fazer:** Apenas o POST principal tem Zod. Os handlers PATCH e POST/:id/pay fazem extração manual de campos — não alterar esses handlers nesta fase.

**Riscos:** Baixo. Apenas 1 handler sendo alterado.

**Validação:**
- [ ] POST `/client-payments` body inválido → 400
- [ ] POST `/client-payments` body válido → funciona

---

### Etapa 4.5: Avaliar `inventory.ts` — adicionar validação Zod

**Arquivos envolvidos:**
- `src/routes/inventory.ts`
- (possivelmente) `src/schemas/` — criar schema de inventory se não existir

**O que fazer:**
`inventory.ts` não usa Zod atualmente — faz extração manual de campos. Primeiro, verificar se existe um `InventorySchema` ou similar em `src/schemas/`. Se não existir, criar o schema e então aplicar `validate()`. Se o schema não existir e criar um for arriscado (pode rejeitar dados válidos existentes), adiar para Fase 8.

**Riscos:** Médio — criar schema errado pode rejeitar requests válidos. Verificar os campos aceitos antes.

**Validação:**
- [ ] POST e PUT de itens de estoque funcionam normalmente
- [ ] Campos inválidos retornam 400

---

## FASE 5 — Abstrair CRUD Boilerplate nos Hooks

> Eliminar ~250 linhas de código repetido. 5 hooks seguem o mesmo padrão de mutations.
> **EXCEÇÃO:** `useServiceOrders.ts` tem lógica especial de concorrência (`_clientUpdatedAt` + 409 Conflict) — não migrar.

### Etapa 5.1: Criar `src/hooks/useCrudApi.ts`

**Arquivos envolvidos:**
- `src/hooks/useCrudApi.ts` ← CRIAR

**O que fazer:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api'; // verificar o caminho correto do axios instance

interface CrudApiOptions<T> {
  baseKey: string;
  endpoint: string;
  saveSuccessMessage?: string;
  deleteSuccessMessage?: string;
  extraInvalidations?: string[][];
  onSaveSuccess?: () => void;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function useCrudApi<T>({
  baseKey, endpoint, saveSuccessMessage, deleteSuccessMessage,
  extraInvalidations, onSaveSuccess, showToast,
}: CrudApiOptions<T>) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({ item, id }: { item: Partial<T>; id?: number }) => {
      const { data } = id
        ? await api.put(`${endpoint}/${id}`, item)
        : await api.post(endpoint, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseKey] });
      extraInvalidations?.forEach(key =>
        queryClient.invalidateQueries({ queryKey: key })
      );
      showToast?.(saveSuccessMessage ?? 'Salvo com sucesso!', 'success');
      onSaveSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Erro ao salvar.';
      showToast?.(msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [baseKey] });
      extraInvalidations?.forEach(key =>
        queryClient.invalidateQueries({ queryKey: key })
      );
      showToast?.(deleteSuccessMessage ?? 'Excluído com sucesso!', 'success');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Erro ao excluir.';
      showToast?.(msg, 'error');
    },
  });

  return { saveMutation, deleteMutation };
}
```

**Nota:** O tipo `unknown` em vez de `any` no `onError` é intencional — melhoria de tipagem.

**Riscos:** Nenhum — arquivo novo.

**Validação:**
- [ ] `npm run build` → zero erros de tipo

---

### Etapa 5.2: Refatorar `useTransactions.ts`

**Arquivos envolvidos:**
- `src/hooks/useTransactions.ts`

**O que fazer:**
Substituir `saveMutation` e `deleteMutation` por `useCrudApi`.

**ATENÇÃO CRÍTICA:** `useTransactions.ts` usa `refetchQueries` (não `invalidateQueries`) no `onSuccess`. Verificar se isso é intencional:
- `invalidateQueries`: marca como stale, refetch acontece quando a query está ativa
- `refetchQueries`: força refetch imediato independente de estar ativo

Se a UI precisa de atualização imediata (sem depender do componente estar montado), usar `refetchQueries`. Se for seguro usar `invalidateQueries`, o hook genérico serve. Verificar o comportamento antes de migrar.

**Também:** Manter `extraInvalidations: [['dashboard-stats']]` para que o dashboard atualize junto.

**Riscos:** Médio — mudança de `refetchQueries` para `invalidateQueries` pode causar delay visual. Testar cuidadosamente.

**Validação:**
- [ ] `npm run build && npm test`
- [ ] Criar transação → lista atualiza imediatamente
- [ ] Editar transação → lista atualiza
- [ ] Excluir transação → lista atualiza
- [ ] Dashboard atualiza após criar/excluir transação

---

### Etapa 5.3: Refatorar `useCustomers.ts` e `useInventory.ts`

**Arquivos envolvidos:**
- `src/hooks/useCustomers.ts`
- `src/hooks/useInventory.ts`

**O que fazer:** Estes dois são os mais simples — sem invalidações extras, sem casos especiais. Substituir as 4 mutations (2 por hook) por 2 chamadas ao `useCrudApi`.

**Riscos:** Baixo.

**Validação:**
- [ ] CRUD completo de clientes: criar, editar, excluir — toast aparece, lista atualiza
- [ ] CRUD completo de estoque: criar, editar, excluir — toast aparece, lista atualiza
- [ ] `npm run build && npm test`

---

### Etapa 5.4: Refatorar `useClientPayments.ts` — apenas as 2 mutations básicas

**Arquivos envolvidos:**
- `src/hooks/useClientPayments.ts`

**O que fazer:**
Este hook tem **4 mutations no total**:
1. `addPaymentMutation` — POST `/client-payments` (criar novo)
2. `savePaymentMutation` — POST/PUT condicional (salvar/atualizar)
3. `deletePaymentMutation` — DELETE (excluir)
4. `recordPaymentMutation` — POST `/:id/pay` (registrar pagamento parcial — lógica especial)

Migrar para `useCrudApi` **apenas** `savePaymentMutation` e `deletePaymentMutation`.
Manter `addPaymentMutation` e `recordPaymentMutation` intactos (têm comportamento distinto).

**ATENÇÃO:** Verificar se `addPaymentMutation` e `savePaymentMutation` são redundantes (ambos fazem POST para criar). Se forem, consolidar em uma única mutation via `useCrudApi` antes de finalizar.

**Riscos:** Médio — não confundir as 4 mutations. TypeScript vai alertar se algo for quebrado.

**Validação:**
- [ ] Criar pagamento → funciona
- [ ] Editar pagamento → funciona
- [ ] Excluir pagamento → funciona
- [ ] Registrar pagamento parcial → funciona (esta mutation NÃO foi migrada)
- [ ] `npm run build && npm test`

---

### Etapa 5.5: `useServiceOrders.ts` — MANTER COMO ESTÁ

**Motivo:** Lógica de concorrência com `_clientUpdatedAt` e tratamento especial de `409 Conflict` não se encaixa no padrão genérico sem adicionar complexidade desnecessária ao hook. Benefício de migrar seria menor que o risco.

---

## FASE 6 — Performance: Fixes Pontuais

### Etapa 6.1: Corrigir `staleTime: 0` em `useTransactions.ts`

**Arquivos envolvidos:**
- `src/hooks/useTransactions.ts`

**O que fazer:**
```typescript
// ANTES:
staleTime: 0,
refetchOnMount: true,

// DEPOIS (consistente com todos os outros hooks):
staleTime: 30_000,
```

**Contexto:** Todos os outros hooks usam `staleTime: 30_000`. Com `staleTime: 0`, toda navegação entre abas causa um request desnecessário ao backend de transações.

**Riscos:** Baixo. Usuário pode ver dados com até 30s de atraso ao trocar de aba — comportamento idêntico aos outros módulos e aceitável.

**Validação:**
- [ ] Criar transação → navegar para dashboard → voltar → transação nova aparece
- [ ] `npm run build`

---

### Etapa 6.2: Corrigir bug de reset de ordem dos cards no `Dashboard.tsx`

**Arquivos envolvidos:**
- `src/components/dashboard/Dashboard.tsx` (linhas 68-69)

**CONTEXTO DO BUG (mais complexo que aparenta):**
O `DraggableGrid` usa localStorage para persistir a ordem dos cards. Quando o usuário reordena:
1. DraggableGrid salva nova ordem no localStorage
2. DraggableGrid chama `onReorder(novaOrdem)` → Dashboard faz `setCards(novaOrdem)`
3. Stats atualizam → `initialCards` useMemo recalcula → `useEffect(() => setCards(initialCards))` dispara → **ORDER RESET!**
4. DraggableGrid está agora com ordem diferente do que o usuário definiu

O bug real é: `useEffect` que sincroniza `cards` com `initialCards` destrói a ordem customizada a cada atualização de dados.

**Fix correto:**
```typescript
// Manter useState para DraggableGrid funcionar (ele precisa de callback onReorder)
// Mas corrigir o useEffect para só atualizar CONTEÚDO, preservando ORDEM:

useEffect(() => {
  setCards(prev =>
    prev.map(card => {
      const updated = initialCards.find(c => c.id === card.id);
      return updated ?? card;
    })
  );
}, [initialCards]);
```

Assim: quando stats atualizam, o conteúdo de cada card (valores monetários) atualiza, mas a ordem que o usuário definiu é preservada.

**Riscos:** Médio. Se um card novo for adicionado futuro (novo `id`), não aparecerá na lista. Mas a lista de cards é estática hoje — 4 cards fixos.

**Validação:**
- [ ] Arrastar cards para nova ordem
- [ ] Aguardar 30+ segundos (tempo de refetch de stats)
- [ ] Confirmar que a ordem customizada é preservada após atualização
- [ ] Confirmar que os valores dos cards atualizam (não ficam congelados)
- [ ] `npm run build`

---

### Etapa 6.3: Lazy load do componente QRCode em `ServiceOrderForm.tsx`

**Arquivos envolvidos:**
- `src/components/service-orders/ServiceOrderForm.tsx`

**O que fazer:**
Localizar a importação do QRCode e convertê-la para lazy:
```typescript
// ANTES:
import QRCode from 'react-qr-code'; // importado sempre, mesmo que raramente usado

// DEPOIS:
const QRCode = React.lazy(() => import('react-qr-code'));
// No JSX onde QRCode é usado:
<React.Suspense fallback={<div className="animate-pulse h-32 w-32 bg-gray-200 rounded" />}>
  <QRCode value={qrValue} />
</React.Suspense>
```

**Riscos:** Baixo. QRCode só é exibido em modal específico dentro do form. O Suspense garante graceful degradation enquanto carrega.

**Validação:**
- [ ] `npm run build`
- [ ] Abrir modal QRCode de uma OS → carrega corretamente (pode haver loading breve)
- [ ] `npm run build -- --analyze` (se disponível) → bundle de ServiceOrderForm menor

---

## FASE 7 — Refatorar `ServiceOrderForm.tsx` (RISCO ALTO)

> 641 linhas, 22 props, 6 useEffect, lógica de fotos complexa. Maior risco de regressão do plano inteiro.
> Estratégia: migração gradual via Context sem remover props antigas — TypeScript detecta inconsistências.

### Etapa 7.1: Criar `src/contexts/ServiceOrderFormContext.tsx`

**Arquivos envolvidos:**
- `src/contexts/ServiceOrderFormContext.tsx` ← CRIAR

**O que fazer:**
Tipar todas as 22 props atuais no contexto:
```typescript
import { createContext, useContext } from 'react';
import type { /* todos os tipos necessários */ } from '../types';

interface ServiceOrderFormContextValue {
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  editingOrder: ServiceOrder | null;
  setEditingOrder: (o: ServiceOrder | null) => void;
  customers: Customer[];
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: { id: number; name: string }[];
  brands: Brand[];
  models: Model[];
  currentUser: User | null;
  onAddOrder: (order: unknown) => Promise<number | null>;
  onUpdateOrder: (id: number, order: unknown, updatedAt?: string) => Promise<boolean>;
  onAddEquipmentType: (name: string) => Promise<void>;
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onTriggerAddCustomer: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  setSelectedOrder: (order: ServiceOrder | null) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  setShowQRCodeModal: (show: boolean) => void;
  onGeneratePayment?: (order: unknown) => void;
}

export const ServiceOrderFormContext = createContext<ServiceOrderFormContextValue | null>(null);

export function useServiceOrderFormContext(): ServiceOrderFormContextValue {
  const ctx = useContext(ServiceOrderFormContext);
  if (!ctx) {
    throw new Error('useServiceOrderFormContext deve ser usado dentro de ServiceOrderFormContext.Provider');
  }
  return ctx;
}
```

**Riscos:** Nenhum — arquivo novo.

**Validação:**
- [ ] `npm run build` → zero erros

---

### Etapa 7.2: Envolver ServiceOrderForm com Provider na página pai

**Arquivos envolvidos:**
- `src/pages/ServiceOrdersPage.tsx` (ou página que renderiza o form)

**O que fazer:**
Identificar onde `<ServiceOrderForm ... />` é chamado com as 22 props. Envolver com o Provider:

```tsx
<ServiceOrderFormContext.Provider value={{
  isAdding, setIsAdding, editingOrder, setEditingOrder,
  customers, inventoryItems, statuses, equipmentTypes,
  brands, models, currentUser, onAddOrder, onUpdateOrder,
  onAddEquipmentType, onAddBrand, onAddModel,
  onTriggerAddCustomer, showToast, onOpenConfirm,
  setSelectedOrder, setShowWhatsAppModal, setShowQRCodeModal,
  onGeneratePayment,
}}>
  <ServiceOrderForm /> {/* todas as props removidas do componente */}
</ServiceOrderFormContext.Provider>
```

**ESTRATÉGIA DE SEGURANÇA:** Nesta etapa, **manter as props no componente ServiceOrderForm** ainda como `optional` (com `?`). Usar context como fonte de dados, mas manter interface de props para que o TypeScript alertaria se algo quebrar. Em uma segunda passagem (7.3), remover as props.

**Riscos:** Alto. Verificar que TODOS os locais onde `ServiceOrderForm` é renderizado foram atualizados. Buscar por `<ServiceOrderForm` no codebase.

**Validação:**
- [ ] `npm run build` → zero erros TypeScript
- [ ] Criar nova OS: preencher todos os campos → salvar → aparece na lista
- [ ] Editar OS existente → salvar → alterações persistidas
- [ ] Excluir OS → confirmação aparece → OS removida
- [ ] Adicionar cliente rápido via form → cliente aparece no select
- [ ] Upload de fotos no form → fotos aparecem
- [ ] Gerar pagamento de OS → modal de pagamento abre
- [ ] Modal WhatsApp → abre com dados corretos
- [ ] Modal QRCode → exibe QR correto

---

### Etapa 7.3: Remover props antigas da interface de `ServiceOrderForm.tsx`

**Arquivos envolvidos:**
- `src/components/service-orders/ServiceOrderForm.tsx`

**O que fazer:**
Após 7.2 funcionar, remover todas as props da interface e substituir o uso de props por `useServiceOrderFormContext()` no corpo do componente. TypeScript vai garantir que nada foi esquecido.

**Riscos:** Médio. Se algum consumidor do componente fora da ServiceOrdersPage existir (buscar por `<ServiceOrderForm`), precisará ser envolvido com o Provider também.

**Validação:**
- [ ] `npx tsc --noEmit` → zero erros
- [ ] Repetir todos os testes da Etapa 7.2

---

### Etapa 7.4: Corrigir `@ts-ignore` no `useFieldArray`

**Arquivos envolvidos:**
- `src/components/service-orders/ServiceOrderForm.tsx`
- Possível: schema Zod de ServiceOrder em `src/schemas/`

**O que fazer:**
Identificar qual campo do schema Zod não está sendo inferido corretamente. O `useFieldArray` com Zod normalmente falha quando o campo é `z.array()` com discriminated union ou quando o schema usa `.superRefine()`.

Fix padrão:
```typescript
// ANTES (@ts-ignore):
// @ts-ignore - React Hook Form tem problemas com inferência complexa de Zod
const { fields: serviceFields } = useFieldArray({ control, name: 'services' });

// DEPOIS (tipar explicitamente o schema do array):
import type { FieldArrayPath } from 'react-hook-form';
// Ajustar o tipo do schema Zod para que o inferido seja compatível com useFieldArray
const { fields: serviceFields } = useFieldArray({
  control,
  name: 'services' as FieldArrayPath<ServiceOrderFormValues>,
});
```

**Riscos:** Médio — pode revelar incompatibilidade real entre o schema Zod e o tipo do form.

**Validação:**
- [ ] `npm run build` sem `@ts-ignore`
- [ ] `npx tsc --noEmit` → zero erros
- [ ] Formulário de OS com múltiplos serviços funciona normalmente

---

## FASE 8 — Tipagem: Eliminar `any`

> Substituir ocorrências de `any` por tipos concretos. TypeScript guia cada mudança.

### Etapa 8.1: Tipar `useServiceOrders.ts`

**Arquivos envolvidos:**
- `src/hooks/useServiceOrders.ts`

**O que fazer:**
```typescript
// ANTES:
mutationFn: async ({ order, id, updatedAt }: { order: any; id?: number; updatedAt?: string })

// DEPOIS — verificar o tipo real do schema Zod e usar:
import type { ServiceOrderFormValues } from '../schemas/serviceOrderSchema'; // verificar nome correto
mutationFn: async ({ order, id, updatedAt }: { order: ServiceOrderFormValues; id?: number; updatedAt?: string })
```

**Verificar:** Se `ServiceOrderFormValues` não existir, criá-lo via `z.infer<typeof ServiceOrderSchema>`.

**Validação:**
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`

---

### Etapa 8.2: Tipar `service-order.service.ts`

**Arquivos envolvidos:**
- Arquivo de serviço backend de service orders (verificar path exato)

**O que fazer:**
```typescript
// ANTES:
where: Record<string, unknown>
updateData: Record<string, unknown>

// DEPOIS — usar tipos gerados pelo Prisma:
import { Prisma } from '@prisma/client';
where: Prisma.ServiceOrderWhereInput
updateData: Prisma.ServiceOrderUpdateInput
```

**ATENÇÃO:** Verificar se campos customizados (como `_clientUpdatedAt`) existem no tipo Prisma ou são removidos antes de passar ao Prisma.

**Validação:**
- [ ] `npx tsc --noEmit` → zero erros
- [ ] Salvar e buscar OS → funciona normalmente

---

### Etapa 8.3: Tipar `useClientPayments.ts`

**Arquivos envolvidos:**
- `src/hooks/useClientPayments.ts`

**O que fazer:**
Substituir `payment: any` pelo tipo do schema Zod de ClientPayment.

**Validação:**
- [ ] `npx tsc --noEmit`
- [ ] CRUD completo de pagamentos funciona

---

## FASE 9 — Migração de Schema do Banco (REQUER BACKUP CONFIRMADO)

> ⚠️ ESTA FASE NÃO COMEÇA SEM BACKUP DO BANCO VALIDADO.
> Todas as datas já estão em formato `yyyy-MM-dd` (confirmado na análise) — conversão para DateTime é limpa.
> Rollback: manter migration antiga, reverter schema, fazer `prisma migrate reset` em dev.

### Etapa 9.1: Migrar `Transaction.date` para `DateTime`

**Arquivos envolvidos:**
- `prisma/schema.prisma`
- `src/routes/transactions.ts`
- `src/services/transaction.service.ts`
- `src/schemas/` (schemas Zod — ajustar validação de `z.string().regex(...)` para `z.coerce.date()` ou manter como string e converter no service)

**O que fazer:**
1. Criar migration: `npx prisma migrate dev --name migrate_transaction_date_to_datetime`
2. O Prisma converte `yyyy-MM-dd` strings para DateTime automaticamente no PostgreSQL
3. Atualizar queries de filtro — de comparação de string para operadores DateTime nativos:
   ```typescript
   // ANTES (comparação de string):
   where: { date: { gte: '2024-01-01', lte: '2024-12-31' } }
   
   // DEPOIS (operadores DateTime nativos):
   where: { date: { gte: new Date('2024-01-01'), lte: new Date('2024-12-31') } }
   ```
4. Frontend: continuar enviando `yyyy-MM-dd` strings — o Prisma faz o parse
5. Frontend: continuar exibindo no formato BR (`dd/MM/yyyy`) usando `format()` do date-fns

**Riscos:** Alto com dados em produção. Fazer backup + testar em banco de desenvolvimento primeiro.
- Se alguma data tiver formato diferente de `yyyy-MM-dd`, migration falha
- Queries que usavam comparação de string precisam ser atualizadas

**Validação:**
- [ ] Backup do banco confirmado
- [ ] Migration bem-sucedida em ambiente de desenvolvimento
- [ ] Todos os dados existentes preservados
- [ ] Filtros de data funcionando (intervalo, mês, dia)
- [ ] Criação e edição de transação funciona
- [ ] `npm run build && npm test`

---

### Etapa 9.2: Migrar campos de data em `ServiceOrder` e `ClientPayment`

**Arquivos envolvidos:**
- `prisma/schema.prisma` (`entryDate`, `deliveryDate` em ServiceOrder; `dueDate`, `purchaseDate` em ClientPayment)
- Arquivos de serviço e rotas correspondentes

**O que fazer:** Mesmo padrão da Etapa 9.1. Executar apenas após 9.1 validada.

**Validação:** Mesmos critérios da 9.1 para OS e Pagamentos.

---

### Etapa 9.3: Migrar `partsUsed`/`services`/`arrivalPhotoUrls` para `Json` nativo

**Arquivos envolvidos:**
- `prisma/schema.prisma`
- Serviço de ServiceOrder (remover `JSON.stringify` na escrita e `safeParseJSON` na leitura)

**ATENÇÃO CRÍTICA:** Esta migration é mais complexa que as de data. Os dados existentes são strings JSON como `"[{\"name\":\"peça\"}]"`. Precisam de script de migration que converta:
```sql
-- Exemplo de migration manual no PostgreSQL:
UPDATE "ServiceOrder" SET "partsUsed" = "partsUsed"::jsonb WHERE "partsUsed" IS NOT NULL;
```
Mas isso só funciona se os dados forem JSON válido. Verificar se existem valores como `""`, `"null"`, `"[]"` antes.

**Riscos:** ALTO — se algum registro tiver JSON inválido, a migration falha e o banco fica em estado inconsistente sem rollback preparado.

**Validação:**
- [ ] Backup confirmado
- [ ] Script verifica JSON válido em TODOS os registros antes de migrar
- [ ] Migration bem-sucedida
- [ ] OS com fotos, serviços e peças carregam corretamente
- [ ] Criar nova OS com fotos/peças/serviços → persiste e carrega corretamente
- [ ] `npm run build && npm test`

---

## Progresso Geral

| Fase | Status | Etapas Concluídas |
|------|--------|-------------------|
| 0 — Segurança JWT | ⏳ | 0/1 |
| 1 — Código Morto | ⏳ | 0/3 |
| 2 — Permissões | ⏳ | 0/4 |
| 3 — CSS-in-JS | ⏳ | 0/1 |
| 4 — Middleware Validate | ⏳ | 0/5 |
| 5 — CRUD Boilerplate | ⏳ | 0/5 |
| 6 — Performance | ⏳ | 0/3 |
| 7 — ServiceOrderForm | ⏳ | 0/4 |
| 8 — Tipagem | ⏳ | 0/3 |
| 9 — DB Migration | ⏳ | 0/3 |

**Total: 0/32 etapas concluídas**

---

## Checklist Universal (aplicar após CADA etapa)

- [ ] `npm run build` → zero erros de compilação
- [ ] `npm test` → todos os testes passando (se existirem para a área modificada)
- [ ] Funcionalidade afetada testada manualmente no browser
- [ ] Nenhuma regressão nas páginas adjacentes

---

## Ordem de Execução Final

```
0.1 → [SECURITY CHECK]
→ 1.1 → 1.2 → 1.3 → [BUILD CHECK]
→ 2.1 → 2.2 → 2.3 → 2.4 → [BUILD + PERMISSIONS TEST]
→ 3.1 → [BUILD + UI CHECK]
→ 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → [BUILD + API TEST]
→ 5.1 → 5.2 → 5.3 → 5.4 → [BUILD + CRUD TEST]
→ 6.1 → 6.2 → 6.3 → [BUILD + UI TEST]
→ 7.1 → 7.2 → 7.3 → 7.4 → [BUILD + OS FULL FLOW TEST]
→ 8.1 → 8.2 → 8.3 → [npx tsc --noEmit]
→ [BACKUP BANCO] → 9.1 → 9.2 → 9.3 → [FULL REGRESSION TEST]
```
