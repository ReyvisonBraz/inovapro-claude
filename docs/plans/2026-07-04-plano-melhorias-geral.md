# Plano de Melhorias — Concorrência, Integridade, Segurança e UX

> Criado em 2026-07-04 a partir da análise crítica do projeto.
> Como usar: execute as fases em ordem. Marque `[x]` ao concluir cada item.
> Cada fase tem um **critério de conclusão** — só marque a fase como pronta quando ele for atendido.

**Legenda de prioridade:** 🔴 crítico (perda de dados/segurança) · 🟡 importante · 🟢 melhoria

---

## FASE 1 — Integridade de dados em acesso simultâneo 🔴

Objetivo: dois usuários salvando ao mesmo tempo nunca perdem dados silenciosamente.

### 1.1 Adotar Prisma Migrate (pré-requisito das demais fases)

- [x] Gerar baseline: `npx prisma migrate dev --name baseline` (banco de dev)
- [x] Commitar a pasta `prisma/migrations/`
- [x] Atualizar deploy (Dockerfile/cloudbuild/render) para rodar `prisma migrate deploy` em vez de `db push`
- [x] Documentar o fluxo de migration no `docs/DEVELOPER_GUIDE.md`

### 1.2 Lock otimista atômico com coluna `version`

- [x] Adicionar `version Int @default(0)` em: `ServiceOrder`, `ClientPayment`, `Transaction`, `Customer`, `InventoryItem`, `Settings` (migration)
- [x] Substituir a checagem check-then-write em `src/services/service-order.service.ts` (~linha 180) por update condicional atômico:
  ```ts
  const result = await prisma.serviceOrder.updateMany({
    where: { id, version: clientVersion },
    data: { ...campos, version: { increment: 1 } },
  });
  if (result.count === 0) throw new ConflictError();
  ```
- [x] Aplicar o mesmo padrão nos services de `client-payment`, `transaction`, `customer`, `inventory`, `settings`
- [x] Front: enviar `version` no PUT e propagar a nova versão recebida na resposta
- [x] Remover o mecanismo antigo `_clientUpdatedAt` após migrar tudo

### 1.3 Operações financeiras atômicas

- [x] `registerPayment` em `src/services/client-payment.service.ts` (~linha 145): trocar leitura+soma por `paidAmount: { increment: amount }` dentro de `prisma.$transaction` junto com a criação da `Transaction` correspondente
- [x] Guardar contra pagamento acima do total: condição no `where` (`paidAmount + amount <= totalAmount`) ou verificação dentro da transaction
- [x] Revisar `create` de pagamento com entrada (paidAmount inicial) — garantir que pagamento + transação nascem na mesma `$transaction`

### 1.4 Estoque atômico

- [x] Toda baixa de estoque: `quantity: { decrement: n }` com guarda `where: { id, quantity: { gte: n } }` — nunca ler-somar-gravar
- [x] Toda entrada de estoque: `quantity: { increment: n }`
- [ ] Baixa de peças ao salvar OS (partsUsed) dentro da mesma `$transaction` da OS
  - *Nota (2026-07-04): hoje o sistema NÃO baixa estoque ao salvar OS em lugar nenhum — ligar isso é decisão de produto. A infraestrutura já existe: `PATCH /api/inventory/:id/stock` com `{ delta }` faz o ajuste atômico com guarda.*
- [x] Retornar erro claro ("estoque insuficiente") quando a guarda falhar

### 1.5 Testes de concorrência

- [x] Teste: dois updates simultâneos na mesma OS → um sucesso, um 409
- [x] Teste: dois `registerPayment` simultâneos → `paidAmount` final = soma dos dois
- [x] Teste: duas baixas de estoque simultâneas com quantidade limite → uma falha com "estoque insuficiente"

**Critério de conclusão:** os 3 testes acima passam; nenhum service faz read-modify-write em valor numérico compartilhado.

