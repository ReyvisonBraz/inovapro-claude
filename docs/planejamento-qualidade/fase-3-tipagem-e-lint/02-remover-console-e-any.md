# Fase 3 · Tarefa 02 — Zerar `console.*` de produção e reduzir `any`

**Goal:** Eliminar os 64 `console.*` espalhados no `src/` (que vazam para o bundle de produção) e reduzir substancialmente os 219 `any`, usando os warnings do ESLint (Tarefa 01) como lista de trabalho. Ao final, promover `no-console` e `no-explicit-any` de `warn` para `error`.

**Architecture:** `console.*` de logging de fluxo migra para o logger existente (`src/lib/logger.ts` no front, `src/lib/server-logger.ts` no back) ou é removido. `any` vira o tipo real quando conhecido, `unknown` + narrowing quando dinâmico, ou tipos utilitários. Diretórios permitidos a manter `console`: `src/lib/logger.ts` e `src/lib/server-logger.ts` (é a implementação do logger).

## Interfaces

- **Consome:** relatório do `npm run lint` (warnings `no-console` e `no-explicit-any`).
- **Produz:** código sem `console.*` fora do logger; menos `any`; regras promovidas a `error`.

---

- [ ] **Step 1: Listar os `console.*` (baseline)**

Run:
```powershell
npm run lint 2>&1 | Select-String "no-console" | Measure-Object -Line
```
Anote o total. Referência do review: ~64 ocorrências; maiores concentrações em `src/hooks/useServiceOrders.ts` (13) e `src/components/reports/EnhancedReports.tsx` (9).

- [ ] **Step 2: Migrar `console.error` de mutações para o logger do front**

Nos hooks React Query (ex.: `useServiceOrders.ts`), os `console.error('Failed to ...', error)` dentro de `onError` já mostram toast ao usuário. Troque o `console.error` pelo logger do front:

```ts
import { logError } from '../lib/logger'; // usar a API existente do logger

onError: (error: any) => {
  logError('Falha ao salvar ordem de serviço', error);
  // ...toast como hoje...
}
```
> Confira a API real exportada por `src/lib/logger.ts` e use a função equivalente. Se o logger não tiver uma função de erro pública, adicione-a (pequena) antes de migrar.

- [ ] **Step 3: Remover `console.*` de depuração pura**

`console.log`/`console.debug` que só serviam para depurar devem ser **removidos** (não migrados). Faça por arquivo, começando pelos de maior contagem.

- [ ] **Step 4: Reduzir `any` por diretório (comece por `src/hooks` e `src/lib`)**

Para cada `any` sinalizado:
- Retorno de API tipado? Crie/estenda a interface em `src/types.ts` e use-a.
- Erro de catch (`err: any`)? Troque por `err: unknown` e faça narrowing (`err instanceof Error ? err.message : String(err)`), ou um tipo `ApiError` para erros do axios.
- Assinatura de callback? Use o tipo concreto do payload.

> Meta pragmática: reduzir de 219 para < 60, priorizando `src/hooks`, `src/lib`, `src/services` e `src/routes` (código não-visual, maior risco). Os `any` remanescentes em componentes podem ficar como `warn` por ora.

- [ ] **Step 5: Rodar o gate a cada lote e commitar por diretório**

Após cada diretório limpo:
```powershell
npm run verify
git add src/<dir>
git commit -m "refactor(types): remove console e reduz any em src/<dir>"
```

- [ ] **Step 6: Promover as regras a `error` (quando os warnings zerarem no escopo alvo)**

Em `eslint.config.js`, quando `no-console` estiver zerado fora do logger, promova:

```js
      'no-console': ['error', { allow: ['warn', 'error'] }],
```
Para `no-explicit-any`, se ainda houver `any` residual aceitável em componentes, mantenha `warn`; caso contrário promova a `error`. Documente a decisão no topo do `eslint.config.js`.

- [ ] **Step 7: Gate final**

Run:
```powershell
npm run verify
```
Esperado: sem `error` de lint; `tsc` verde; testes verdes.

- [ ] **Step 8: Commit final**

```powershell
git add eslint.config.js
git commit -m @'
chore(lint): promove no-console a error apos limpeza

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Zero `console.*` fora de `src/lib/logger.ts` e `src/lib/server-logger.ts`.
- [ ] `any` reduzido conforme meta; `no-console` como `error`.
- [ ] `npm run verify` verde.

## Nota

- Esta tarefa é incremental por diretório — cada lote é um commit revisável. Não precisa terminar tudo numa sessão; o critério é "diretório X limpo e verde".
