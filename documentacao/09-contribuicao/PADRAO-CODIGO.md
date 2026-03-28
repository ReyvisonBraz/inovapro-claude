# Padroes de Codigo

## Linguagem e Tipagem

- **TypeScript** em todo o projeto (frontend e backend)
- **Strict mode** habilitado no tsconfig.json
- Evitar `any` - usar tipos corretos ou `unknown`
- Interfaces definidas em `src/types.ts`

## Nomenclatura

| Elemento | Padrao | Exemplo |
|----------|--------|---------|
| Variaveis | camelCase | `totalAmount`, `isLoading` |
| Funcoes | camelCase | `handleSubmit`, `formatCurrency` |
| Componentes React | PascalCase | `ServiceOrders`, `AddTransactionModal` |
| Interfaces/Types | PascalCase | `Customer`, `ServiceOrder` |
| Constantes | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Arquivos de componente | PascalCase.tsx | `Dashboard.tsx`, `StatCard.tsx` |
| Arquivos de rota | kebab-case.routes.ts | `auth.routes.ts`, `serviceOrders.routes.ts` |
| Arquivos de hook | camelCase.ts | `useCustomers.ts`, `useAppSettings.ts` |
| Pastas | kebab-case | `service-orders/`, `client-payments/` |

## Componentes React

- Sempre funcoes (nunca classes)
- Exportar como `export default` ou `export function`
- Props tipadas com interface
- Um componente principal por arquivo

```typescript
// Exemplo de componente
interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
}

export default function Dashboard({ transactions, settings }: DashboardProps) {
  // ...
}
```

## Estilizacao

- **Tailwind CSS** para todos os estilos
- Sem CSS modules ou styled-components
- `clsx` + `tailwind-merge` para classes condicionais
- Classes custom em `index.css` apenas para efeitos especiais (glass, neon)

```typescript
// Composicao de classes
import { cn } from '../lib/utils';

<div className={cn("p-4 rounded-lg", isActive && "bg-blue-500", className)}>
```

## Backend

- Rotas em arquivos separados por dominio: `[dominio].routes.ts`
- Validacao com Zod em todo input do usuario
- Mensagens de erro em portugues
- Audit log em operacoes de escrita (CREATE, UPDATE, DELETE)
- SQL direto com better-sqlite3 (sem ORM por enquanto)

```typescript
// Exemplo de rota
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = TransactionSchema.parse(req.body);
    const result = db.prepare("INSERT INTO ...").run(...);
    logAudit(req.user.userId, "CREATE", "transaction", result.lastInsertRowid, data.description);
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    next(error);
  }
});
```

## Imports

- Imports relativos para arquivos do projeto
- Alias `@/` disponivel para raiz do src (configurado no Vite)
- Bibliotecas externas primeiro, depois internos

```typescript
// Ordem de imports
import { useState, useEffect } from 'react';           // React
import { motion } from 'motion/react';                  // Bibliotecas externas
import { Plus, Trash2 } from 'lucide-react';           // Icones
import { api } from '../services/api';                   // Servicos internos
import { cn, formatCurrency } from '../lib/utils';       // Utilitarios
import type { Customer } from '../types';                // Tipos
```

## Git

- Commits descritivos em portugues ou ingles
- Prefixos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Um commit por mudanca logica
- Nao commitar `.env`, `finance.db`, `node_modules/`, `dist/`
