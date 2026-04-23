# Fase 6 — CI/CD (GitHub Actions)

**Status:** ⏳ Pendente  
**Prioridade:** 🟢 Médio  
**Estimativa:** 30 minutos

## Problema Atual

Não existe nenhum pipeline de CI/CD. Não há verificação automática de lint, testes ou build em pull requests ou pushes. Erros que quebram o build só são descobertos manualmente.

## O que será feito

### 6.1 Criar `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Lint & Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npm run lint

      - name: Run tests
        run: npm test -- --run

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

### 6.2 Criar diretório `.github/workflows/`

```bash
mkdir -p .github/workflows
```

## Arquivos Criados

| Arquivo | Tipo |
|---------|------|
| `.github/workflows/ci.yml` | Criar |

## O que o CI verifica automaticamente

| Verificação | Quando |
|-------------|--------|
| TypeScript sem erros (`tsc --noEmit`) | Todo push e PR |
| Testes passando (Vitest) | Todo push e PR |
| Build do frontend sem erros | Após testes passarem |
| Artifact do build salvo | Build bem-sucedido |

## Configuração no GitHub

Não requer secrets para o CI básico. Se quiser deploy automático para o Render.com:

1. Ir em Render.com → Settings → Deploy Hooks → copiar URL
2. Adicionar no GitHub: Settings → Secrets → `RENDER_DEPLOY_HOOK`
3. Adicionar step ao job `build`:
```yaml
      - name: Deploy to Render
        if: github.ref == 'refs/heads/main'
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## Verificação

```bash
# Após criar o arquivo e fazer push, verificar no GitHub:
# → Actions → CI → deve aparecer verde em todos os jobs
```

## Status de Conclusão

- [ ] Diretório `.github/workflows/` criado
- [ ] `.github/workflows/ci.yml` criado
- [ ] Push feito para main
- [ ] GitHub Actions rodou com sucesso (todos os jobs verdes)
- [ ] PR de teste criado para verificar que o CI bloqueia PR com erro
