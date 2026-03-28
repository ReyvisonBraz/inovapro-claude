# Servico API (Frontend)

## Arquivo: src/services/api.ts

Cliente HTTP centralizado que gerencia todas as requisicoes do frontend para o backend.

## Funcionalidade

- Encapsula `fetch()` nativo
- Adiciona automaticamente o token JWT em todas as requisicoes
- Trata erros de autenticacao (401)
- Faz auto-logout quando a sessao expira

## Metodos Disponiveis

### GET

```typescript
api.get(url: string): Promise<any>
```

Faz requisicao GET com autenticacao.

### POST

```typescript
api.post(url: string, data: object): Promise<any>
```

Faz requisicao POST com body JSON e autenticacao.

### PUT

```typescript
api.put(url: string, data: object): Promise<any>
```

Faz requisicao PUT com body JSON e autenticacao.

### PATCH

```typescript
api.patch(url: string, data: object): Promise<any>
```

Faz requisicao PATCH com body JSON e autenticacao.

### DELETE

```typescript
api.delete(url: string): Promise<any>
```

Faz requisicao DELETE com autenticacao.

## Autenticacao Automatica

Todas as requisicoes incluem automaticamente:

```
Headers:
  Content-Type: application/json
  Authorization: Bearer <token_do_localStorage>
```

O token e obtido de `localStorage("financeflow_token")`.

## Tratamento de Erros

### 401 Unauthorized

Quando o servidor retorna 401 (token expirado ou invalido):

1. Remove `financeflow_token` do localStorage
2. Remove `financeflow_user` do localStorage
3. Recarrega a pagina (`window.location.reload()`)
4. Usuario e redirecionado para login

### Outros Erros

- Erros sao propagados como `throw` para o componente chamador
- Componentes tratam individualmente com try/catch

## Exemplo de Uso

```typescript
import { api } from '../services/api';

// Buscar transacoes
const response = await api.get('/api/transactions?page=1&limit=20');
// response = { data: [...], meta: { total, page, limit, totalPages } }

// Criar transacao
const nova = await api.post('/api/transactions', {
  description: 'Venda de notebook',
  category: 'Vendas',
  type: 'income',
  amount: 2500,
  date: '2026-03-28'
});

// Atualizar transacao
await api.put('/api/transactions/1', {
  description: 'Venda de notebook Dell',
  amount: 2800
});

// Excluir transacao
await api.delete('/api/transactions/1');
```

## Utilitarios (lib/utils.ts)

### cn(...classes)

Combina classes CSS com suporte a condicional (clsx + tailwind-merge):

```typescript
cn("p-4 bg-blue-500", isActive && "bg-blue-700", className)
```

### formatCurrency(value)

Formata valor para moeda brasileira:

```typescript
formatCurrency(2500) // "R$ 2.500,00"
```

### formatMonthYear(date)

Formata data para mes/ano em portugues:

```typescript
formatMonthYear("2026-03") // "Marco 2026"
```

## Logger (lib/logger.ts)

Utilitario de log de erros para debug:

```typescript
import { logger } from '../lib/logger';

logger.error("Falha ao carregar transacoes", error);
```
