Análise Profunda do Código — InovaPro
1. VISÃO GERAL DA ARQUITETURA
Browser (React SPA)
    │
    ├── react-router-dom (rotas cliente)
    ├── Zustand (11 stores de estado cliente)
    ├── TanStack Query (cache/queries API)
    ├── react-hook-form + Zod (formulários)
    │
    ▼ API calls (axios)
    │
Express Server (server.ts)
    ├── middleware: helmet, cors, rate-limit, JWT auth
    ├── 16 grupos de rotas (transactions, customers, etc.)
    ├── Service Layer (3 services: transaction, customer, service-order)
    └── Prisma ORM → PostgreSQL + Supabase Storage
2. PONTOS FORTES (Código Inteligente)
2.1. Separação de Responsabilidades (bem feita)
- Pages (camada fina): DashboardPage.tsx ~43 linhas, só orquestra props e modais
- Components (apresentação pura): recebem tudo por props, sem lógica de negócio
- Hooks (orquestração de dados): useServiceOrders.ts, useCustomers.ts — encapsulam React Query + Zustand
- Services (backend): customer.service.ts, transaction.service.ts — isolam lógica de banco
- Schemas (validação): Zod centralizado em src/schemas/
2.2. TanStack Query bem utilizado
- staleTime variado: 30s para dados voláteis (transactions), 5min para dados estáveis (brands, models)
- Invalidação inteligente em cascata: ao editar customer, invalida ['customers'], ['service-orders'], ['transactions']
- queryKey com todos os filtros como dependência → refetch automático
2.3. Serviço de Transação com Transações SQL (Prisma)
transaction.service.ts usa prisma.$transaction() para:
- Atualizar paidAmount no ClientPayment ao deletar transaction vinculada
- Recalcular status (paid/pending) automaticamente
2.4. Otimista com Cache
- src/lib/cache.ts: NodeCache com TTL 2min para consultas públicas de OS
- Evita bater no banco repetidamente para /rastreio
2.5. Logger Duplo
- Client-side (logger.ts): intercepta console.log/warn/error + captura unhandledrejection
- Server-side (server-logger.ts): buffer circular de 5000 logs com requestId, sanitização de senhas
2.6. Conflict Detection
service-order.service.ts implementa detecção de concorrência via _clientUpdatedAt → 409 Conflict
3. PROBLEMAS CRÍTICOS (Risco de Estrutura)
3.1. ⚠️ DUPLA FONTE DA VERDADE — FilterStore vs Query Params
Arquivo: src/store/useFilterStore.ts (199 linhas)
O filtro de transações, client payments, service orders, customers, inventory, reports e dashboard está todo no Zustand. Mas as queries do React Query já usam esses valores como queryKey. Isso cria um problema:
- O estado de filtro vive em dois lugares: Zustand + URL params
- Não há sincronização com a URL (perde filtro ao recarregar)
- resetFilters() duplica manualmente todos os defaults (99 linhas de boilerplate)
Risco: Se um filtro mudar sem disparar query invalidation, a UI fica inconsistente.
3.2. ⚠️ useFilteredData.ts — FILTRAGEM NO CLIENTE DUPLICADA
Arquivo: src/hooks/useFilteredData.ts (129 linhas)
O backend já filtra (ex: /transactions?search=&type=income&...). O hook useFilteredData.ts refiltra no cliente tudo que já veio filtrado do servidor. Isso:
- É inútil computacionalmente
- Pode mostrar resultados incorretos se houver paginação (filtra só a página atual)
- Adiciona complexidade desnecessária (5 useMemo com 10+ dependências cada)
Risco: Dados exibidos podem não corresponder ao que está no banco.
3.3. ⚠️ REDUNDÂNCIA: useServiceOrderForm vs ServiceOrderForm
Arquivo: src/hooks/useServiceOrderForm.ts (211 linhas) + src/components/service-orders/ServiceOrderForm.tsx (641 linhas)
Existem DOIS sistemas de formulário de OS:
useServiceOrderForm.ts
State manual (useState)
newOrder objeto plano
handleSave() manual
Validação inline manual
APENAS 1 componente usa
O hook useServiceOrderForm.ts parece ser um resquício de versão anterior que nunca foi removido. Nenhum componente o importa. ~211 linhas de código morto.
3.4. ⚠️ CÓDIGO MORTO: useDashboardStats.ts
Arquivo: src/hooks/useDashboardStats.ts (64 linhas)
Faz filtragem + agregação no cliente de transactions (useMemo), mas useStats.ts já busca tudo do backend (/stats). Esse hook não é importado por página alguma.
3.5. ⚠️ PROP DRILLING EXCESSIVO
ServiceOrderForm.tsx recebe 22 props — um clear code smell:
isAdding, setIsAdding, editingOrder, setEditingOrder, customers,
inventoryItems, statuses, equipmentTypes, brands, models, currentUser,
onAddOrder, onUpdateOrder, onAddEquipmentType, onAddBrand, onAddModel,
onTriggerAddCustomer, showToast, onOpenConfirm, setSelectedOrder,
setShowWhatsAppModal, setShowQRCodeModal, onGeneratePayment
Isso deveria usar contexto ou composição.
3.6. ⚠️ CSS-IN-JS INLINE (Estilo Dinâmico)
Em App.tsx linha 227-231:
<style>{`:root { --color-primary: ${settings?.primaryColor || '#1152d4'}; }`}</style>
Isso cria um <style> tag a cada render do App. Deveria ser um useEffect com document.documentElement.style.setProperty.
3.7. ⚠️ SERVER-LOGGER SANITIZA mas LOG EXPÕE
server-logger.ts sanitiza password, token do body...mas loga request body inteiro em erros (linha 126-129). Se surgir um campo sensível não mapeado, vaza.
4. REPETIÇÕES
4.1. PADRÃO CRUD REPETIDO 6x
Cada hook de entidade segue exatamente o mesmo padrão:
// useTransactions.ts, useCustomers.ts, useInventory.ts, useClientPayments.ts, useServiceOrders.ts
const saveMutation = useMutation({
  mutationFn: async ({ item, id }) => { if (id) PUT else POST },
  onSuccess: () => { invalidateQueries; showToast('sucesso') },
  onError: (error) => { console.error; showToast(error) },
});
const deleteMutation = useMutation({ ... });
6 hooks x 2 mutations = 12 blocos quase idênticos. Uma abstração useCrudApi() reduziria ~250 linhas.
4.2. ESTADOS PAGINADOS IDÊNTICOS
useTransactionStore.ts, useCustomerStore.ts, useClientPaymentStore.ts, useServiceOrderStore.ts:
// Todos idênticos
{ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
Poderiam ser um único createPaginationStore() genérico.
4.3. VALIDAÇÃO DE ERRO REPETIDA
if (err instanceof z.ZodError) {
  return res.status(400).json({ error: 'Falha na validação', details: err.issues });
}
error('[ROUTE] Erro', err);
res.status(500).json({ error: 'Erro interno do servidor' });
Esse bloco aparece em todas as rotas POST/PUT. Poderia ser um middleware validate(schema).
4.4. REPETIÇÃO DE CAMPOS
O Schema Prisma e o Schema Zod de ServiceOrder têm os mesmos 30+ campos definidos em dois lugares. Toda alteração exige mudança dupla.
5. PERFORMANCE
5.1. 🟢 BOM: Lazy Loading
Todas as páginas são lazy() em App.tsx — boa prática.
5.2. 🟢 BOM: Motion com AnimatePresence
Transições de página com motion.div + mode="wait" — boa UX, sem vazamento.
5.3. 🟡 MÉDIO: React Query staleTime
staleTime: 0 em useTransactions.ts — toda vez que monta, refetch. Se o usuário navega entre abas, causa requests desnecessários.
5.4. 🔴 RUIM: useState sincronizado com useMemo
Dashboard.tsx linha 68-69:
const [cards, setCards] = useState(initialCards);
React.useEffect(() => { setCards(initialCards); }, [initialCards]);
Isso causa render duplicado: um do useMemo, outro do setState no useEffect. O estado cards só existe para o DraggableGrid — poderia ser useMemo diretamente.
5.5. 🔴 RUIM: Imports Pesados
ServiceOrderForm.tsx importa 9 ícones Lucide, motion, qrCode, date-fns, formatCurrency, 6 sub-componentes — bundle grande para um modal. Componentes pesados como QRCode poderiam ser lazy() carregados.
5.6. 🔴 RUIM: html2pdf.js (blob gigante)
pdfExporter.ts clona o DOM inteiro, renderiza com html2canvas (scale:2), e gera PDF. Para relatórios grandes, isso pode consumir >500MB de RAM.
6. LEGIBILIDADE E MANUTENÇÃO
6.1. 🟢 BOM: Nomes de arquivo descritivos
useServiceOrders.ts, CustomerSection.tsx, transaction.service.ts — claro o que cada um faz.
6.2. 🟢 BOM: Português no domínio
Mensagens de toast, labels, comentários em português — apropriado para equipe BR.
6.3. 🟡 MÉDIO: Comentários em excesso
server.ts tem comentários como /* ─── Middleware Global ─── */ que são ruído visual para 1-2 linhas de código. Já em ServiceOrderForm.tsx, linhas como // Reset skipEquipmentValidation when switching from simplified seguido de useEffect vazio. Comentário enganoso ou código morto.
6.4. 🟡 MÉDIO: Uso excessivo de any
- useServiceOrders.ts: mutationFn: async ({ order, id, updatedAt }: { order: any; ... })
- service-order.service.ts: where: Record<string, unknown>, updateData: Record<string, unknown>
- useClientPayments.ts: saveClientPaymentAPI: (payment: any, id?: number) => ...
Isso derrota o TypeScript. Cerca de 15-20 ocorrências de any no código analisado.
6.5. 🔴 RUIM: @ts-ignore em produção
// @ts-ignore - React Hook Form tem problemas com inferência complexa de Zod
const { fields: serviceFields, ... } = useFieldArray({ control, name: 'services' });
Em vez de ignorar, deveria tipar corretamente o schema ou usar as any.
6.6. 🟡 MÉDIO: css-in-js misturado com Tailwind
Server.ts linha 228: <style>{:root { --color-primary: ... }}</style> dentro do JSX, enquanto todo o resto é Tailwind. Inconsistente.
6.7. 🔴 RUIM: Lógica de fotos complexa e frágil
ServiceOrderForm.tsx linhas 135-204:
- Fotos armazenadas como JSON string em arrivalPhotoBase64
- compressImage() manual (canvas → dataURL)
- Validação de tamanho, contagem 3, compressão, tudo no frontend
- Depois migratePhotosToStorage no backend converte base64 → Supabase Storage
Isso é extremamente pesado: uma OS com 3 fotos de 800px cada gera ~3MB em base64 no request. O express.json({ limit: '5mb' }) mal comporta.
7. SEGURANÇA
7.1. 🟢 BOM: JWT com 7d expiry, rate-limit no login
auth.ts: JWT_EXPIRES_IN = '7d', login rate-limited 10 req/15min.
7.2. 🟡 MÉDIO: Fallback Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
Se o deploy esquecer de setar JWT_SECRET, qualquer um pode forjar tokens.
7.3. 🟢 BOM: RBAC dupla camada
Frontend verifica hasPermission() (UI), backend verifica requireRole/requirePermission (middleware). Defesa em profundidade.
7.4. 🔴 RUIM: Permissão Owner hardcoded
Em auth.ts linha 32-34:
if (user.role === 'owner') {
  permissions = ['view_dashboard', 'manage_transactions', ...];
}
As permissões de owner são setadas no login, ignorando o que está no banco. Se alguém editar permissões de owner no banco, são sobrescritas.
7.5. 🔴 RUIM: Permissões frontend vs backend inconsistentes
Frontend usa: 'view_dashboard', 'manage_transactions', etc.
Backend (roles.ts) usa: 'transaction:read', 'transaction:create', etc.
Sistemas de permissão DIFERENTES no frontend e backend! O frontend verifica permissões com nomes que não existem no backend, e vice-versa. O middleware requirePermission('transaction:delete') do backend nunca é chamado pelo frontend — é ineficaz.
8. DATABASE MODEL
8.1. 🟡 MÉDIO: date como String
Transaction.date, ClientPayment.dueDate, ServiceOrder.entryDate são String no Prisma (não DateTime). Isso impossibilita queries nativas de data no PostgreSQL sem casting.
8.2. 🔴 RUIM: Denormalização manual frágil
customer.service.ts em update(): faz cascade manual de firstName/lastName/phone para ServiceOrder e Transaction. Se um futuro dev esquecer de incluir um campo, dados ficam inconsistentes.
8.3. 🟡 MÉDIO: JSON como String
partsUsed, services, arrivalPhotoUrls são String (JSON.stringify) no banco, com safeParseJSON em toda leitura. Perde queryabilidade.
9. TESTES
9.1. 🟢 BOM: Setup de testes completo
Vitest + Testing Library + MSW + Playwright. vitest.config.ts com cobertura.
9.2. 🔴 RUIM: Cobertura mínima
Apenas 4 arquivos de teste:
- GlobalModals.test.tsx
- useClientPayments.test.ts
- useTransactions.test.ts
- utils.test.ts
Para 11 stores, 19 hooks, 40+ componentes, 16 rotas — cobertura <5%.
9.3. 🔴 RUIM: MSW server setup mas handlers incompletos
src/test/mocks/handlers.ts existe mas não sabemos se mocka todas as APIs necessárias para os hooks testados.
10. RESUMO QUANTITATIVO
Métrica	Valor
Arquivos de código	~120
Total de linhas	~15.000+
Stores Zustand	11
Hooks React Query	19
Rotas Express	16
Schemas Zod	6
Componentes React	40+
Uso de any	15+ ocorrências
Código morto identificado	~275 linhas (useServiceOrderForm + useDashboardStats)
Prop drilling excessivo	1 componente com 22 props
Redundância filter client/server	1 hook inteiro (useFilteredData)
11. RECOMENDAÇÕES PRIORITÁRIAS
🔥 Blocker (risco de bug)
1. Sincronizar sistemas de permissão (frontend usa manage_transactions, backend usa transaction:read)
2. Remover useFilteredData.ts — filtragem duplicada causa dados inconsistentes
3. Remover useServiceOrderForm.ts e useDashboardStats.ts — código morto
🔴 Major (performance/manutenção)
4. Criar useCrudApi(baseKey) — eliminar repetição de mutations CRUD
5. Criar middleware validate(zodSchema) — eliminar try/catch Zod repetido
6. Substituir fotos base64 por upload direto — request de 5mb é gargalo
7. Consolidar FilterStore — remover filtros não usados, sincronizar com URL
🟡 Minor (qualidade)
 8. Tipar corretamente any no service-order service
 9. Extrair ServiceOrderForm para Context (22 props → contexto)
10. Adicionar testes para as 5 entidades principais (cobertura <5%)
11. Migrar date String para DateTime no Prisma
12. VEREDITO FINAL
O código é de qualidade acima da média para um projeto solo/pequena equipe. A arquitetura é sólida (Zustand + React Query + Service Layer é uma combinação moderna e eficaz). O desenvolvedor demonstra conhecimento de:
- Padrões de cache (staleTime, invalidação)
- Transações de banco (Prisma $transaction)
- Segurança (JWT, RBAC, rate-limit, helmet, sanitização)
- UX (AnimatePresence, lazy loading, PWA)
Porém, o projeto tem sinais claros de crescimento orgânico sem refatoração periódica:
- Código morto acumulado (~275 linhas)
- 2 sistemas de permissão paralelos
- 2 sistemas de filtragem paralelos
- 2 sistemas de formulário de OS
- Repetição massiva de CRUD boilerplate
Complexidade Ciclomática: Média-Alta para ServiceOrderForm.tsx (641 linhas, 22 props, 6 useEffect, lógica de fotos complexa). Baixa para os demais componentes.
Nota Geral: 7/10 — Funcional, bem arquitetado em camadas, mas precisa de refatoração para escalar sem acumular dívida técnica.

📋 INSTRUÇÕES PARA PLANEJAR CORREÇÕES
Use o relatório de análise acima como referência. Abaixo está a lista de ações para planejar. Cada item DEVE ser tratado como uma etapa separada e incremental, com validação entre etapas para não quebrar o código.
Regras para planejar:
1. Nunca pule etapas — cada item é uma PR/task separada
2. Cada etapa deve ter no máximo 3-5 arquivos alterados
3. Após cada etapa, verificar: npm run build não quebra, testes passam, UI não regride
4. Prioridade: seguir a ordem abaixo — itens bloqueantes primeiro
5. Cada etapa precisa de: arquivos envolvidos, descrição da mudança, riscos identificados, forma de validar
Etapas para planejar:
FASE 1 — Limpeza de Código Morto (seguro, sem risco de quebra)
- Remover src/hooks/useServiceOrderForm.ts — não é importado por nenhum componente
- Remover src/hooks/useDashboardStats.ts — não é importado por nenhum componente (useStats.ts faz o mesmo)
- Verificar se src/hooks/useFilteredData.ts é realmente usado em algum lugar; se não, remover
- Verificar se useFilterStore tem setters para filtros de entidades que foram migradas para query params do React Query
FASE 2 — Unificar Sistemas de Permissão (crítico, risco médio)
- Decidir nomenclatura: usar schema:'action' (backend atual) ou manage_schema (frontend atual)
- Atualizar frontend (useAuthStore.ts, App.tsx, Sidebar.tsx) ou backend (roles.ts) para sync
- Garantir que ROLE_PERMISSIONS em roles.ts tenha as mesmas permissões que o frontend checa
- Remover código de permissão inline em auth.ts linhas 32-34 (owner permissions hardcoded)
FASE 3 — Eliminar Duplicação de Filtro (médio, risco baixo)
- Analisar se useFilteredData.ts filtra dados que já vêm filtrados do backend
- Se sim: substituir o uso do hook pelo dado já filtrado da query (ex: transactionsData.data em vez de filteredTransactions)
- Remover filtros do useFilterStore que só existiam para esse hook
FASE 4 — Refatorar CRUD Boilerplate (médio, risco médio)
- Criar hook genérico useCrudApi(baseKey: string) com useQuery, saveMutation, deleteMutation
- Refatorar: useTransactions, useCustomers, useInventory, useClientPayments para usar o hook genérico
- Manter comportamento de onSuccess/showToast customizável via parâmetros
FASE 5 — Simplificar ServiceOrderForm (alto valor, risco alto)
- Extrair props para um Context (ServiceOrderFormContext)
- Separar sub-componentes que estão inline (QuickAddModal, photo handling)
- Resolver os @ts-ignore de useFieldArray com tipagem correta do Zod
FASE 6 — Backend Middleware de Validação (baixo risco)
- Criar middleware validate(schema: ZodSchema) que centraliza:
if (err instanceof z.ZodError) return res.status(400).json(...)
- Aplicar em todas as rotas POST/PUT, removendo blocos try/catch manuais
FASE 7 — Melhorias de Performance
- Mudar staleTime: 0 em useTransactions.ts para 30_000 como os demais
- Extrair QRCode para lazy() loading
- Substituir <style> inline em App.tsx por useEffect + style.setProperty
FASE 8 — Tipagem e Qualidade
- Substituir usos de any no service-layer por tipos concretos
- Migrar campos date de String para DateTime no schema Prisma
- Migrar partsUsed/services de String JSON para JSON nativo no PostgreSQL (se suportado)
Instruções de saída:
Para cada etapa, produza:
## Etapa N: Nome da Etapa
**Arquivos envolvidos:**
- `caminho/arquivo1.ts`
- `caminho/arquivo2.tsx`
**O que fazer:**
(descrição concisa)
**Riscos:**
(identificar riscos de quebra)
**Validação:**
(como testar que não quebrou)
**Ordem de execução dentro da etapa:**
1. Primeiro passo
2. Segundo passo
Responda apenas com o planejamento detalhado de cada etapa nesta mesma estrutura.