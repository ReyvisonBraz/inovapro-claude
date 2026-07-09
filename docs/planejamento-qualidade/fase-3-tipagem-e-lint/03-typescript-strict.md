# Fase 3 · Tarefa 03 — Ligar `strict` no TypeScript (incremental)

**Goal:** Ativar a família `strict` no [../../../tsconfig.json](../../../tsconfig.json) (hoje sem `strict`/`strictNullChecks`/`noImplicitAny`), eliminando a maior fonte de bugs silenciosos (acessos a `undefined`, `any` implícito).

**Architecture:** Ligar `strict` de uma vez despeja centenas de erros. Fazemos **flag por flag**, do mais barato ao mais caro, resolvendo até `tsc` verde antes de ligar a próxima. Cada flag é uma sub-entrega com commit próprio. `strictNullChecks` é o mais custoso (o código assume não-null em muitos pontos) e vem por último.

> **Esta é a maior tarefa do projeto.** Trate cada flag como um mini-projeto. Não há atalho: é resolver erro por erro. O ganho é enorme (o compilador passa a pegar toda uma classe de bugs).

## Ordem das flags (cada uma até `tsc` verde)

1. `noImplicitThis`, `alwaysStrict` — quase sempre já satisfeitos; baratos.
2. `noImplicitAny` — força tipar parâmetros implícitos (não afeta `any` explícito).
3. `strictFunctionTypes`, `strictBindCallApply` — baixo impacto.
4. `strictNullChecks` — o grande. Trata `T | null | undefined`.
5. `strict: true` — liga o conjunto e remove as flags individuais (redundantes).

---

- [ ] **Step 1: Medir o baseline por flag**

Para dimensionar antes de mexer, rode cada flag isolada em modo medição (sem commitar):

```powershell
npx tsc --noEmit --noImplicitAny
npx tsc --noEmit --strictNullChecks
```
Anote a contagem de erros de cada uma em `docs/planejamento-qualidade/_strict-baseline.md`. Isso orienta o esforço.

- [ ] **Step 2: Ligar `noImplicitThis` + `alwaysStrict`**

Em `tsconfig.json` → `compilerOptions`, adicione:
```json
    "noImplicitThis": true,
    "alwaysStrict": true,
```
Run: `npm run typecheck`. Resolva o que aparecer (normalmente nada). Commit:
```powershell
git commit -am "chore(ts): noImplicitThis + alwaysStrict"
```

- [ ] **Step 3: Ligar `noImplicitAny`**

Adicione `"noImplicitAny": true`. Rode `npm run typecheck`. Erros típicos: parâmetros de callback sem tipo, destructuring sem anotação. Tipe-os (não use `any` para calar — use o tipo real). Trabalhe por diretório; commit por diretório limpo:
```powershell
git commit -am "chore(ts): noImplicitAny em src/<dir>"
```

- [ ] **Step 4: Ligar `strictFunctionTypes` + `strictBindCallApply`**

Adicione ambos. Rode e resolva (baixo volume). Commit.

- [ ] **Step 5: Ligar `strictNullChecks` (o grande — fatiar por diretório)**

Adicione `"strictNullChecks": true`. Rode `npm run typecheck` e **conte** os erros. Ataque por diretório, na ordem: `src/lib` → `src/services` → `src/routes` → `src/store` → `src/hooks` → `src/components` → `src/pages`.

Padrões de correção (sem burlar):
- Valor pode ser `null`/`undefined`? Faça o guard (`if (!x) return ...`) ou use `?.`/`??`.
- Acesso a `.env`/`params` que "sempre existe"? Prefira validar; só use `!` (non-null assertion) quando houver garantia real (ex.: `req.user!` após `requireAuth`).
- `find()`/`match()` retornam `T | undefined` — trate o caso.

Commit por diretório:
```powershell
npm run verify
git commit -am "chore(ts): strictNullChecks em src/<dir>"
```

- [ ] **Step 6: Consolidar em `strict: true`**

Quando todas as flags acima estiverem verdes, substitua-as por uma só:
```json
    "strict": true,
```
Remova as flags individuais que `strict` já engloba (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis`, `alwaysStrict`, `strictPropertyInitialization`). Rode `npm run typecheck` para confirmar que `strict` não trouxe nada novo (se trouxer — ex.: `useUnknownInCatchVariables` —, resolva).

- [ ] **Step 7: Gate final**

Run:
```powershell
npm run verify
```
Esperado: lint sem erro, `tsc` com `strict` 0 erros, testes verdes.

- [ ] **Step 8: Commit**

```powershell
git add tsconfig.json
git commit -m @'
chore(ts): ativa strict mode (consolida flags)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `tsconfig.json` com `"strict": true`.
- [ ] `npm run typecheck` 0 erros.
- [ ] `npm run verify` verde.

## Riscos

- **Regressão comportamental:** `strictNullChecks` pode revelar que algum código dependia de `undefined` silencioso. Ao adicionar guards, preserve o comportamento existente (ex.: default equivalente ao que o `|| ...` fazia). Rode a suíte a cada diretório.
- **Esforço:** se o baseline de `strictNullChecks` for muito alto, é legítimo pausar a Fase 3 aqui e retomar depois — as flags já ligadas ficam commitadas e o projeto segue verde.
