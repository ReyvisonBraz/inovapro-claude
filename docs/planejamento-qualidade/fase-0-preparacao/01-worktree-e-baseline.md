# Fase 0 · Tarefa 01 — Worktree isolado e baseline

**Goal:** Criar um ambiente de trabalho isolado e registrar o estado inicial (tsc vermelho com 11 erros, testes verdes) para que qualquer regressão futura seja detectável.

**Architecture:** Um branch dedicado `qualidade/fase-0-preparacao` (ou worktree, se preferir isolar do workspace atual). Adicionamos scripts npm de verificação que serão usados como gate em todas as fases seguintes.

## Interfaces

- **Consome:** nada (primeira tarefa).
- **Produz:**
  - Branch `qualidade/fase-0-preparacao`.
  - Scripts npm: `verify` (roda `tsc --noEmit` e `vitest run`), `typecheck` (alias de `tsc --noEmit`).
  - Arquivo `docs/planejamento-qualidade/_baseline.md` com a saída inicial registrada.

---

- [ ] **Step 1: Criar o branch de trabalho**

Não trabalhe em `main`. No PowerShell, a partir da raiz do projeto:

```powershell
git checkout -b qualidade/fase-0-preparacao
git status
```

Esperado: `On branch qualidade/fase-0-preparacao` e árvore limpa (fora os arquivos deste planejamento, ainda não commitados).

- [ ] **Step 2: Commitar o planejamento (para não perdê-lo)**

```powershell
git add docs/planejamento-qualidade
git commit -m @'
docs(qualidade): adiciona planejamento de qualidade (indice + fases 0 e 1)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

- [ ] **Step 3: Registrar o baseline do typecheck (esperado: FALHA com 11 erros)**

Run:
```powershell
npx tsc --noEmit
```
Esperado: **11 erros**, todos sobre `version` não existir em tipos Prisma (`ServiceOrderWhereInput`, `TransactionWhereInput`, etc.). Copie a saída — ela vira prova na tarefa 02 de que os erros sumiram.

- [ ] **Step 4: Registrar o baseline dos testes (esperado: VERDE)**

Run:
```powershell
npx vitest run
```
Esperado: `Test Files 5 passed (5)` e `Tests 50 passed (50)`.

- [ ] **Step 5: Gravar o baseline em arquivo**

Crie `docs/planejamento-qualidade/_baseline.md` com o conteúdo abaixo (preencha as saídas reais dos steps 3 e 4):

```markdown
# Baseline — antes da Fase 0

Data: 2026-07-07
Branch: qualidade/fase-0-preparacao

## tsc --noEmit (antes)
(cole aqui a saída: 11 erros sobre `version`)

## vitest run (antes)
Test Files 5 passed (5)
Tests 50 passed (50)
```

- [ ] **Step 6: Adicionar scripts de verificação ao package.json**

Em `package.json`, dentro de `"scripts"`, adicione `typecheck` e `verify` (mantenha os existentes):

```json
    "typecheck": "tsc --noEmit",
    "verify": "tsc --noEmit && vitest run",
```

- [ ] **Step 7: Confirmar que os scripts rodam**

Run:
```powershell
npm run typecheck
```
Esperado: mesma falha de 11 erros do Step 3 (ainda esperado nesta tarefa; será resolvido na 02).

- [ ] **Step 8: Commit**

```powershell
git add package.json docs/planejamento-qualidade/_baseline.md
git commit -m @'
chore(qualidade): scripts de verificacao (typecheck/verify) e baseline registrado

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Branch `qualidade/fase-0-preparacao` ativo.
- [ ] `_baseline.md` registrado com as saídas reais.
- [ ] `npm run typecheck` e `npm run verify` existem e executam (podem falhar por ora — resolvido na 02).
