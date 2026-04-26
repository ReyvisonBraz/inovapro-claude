# Fase 5 — Qualidade & Error Handling

**Status:** ⏳ Pendente  
**Prioridade:** 🟡 Alto  
**Estimativa:** 1 hora

## Problemas Atuais

- Sem global error handler no Express: exceções em rotas async podem crashar o processo silenciosamente
- Sem handlers de crash no processo Node.js
- Dados de seed falsos (Starbucks, Whole Foods) aparecem em todo deploy novo
- Sem indexes no banco: queries lentas em escala
- Endpoint `/api/stats` faz 12 queries em loop (N+1 problem)

## O que será feito

### 5.1 Global error handler Express em `server.ts`

Adicionar **antes** do `app.listen`, **depois** de todas as rotas:

```typescript
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', new Date().toISOString(), err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ error: 'Erro interno do servidor' });
});
```

### 5.2 Process crash handlers em `server.ts`

Adicionar logo após os imports (antes do `const app = express()`):

```typescript
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
  process.exit(1);
});
```

### 5.3 Remover seed fake de `server.ts` (linhas ~419-428)

Remover o bloco que insere transações de exemplo:
```typescript
// REMOVER este bloco:
if (transactionCount === 0) {
  // Inserir "Mercado Whole Foods", "Starbucks Coffee", etc.
}
```

Manter: admin user padrão, categorias padrão, status padrão de OS.

### 5.4 Adicionar indexes no banco em `server.ts`

Logo após todas as `CREATE TABLE IF NOT EXISTS` statements:

```typescript
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_client_payments_customer ON client_payments(customerId);
  CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
  CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON service_orders(customerId);
`);
```

### 5.5 Corrigir N+1 no `/api/stats` (linhas ~589-600)

**Antes (12 queries em loop):**
```typescript
for (let i = 0; i < 12; i++) {
  // query separada para cada mês
}
```

**Depois (query única com GROUP BY):**
```typescript
const monthlyData = db.prepare(`
  SELECT
    strftime('%Y-%m', date) as month,
    type,
    SUM(amount) as total,
    COUNT(*) as count
  FROM transactions
  WHERE date >= date('now', '-12 months')
  GROUP BY strftime('%Y-%m', date), type
  ORDER BY month ASC
`).all() as any[];

// Transformar o resultado flat em estrutura por mês no JS
const byMonth: Record<string, any> = {};
for (const row of monthlyData) {
  if (!byMonth[row.month]) byMonth[row.month] = { income: 0, expense: 0 };
  byMonth[row.month][row.type === 'income' ? 'income' : 'expense'] = Number(row.total);
}
```

## Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `server.ts` | Error handler global, crash handlers, remover seed, indexes, fix stats |

## Verificação

```bash
# 1. Verificar que seed não aparece em banco novo
rm -f data/finance.db
npm start
curl http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <token>"
# Deve retornar lista vazia, sem Starbucks/Whole Foods

# 2. Verificar indexes criados
sqlite3 data/finance.db ".indexes"
# Deve listar: idx_transactions_type, idx_transactions_date, etc.

# 3. Verificar stats endpoint
curl http://localhost:3000/api/stats \
  -H "Authorization: Bearer <token>"
# Deve retornar dados sem erro; verificar no log do servidor
# que só aparece 1 query de stats, não 12
```

## Status de Conclusão

- [ ] Global error handler adicionado ao Express
- [ ] `process.on('uncaughtException')` e `unhandledRejection` adicionados
- [ ] Seed de transações falsas removido
- [ ] 6 indexes criados no banco
- [ ] Endpoint `/api/stats` usa query única com GROUP BY
- [ ] Banco novo verificado: sem dados falsos