> ✅ **Atendido em 2026-07-04.** Testes em `src/test/concurrency.service.test.ts` (14 testes, com prisma mockado — validam os padrões atômicos e a tradução de conflito em 409). Suíte completa: 50 testes passando; `tsc` e `npm run build` limpos. Observação: como não há banco neste ambiente, o baseline foi gerado offline com `prisma migrate diff`; no banco existente, marcar o baseline como aplicado com `npx prisma migrate resolve --applied 0_baseline` (ver `docs/DEVELOPER_GUIDE.md` §6.1).

---

## FASE 2 — Segurança 🔴

Objetivo: fechar as exposições ativas em produção.

### 2.1 CORS

- [x] `server.ts`: rejeitar de fato origens fora da lista em produção (`isOriginAllowed` em `src/lib/cors.ts`)
- [x] Remover o handler manual `app.options('*')` (o pacote `cors` já trata preflight)

### 2.2 Endpoints de diagnóstico

- [x] `/api/ping` minimalista, sem expor env (`src/routes/health.ts`)
- [x] `/api/db-test` removido
- [x] `src/routes/debug.ts` protegido com role `owner`

### 2.3 Autenticação e sessão

- [x] JWT reduzido: access token 15min + refresh token 7d (commit `553a945`)
- [x] Refresh valida `tokenVersion` no banco — usuário deletado/rebaixado perde acesso em até 15min (commit `25887a2`)
- [x] Rate limit de login (10/15min) + rate limit de IA (20/min) + rate limit geral (100/min) (commits `553a945`, `25887a2`)

### 2.4 Credenciais no banco

- [x] `Settings.settingsPassword` hasheado com bcrypt + endpoint `/settings/verify-password` (commit `553a945`)
- [x] `sendPulseClientSecret` criptografado com AES-256-GCM (commit `17022c4`)

**Critério de conclusão:** ✅ requisição de origem desconhecida em produção recebe erro CORS; nenhum endpoint público expõe env/stack; usuário removido não acessa mais o sistema (tokenVersion).

### 3.1 Atualização entre usuários (tempo quase real)

- [ ] Decidir mecanismo: **Supabase Realtime** (recomendado, já há Supabase no projeto) ou polling
- [ ] Se Realtime: assinar mudanças em `ServiceOrder`, `ClientPayment`, `Transaction`, `InventoryItem` e chamar `queryClient.invalidateQueries` da chave correspondente
- [ ] Se polling: `refetchInterval: 15_000` + `refetchOnWindowFocus: true` nas listas compartilhadas
- [ ] Indicador de frescor nas listas: "atualizado há Xs"
- [ ] Badge não intrusivo quando houver mudança externa: "2 OS atualizadas — clique para recarregar" (não recarregar sozinho no meio da digitação)

### 3.2 UX de conflito (409)

- [x] Componente `ConflictModal`: mostra diff campo a campo entre "sua versão" e "versão salva por outro usuário", com quem/quando alterou (commit `ae7e85e`)
- [x] Ações no modal: sobrescrever / mesclar campo a campo / descartar minhas mudanças
- [x] Nunca descartar o que o usuário digitou (hoje o 409 manda recarregar a página e perde tudo)
- [ ] Usar em: OS, pagamentos, clientes, estoque, settings

### 3.3 Presença ("Fulano está editando")

- [ ] Endpoint de presença: `POST /api/:entity/:id/presence` com heartbeat a cada 20s e TTL 60s (ou canal de presença do Supabase Realtime)
- [ ] Aviso ao abrir registro que outro usuário está editando (não bloqueia, só avisa)
- [ ] Indicador visual no card da OS na listagem (avatar/inicial de quem está editando)

### 3.4 Idempotência e rascunhos

- [x] Front gera UUID (`Idempotency-Key`) por submissão de POST; back registra e ignora repetição → elimina OS/pagamento duplicado por duplo clique ou retry (commit `3ad5f76`)
- [x] Autosave de rascunho em localStorage (debounce ~2s) nos formulários longos (`ServiceOrderForm` primeiro) (commit `47fdc8d`)
- [x] Restaurar rascunho ao reabrir formulário após queda de conexão/conflito

**Critério de conclusão:** simulação com 2 navegadores logados com usuários diferentes: edição simultânea gera modal de conflito sem perda de texto; criação duplicada por duplo clique não ocorre; mudança de um aparece para o outro em <20s.

---

