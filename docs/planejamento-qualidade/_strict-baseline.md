# F3-03 — Baseline do `strict` (medido em 2026-07-08)

Medição feita com `npx tsc --noEmit --<flag>` no branch `qualidade/fase-0-preparacao`.

| Flag | Erros |
|------|:-----:|
| `noImplicitAny` | 14 |
| `strictFunctionTypes` | 5 |
| `strictNullChecks` | 25 |
| **`strict` (tudo)** | **32** (31 após excluir `scripts/`) |

**Boa notícia:** é bounded (~31), não centenas. Já está scaffolded:
- `tsconfig.json` já exclui `scripts/**/*` (scripts one-off históricos).
- Para executar: adicionar `"strict": true` em `tsconfig.json` e corrigir os 31.

## Os 31 erros por categoria e abordagem de correção

### Mecânicos e seguros (~20)
- **TS7006** (param `any` implícito) — 4: `ClientPaymentsPage` (payment/a/b ✅ já feito), `CustomersPage:62` (`c: Customer`). → anotar tipo.
- **TS18048** (possibly undefined) — 5: `AuditLogs:18,19` (`log.details`/`log.userName` → `?? ''`), `ServiceOrderForm:195,196` (`watchedServices`/`watchedParts` → `?? []`), `DrillDownModal:78` (`tx.tags` → `!` guardado pelo ternário). → guard `?.`/`??`.
- **TS2322 recharts Formatter** — 5: `EnhancedReports:578`, `OSReports:274,307,356,465`. Friction de tipos do recharts. → tipar o formatter como `Formatter<number, string>` (import de `recharts`) ou wrapper.

### Precisam de cuidado / são bugs reais (~11)
- **TS2783 `ref` especificado 2x** — 3: `AddTransactionModal:260,277,368`. **Bug real**: `ref={xRef} {...register()}` — o ref do register sobrescreve o manual, então o ref manual nunca é anexado. → mesclar refs: `const { ref: r, ...rest } = register('x'); <input ref={el => { r(el); xRef.current = el; }} {...rest} />`. **Verificar se os refs manuais são usados** (foco?); se não, remover.
- **TS2322 mismatch de callback/união** — App:167, ServiceOrders:342, InventoryPage:47, SettingsPage:34, GlobalModals:101, AddClientPaymentModal:172, Settings:461, ServiceOrderForm:476,492,496, ClientPaymentsPage:252 (✅ feito com wrapper). Vários são uniões divergentes (ex.: `InventoryPage:47` — o tipo de status inclui `'success'` num lado e não no outro). → alinhar os tipos de prop/união entre pai e filho (definir um tipo compartilhado). **Requer validar no app** (sem testes de componente).

## Recomendação de execução
Fazer numa sessão dedicada, rodando o app para validar as telas afetadas (OS, pagamentos, relatórios, transações). Ordem sugerida: mecânicos primeiro (commit), depois recharts (commit), depois os mismatches de callback com verificação de UI (commit), por fim `strict: true` consolidado.
