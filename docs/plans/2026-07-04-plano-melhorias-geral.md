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

- [ ] `server.ts` (~linha 66): rejeitar de fato origens fora da lista em produção (hoje `callback(null, true)` sempre permite)
- [ ] Remover o handler manual `app.options('*')` que reflete qualquer origem com `credentials: true` (o pacote `cors` já trata preflight)

### 2.2 Endpoints de diagnóstico

- [ ] `/api/ping`: remover exposição de variáveis de ambiente (ou proteger com auth admin)
- [ ] `/api/db-test`: remover em produção (expõe stack trace e versão do banco); além disso ele chama `$disconnect()` no client compartilhado — corrigir
- [ ] `src/routes/debug.ts`: proteger com role admin ou desabilitar em produção

### 2.3 Autenticação e sessão

- [ ] Reduzir JWT de 7d para 8h (ou menos) + implementar refresh token, OU revalidar usuário/permissões no banco a cada request
- [ ] Garantir que usuário deletado/rebaixado perde acesso imediatamente (invalidação por `tokenVersion` no User ou consulta por request)
- [ ] Rate limit geral por IP na API (hoje só existe no login)

### 2.4 Credenciais no banco

- [ ] `Settings.settingsPassword` (default `"1234"` em texto puro): fazer hash com bcrypt ou remover o recurso
- [ ] Revisar `sendPulseClientSecret` armazenado em texto puro no Settings — mover para variável de ambiente se possível

**Critério de conclusão:** requisição de origem desconhecida em produção recebe erro CORS; nenhum endpoint público expõe env/stack; usuário removido não acessa mais o sistema.

---

## FASE 3 — Experiência multi-usuário ("fila de acesso") 🟡

Objetivo: usuários enxergam o trabalho uns dos outros e conflitos viram fluxo de UI, não perda de dados.

### 3.1 Atualização entre usuários (tempo quase real)

- [ ] Decidir mecanismo: **Supabase Realtime** (recomendado, já há Supabase no projeto) ou polling
- [ ] Se Realtime: assinar mudanças em `ServiceOrder`, `ClientPayment`, `Transaction`, `InventoryItem` e chamar `queryClient.invalidateQueries` da chave correspondente
- [ ] Se polling: `refetchInterval: 15_000` + `refetchOnWindowFocus: true` nas listas compartilhadas
- [ ] Indicador de frescor nas listas: "atualizado há Xs"
- [ ] Badge não intrusivo quando houver mudança externa: "2 OS atualizadas — clique para recarregar" (não recarregar sozinho no meio da digitação)

### 3.2 UX de conflito (409)

- [ ] Componente `ConflictModal`: mostra diff campo a campo entre "sua versão" e "versão salva por outro usuário", com quem/quando alterou
- [ ] Ações no modal: sobrescrever / mesclar campo a campo / descartar minhas mudanças
- [ ] Nunca descartar o que o usuário digitou (hoje o 409 manda recarregar a página e perde tudo)
- [ ] Usar em: OS, pagamentos, clientes, estoque, settings

### 3.3 Presença ("Fulano está editando")

- [ ] Endpoint de presença: `POST /api/:entity/:id/presence` com heartbeat a cada 20s e TTL 60s (ou canal de presença do Supabase Realtime)
- [ ] Aviso ao abrir registro que outro usuário está editando (não bloqueia, só avisa)
- [ ] Indicador visual no card da OS na listagem (avatar/inicial de quem está editando)

### 3.4 Idempotência e rascunhos

- [ ] Front gera UUID (`Idempotency-Key`) por submissão de POST; back registra e ignora repetição → elimina OS/pagamento duplicado por duplo clique ou retry
- [ ] Autosave de rascunho em localStorage (debounce ~2s) nos formulários longos (`ServiceOrderForm` primeiro)
- [ ] Restaurar rascunho ao reabrir formulário após queda de conexão/conflito

**Critério de conclusão:** simulação com 2 navegadores logados com usuários diferentes: edição simultânea gera modal de conflito sem perda de texto; criação duplicada por duplo clique não ocorre; mudança de um aparece para o outro em <20s.

---

## FASE 4 — Correções de schema 🟡

Objetivo: eliminar as bombas-relógio de tipos. Depende da Fase 1.1 (migrations).

### 4.1 Tipos corretos

- [ ] Dinheiro `Float` → `Decimal @db.Decimal(12, 2)`: `Transaction.amount`, `ClientPayment.totalAmount/paidAmount`, `ServiceOrder.serviceFee/totalAmount`, `InventoryItem.unitPrice/costPrice/salePrice`, `Customer.creditLimit`, `Settings.initialBalance`
- [ ] Datas `String` → `DateTime`: `Transaction.date`, `ClientPayment.purchaseDate/dueDate`, `ServiceOrder.entryDate`
- [ ] Script de migração de dados para converter valores existentes (testar em cópia do banco antes; backup em `backups/`)
- [ ] Ajustar serialização no front (formatação de moeda/data centralizada em `src/lib/utils.ts`)

### 4.2 JSON estruturado