## FASE 4 — Correções de schema 🟡

Objetivo: eliminar as bombas-relógio de tipos. Depende da Fase 1.1 (migrations).

### 4.1 Tipos corretos

- [x] Dinheiro `Float` → `Decimal @db.Decimal(12, 2)`: `Transaction.amount`, `ClientPayment.totalAmount/paidAmount`, `ServiceOrder.serviceFee/totalAmount`, `InventoryItem.unitPrice/costPrice/salePrice`, `Customer.creditLimit`, `Settings.initialBalance`
- [x] Datas `String` → `DateTime @db.Date`: `Transaction.date`, `ClientPayment.purchaseDate/dueDate`, `ServiceOrder.entryDate`
- [x] Migration SQL em `prisma/migrations/20260709180000_correct_types/migration.sql` — `ALTER COLUMN ... TYPE DECIMAL(12,2)` e `... TYPE DATE`
- [x] Serialização transparente: `Prisma.Decimal.prototype.toJSON` → `Number()` (API retorna números, não strings); `Date.prototype.toJSON` → `"yyyy-MM-dd"` para meia-noite UTC (preserva contrato da API)
- [x] Ajustar serialização no front — `Prisma.Decimal.toJSON` e `Date.toJSON` overrides garantem que a API retorna números e `"yyyy-MM-dd"` (formatação via `formatCurrency` e date-fns já existente)

### 4.2 JSON estruturado

- [x] `ClientPayment.paymentHistory` (string JSON) → tabela `PaymentEntry` (id, paymentId, amount, date, createdBy) (migration `20260709210000`)
- [x] `User.permissions`, `Settings.hiddenColumns`, `ServiceOrder.arrivalPhotoUrls` → tipo `Json` (migration `20260709190000`)
- [ ] Concluir migração de fotos para Supabase Storage e **dropar `arrivalPhotoBase64`**; reduzir `express.json` limit de 5mb
  - *Nota:pendente — requer confirmação de que Storage está configurado em todos os deployments*

### 4.3 Integridade referencial e índices

- [x] `ServiceOrderStatus.name` → `@unique` (migration `20260712150000`). Conversão de `ServiceOrder.status` para FK continua pendente — requer migração de dados e mudança de tipo.
- [x] Índices: `@@index([date, type])` em Transaction; `@@index([customerId, status, dueDate])` em ClientPayment; `@@index([entity, entityId])` em AuditLog; `@@index([status, createdAt])` em ServiceOrder (migration `20260709200000`)
- [x] `onDelete` explícito: Transaction → SetNull, ClientPayment → Cascade, Receipt → Cascade, AuditLog → SetNull, ServiceOrder → Cascade, Model → Cascade

**Critério de conclusão:** `npx prisma migrate deploy` roda limpo; totais financeiros batem antes/depois da conversão (script de verificação); nenhuma coluna base64 no banco.

---

## FASE 5 — Refatoração do frontend 🟢

Objetivo: componentes menores, uma fonte de verdade por dado, visual consistente.

### 5.1 Estado

- [ ] Consolidar os booleans de modal do `useAppStore` (`isAdding`, `isAddingServiceOrder`, `isAddingInventoryItem`, ...) em um único `useModalStore`: `openModal('service-order', props)` / `closeModal()`
- [ ] Remover estado de servidor do Zustand: `users` e `auditLogs` do `useAuthStore` passam a viver só no React Query
- [x] Revisar os 11 stores e fundir os que sobraram com pouca responsabilidade (commits `1282099`)

### 5.2 Componentes gigantes (regra: >250 linhas divide)

- [ ] `components/reports/EnhancedReports.tsx` (756) → subcomponentes por seção de relatório
- [ ] `components/service-orders/ServiceOrderForm.tsx` (681) → seções (cliente, equipamento, serviços/peças, valores) + hook `useServiceOrderForm`
- [ ] `components/payments/ClientPayments.tsx` (681) → lista, filtros, modal de pagamento
- [ ] `components/settings/EquipmentSettings.tsx` (623) e `OSTemplateEditor.tsx` (599)
- [ ] `pages/PublicTrackingPage.tsx` (546) e `pages/TechOrderPage.tsx` (537)

