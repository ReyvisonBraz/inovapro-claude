# Fase 4 · Tarefa 01 — Cobertura honesta e thresholds (M7)

**Goal:** A métrica de cobertura passar a incluir a camada de servidor (routes/services/middleware), hoje excluída em [../../../vitest.config.ts](../../../vitest.config.ts) (`include: ['src/hooks/**','src/lib/**','src/store/**']`). Sem isso, "cobertura alta" é ilusão sobre o código mais crítico.

**Architecture:** Ampliamos `coverage.include`, definimos thresholds **modestos** (começar no que já existe para não travar) e subimos ao longo da Fase 4. CI passa a rodar `test:coverage`.

## Interfaces

- **Produz:** `vitest.config.ts` com include ampliado e thresholds; CI rodando cobertura.

---

- [ ] **Step 1: Medir a cobertura atual da camada de servidor**

Run:
```powershell
npx vitest run --coverage
```
Anote os números atuais de `src/routes`, `src/services`, `src/middleware` (provavelmente baixos, já que só os services de concorrência e as rotas testadas nas Fases 1–2 aparecem). Registre em `docs/planejamento-qualidade/_coverage-baseline.md`.

- [ ] **Step 2: Ampliar `coverage.include` e definir thresholds**

Em `vitest.config.ts`, ajuste o bloco `coverage`:

```ts
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/hooks/**',
        'src/lib/**',
        'src/store/**',
        'src/routes/**',
        'src/services/**',
        'src/middleware/**',
        'src/schemas/**',
      ],
      exclude: ['src/test/**', '**/*.d.ts'],
      thresholds: {
        // Comece no piso real medido no Step 1 (arredonde para baixo).
        // Suba +5 a cada tarefa de integração concluída.
        lines: 40,
        functions: 40,
        branches: 30,
        statements: 40,
      },
    },
```
> Defina os números iniciais a partir do Step 1 — **não** invente 80% e trave o CI. O objetivo é uma catraca que sobe, nunca desce.

- [ ] **Step 3: Rodar a cobertura e confirmar que passa nos thresholds iniciais**

Run:
```powershell
npx vitest run --coverage
```
Esperado: verde. Se falhar, baixe o threshold para o valor real medido.

- [ ] **Step 4: CI roda cobertura**

Em `.github/workflows/ci.yml`, troque o passo de testes por:
```yaml
      - name: Testes + cobertura
        run: npm run test:coverage
```
(`test:coverage` já existe no `package.json`: `vitest run --coverage`.)

- [ ] **Step 5: Ignorar artefatos de cobertura no git**

Confirme que `coverage/` está no `.gitignore` (já está). Não commite `coverage/`.

- [ ] **Step 6: Commit**

```powershell
git add vitest.config.ts .github/workflows/ci.yml docs/planejamento-qualidade/_coverage-baseline.md
git commit -m @'
test(coverage): inclui routes/services/middleware na cobertura + thresholds

- catraca de cobertura que sobe a cada tarefa de integracao
- CI roda test:coverage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `coverage.include` cobre a camada de servidor.
- [ ] Thresholds definidos no piso real e verdes.
- [ ] CI falha se a cobertura cair abaixo do threshold.

## Nota

- A cada suíte de integração da Tarefa 02, suba os thresholds (+5). É a "catraca de qualidade": a cobertura só pode subir.