- [ ] `ClientPayment.paymentHistory` (string JSON) → tabela `PaymentEntry` (id, paymentId, amount, method, date, createdBy) — é registro financeiro, precisa de integridade
- [ ] `User.permissions`, `Settings.hiddenColumns`, `ServiceOrder.arrivalPhotoUrls` → tipo `Json`
- [ ] Concluir migração de fotos para Supabase Storage e **dropar `arrivalPhotoBase64`**; reduzir `express.json` limit de 5mb

### 4.3 Integridade referencial e índices

- [ ] `ServiceOrder.status` string solta → FK para `ServiceOrderStatus` (renomear status não pode orfanar OS)
- [ ] Índices: `@@index([status, createdAt])` em ServiceOrder; `@@index([date, type])` em Transaction; `@@index([customerId, status, dueDate])` em ClientPayment; `@@index([entity, entityId])` em AuditLog
- [ ] Definir `onDelete` explícito nas relações (hoje comportamento default implícito)

**Critério de conclusão:** `npx prisma migrate deploy` roda limpo; totais financeiros batem antes/depois da conversão (script de verificação); nenhuma coluna base64 no banco.

---

## FASE 5 — Refatoração do frontend 🟢

Objetivo: componentes menores, uma fonte de verdade por dado, visual consistente.

### 5.1 Estado

- [ ] Consolidar os booleans de modal do `useAppStore` (`isAdding`, `isAddingServiceOrder`, `isAddingInventoryItem`, ...) em um único `useModalStore`: `openModal('service-order', props)` / `closeModal()`
- [ ] Remover estado de servidor do Zustand: `users` e `auditLogs` do `useAuthStore` passam a viver só no React Query
- [ ] Revisar os 11 stores e fundir os que sobraram com pouca responsabilidade

### 5.2 Componentes gigantes (regra: >250 linhas divide)

- [ ] `components/reports/EnhancedReports.tsx` (756) → subcomponentes por seção de relatório
- [ ] `components/service-orders/ServiceOrderForm.tsx` (681) → seções (cliente, equipamento, serviços/peças, valores) + hook `useServiceOrderForm`
- [ ] `components/payments/ClientPayments.tsx` (681) → lista, filtros, modal de pagamento
- [ ] `components/settings/EquipmentSettings.tsx` (623) e `OSTemplateEditor.tsx` (599)
- [ ] `pages/PublicTrackingPage.tsx` (546) e `pages/TechOrderPage.tsx` (537)

### 5.3 Visual / UX padrão

- [ ] Componentes unificados em `ui/`: `<LoadingState/>`, `<EmptyState/>`, `<ErrorState/>` — substituir implementações caso a caso em todas as listas
- [ ] Tokens de design: CSS variables derivadas do `primaryColor` das Settings (cores, espaçamentos, raios) usadas em todo lugar
- [ ] Botão de salvar com estados: `salvando → salvo ✓ / conflito ⚠` (integra com Fase 3.2)
- [ ] Toasts padronizados (sucesso/erro/aviso) num único sistema
- [ ] Revisar responsividade das telas principais em tablet (continuação do trabalho já iniciado no Dashboard)

**Critério de conclusão:** nenhum componente >400 linhas; nenhum dado de servidor duplicado em Zustand; todas as listas usam os estados padrão.

---

## FASE 6 — Qualidade contínua e limpeza 🟢

### 6.1 Backend único

- [ ] Decidir: Express (`server.ts`) OU Supabase Edge Functions (`supabase/functions/`) — hoje há lógica duplicada nas duas + `api/index.ts`
- [ ] Apagar a superfície não usada e o `docs/SUPABASE-EDGE-DEPLOY.md` se aplicável

### 6.2 Padronização do backend

- [ ] Classes de erro (`ConflictError`, `NotFoundError`, `ValidationError`) + error handler central — eliminar try/catch repetido nas 19 rotas e o `err.message === 'CONFLICT'`
- [ ] Padronizar validação: middleware `validate()` em todas as rotas (hoje POST usa middleware, PUT valida inline)
- [ ] Substituir cache em memória (`node-cache`) por `Cache-Control` HTTP curto ou remover — inválido em serverless multi-instância

### 6.3 Ferramentas

- [ ] ESLint com `eslint-plugin-react-hooks` + Prettier; `npm run lint` = eslint + tsc
- [ ] CI (GitHub Actions): lint + testes + build a cada PR
- [ ] Ampliar testes dos services financeiros (hoje: 4 arquivos de teste no projeto todo)

**Critério de conclusão:** um único backend; CI verde obrigatório; rotas sem try/catch repetido.

---

## Registro de progresso

| Fase | Status | Data de conclusão | Observações |
|------|--------|-------------------|-------------|
| 1 — Integridade | ✅ concluída (exceto baixa automática de peças na OS — decisão de produto) | 2026-07-04 | Antes do 1º deploy rodar uma vez: `npx prisma migrate resolve --applied 0_baseline` |
| 2 — Segurança | ⬜ não iniciada | | |
| 3 — Multi-usuário | ⬜ não iniciada | | |
| 4 — Schema | ⬜ não iniciada | | |
| 5 — Frontend | ⬜ não iniciada | | |
| 6 — Qualidade | ⬜ não iniciada | | |