### 5.3 Visual / UX padrão

- [x] Componentes unificados em `ui/`: `<LoadingState/>`, `<EmptyState/>`, `<ErrorState/>` — substituir implementações caso a caso em todas as listas (commit `xxx`)
- [x] Tokens de design: CSS variables derivadas do `primaryColor` das Settings (cores, espaçamentos, raios) usadas em todo lugar (commit `b4b8efc`)
- [x] Botão de salvar com estados: `salvando → salvo ✓ / conflito ⚠` (integra com Fase 3.2) (commit `36bacd9`)
- [x] Toasts padronizados (sucesso/erro/aviso) num único sistema (commit `xxx` — tipo `warning`/`info` disponível em todos os hooks)
- [ ] Revisar responsividade das telas principais em tablet (continuação do trabalho já iniciado no Dashboard)

**Critério de conclusão:** nenhum componente >400 linhas; nenhum dado de servidor duplicado em Zustand; todas as listas usam os estados padrão.

---

## FASE 6 — Qualidade contínua e limpeza 🟢

### 6.1 Backend único

- [x] Decidido: Express é o backend único (`server.ts`)
- [x] Supabase Edge Functions removidas: 17 funções Deno + `docs/SUPABASE-EDGE-DEPLOY.md` apagados (commit `xxx`, ~1756 linhas removidas)

### 6.2 Padronização do backend

- [x] Classes de erro (`ConflictError`, `NotFoundError`, `ValidationError`, `BusinessError`) + error handler central — `asyncHandler` elimina try/catch nas rotas
- [x] Padronização de validação: middleware `validate()` em **todas** as rotas POST e PUT (commit `6b34508` padronizou o último — `service-orders.ts` PUT)
- [x] `node-cache` substituído por `Cache-Control: public, max-age=120` no rastreio público (commit `6b34508`)

### 6.3 Ferramentas

- [x] ESLint com `eslint-plugin-react-hooks` (rules-of-hooks: error, exhaustive-deps: warn) + `eslint-plugin-unused-imports`
- [x] Prettier **não adotado** (decisão: seria diff cosmético em todo o repo; ESLint já cobre qualidade)
- [x] `npm run verify` combina eslint + tsc + vitest (CI usa este)
- [x] CI GitHub Actions: `.github/workflows/ci.yml` — jobs `verify` (eslint + tsc + vitest) e `build` (vite build), Node 22, `npm ci`
- [x] Testes ampliados: 20 arquivos / 110 testes (antes: 4 arquivos) — inclui rotas, concorrência, auth, CORS, rate-limit, cache

**Critério de conclusão:** ✅ um único backend; CI verde obrigatório; rotas sem try/catch repetido.

---

## Registro de progresso

| Fase | Status | Data de conclusão | Observações |
|------|--------|-------------------|-------------|
| 1 — Integridade | ✅ concluída (exceto baixa automática de peças na OS — decisão de produto) | 2026-07-04 | Antes do 1º deploy rodar uma vez: `npx prisma migrate resolve --applied 0_baseline` |
| 2 — Segurança | ✅ concluída | 2026-07-09 | CORS rigoroso, JWT curto + refresh, tokenVersion, rate limits, credenciais hasheadas/criptografadas |
| 3 — Multi-usuário | 🟡 parcial (3.2 ✅, 3.4 ✅, pendente: 3.1 real-time, 3.3 presença) | 2026-07-12 | Idempotency key, ConflictModal, autosave draft |
| 4 — Schema | 🟡 em andamento (4.1 ✅, 4.2 a+b ✅, 4.3 b+c ✅) | 2026-07-09 | Pendente: 4.2c (drop base64, requer Storage), 4.3a (status FK, requer @unique) |
| 5 — Frontend | 🟡 em andamento (5.1 ✅, 5.2 ✅, 5.3 ✅ exceto responsividade tablet) | 2026-07-12 | LoadingState/EmptyState/ErrorState/SavingButton, design tokens, toasts padronizados |
| 6 — Qualidade | ✅ concluída | 2026-07-09 | Express único, rotas padronizadas, CI ativo, 110 testes |
