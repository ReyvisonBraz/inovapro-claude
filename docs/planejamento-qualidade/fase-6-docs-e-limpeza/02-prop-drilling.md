# Fase 6 · Tarefa 02 — Reduzir prop drilling

**Goal:** Cortar o repasse excessivo de props. [../../../src/components/payments/ClientPayments.tsx](../../../src/components/payments/ClientPayments.tsx) recebe **~28 props** (estado, setters e handlers) mesmo o projeto já tendo Zustand + React Query. Isso torna a página-pai um "carregador de props" e acopla tudo.

**Architecture:** Componentes de tela consomem o estado de servidor via os hooks React Query no ponto de uso, e o estado de UI via os stores Zustand, em vez de receber tudo por props. Fazemos de forma **incremental e com teste de comportamento** (React Testing Library) para não regredir. Começamos pelo pico (`ClientPayments`) e replicamos o padrão.

> Refatoração de UI é arriscada sem rede. Cada componente refatorado ganha (ou reusa) um teste que prova o comportamento antes e depois.

## Interfaces

- **Consome:** `useClientPayments` (hook React Query já existente), stores Zustand (`useModalStore`, `useFormStore`, `useFilterStore`).
- **Produz:** `ClientPayments` com superfície de props reduzida; comportamento idêntico.

---

- [ ] **Step 1: Teste de caracterização (fixa o comportamento atual)**

Antes de mexer, escreva um teste que renderiza `ClientPayments` (ou a página) com dados mockados via MSW e verifica os comportamentos-chave: lista renderiza, botão "Novo Registro" abre o modal, busca filtra. Crie `src/test/ClientPayments.behavior.test.tsx`. Rode e veja **passar** (é o baseline):
```powershell
npx vitest run src/test/ClientPayments.behavior.test.tsx
```

- [ ] **Step 2: Mapear quais props vêm de onde**

Liste as ~28 props e classifique cada uma:
- **Estado de servidor** (ex.: `filteredClientPayments`, `pagination`) → deveria vir de `useClientPayments()` dentro do componente.
- **Estado de UI** (ex.: `isAddingClientPayment`, `expandedPayments`, `paymentSearchTerm`) → já existe em store Zustand? Se sim, consumir do store.
- **Handlers de negócio** (ex.: `handleAddClientPayment`, `handleRecordPayment`) → podem virar chamadas às mutations do próprio hook.

- [ ] **Step 3: Refatorar em fatias, rodando o teste a cada fatia**

Para cada grupo classificado no Step 2:
1. Remova as props do grupo da interface `ClientPaymentsProps`.
2. Dentro do componente, obtenha o mesmo valor do hook/store.
3. Ajuste a página-pai para não passar mais essas props.
4. Rode o teste de caracterização — deve continuar **verde**.
5. Commit da fatia:
```powershell
git commit -am "refactor(payments): ClientPayments consome <grupo> de hook/store (menos props)"
```

> Faça uma fatia por vez (ex.: primeiro o estado de servidor, depois os filtros, depois os modais). Nunca remova tudo de uma vez.

- [ ] **Step 4: Corrigir o `useEffect` com deps incompletas (de brinde)**

Ainda em `ClientPayments.tsx`, o efeito `useEffect(..., [isAddingClientPayment])` usa `newClientPayment`/`setNewClientPayment` fora das deps. Com o ESLint da Fase 3 (`react-hooks/exhaustive-deps`), corrija as deps ou reestruture para não derivar estado via efeito.

- [ ] **Step 5: Replicar o padrão nos próximos picos**

Aplique o mesmo método aos outros componentes com muitas props (candidatos: `Transactions`/`TransactionList`, `ServiceOrders`). Cada um com seu teste de caracterização.

- [ ] **Step 6: Gate**

Run:
```powershell
npm run verify
```
Esperado: lint (incl. exhaustive-deps) sem erro; testes verdes.

- [ ] **Step 7: Commit final**

```powershell
git add src/
git commit -m @'
refactor(ui): reduz prop drilling consumindo stores/React Query no ponto de uso

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `ClientPayments` com superfície de props significativamente menor (meta: cortar pela metade).
- [ ] Testes de caracterização verdes antes e depois.
- [ ] `useEffect` de deps incompletas corrigido.
- [ ] `npm run verify` verde.

## Nota

- Não é "refatorar por refatorar": o objetivo é desacoplar estado de servidor (React Query) e de UI (Zustand) do repasse manual. Se um componente é pequeno e as props são de fato entrada dele, deixe como está (YAGNI).
