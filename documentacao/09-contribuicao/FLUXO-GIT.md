# Fluxo Git

## Branch Principal

- **main** - Branch de producao e desenvolvimento ativo

## Branches de Feature

Para novas funcionalidades ou correcoes:

```bash
# Criar branch
git checkout -b feature/nome-da-feature

# Trabalhar e commitar
git add .
git commit -m "feat: descricao da mudanca"

# Voltar para main e merge
git checkout main
git merge feature/nome-da-feature

# Limpar branch
git branch -d feature/nome-da-feature
```

## Convencao de Commits

Prefixos recomendados:

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correcao de bug |
| `refactor:` | Refatoracao sem mudar comportamento |
| `docs:` | Mudancas em documentacao |
| `chore:` | Tarefas de manutencao (deps, config) |
| `style:` | Mudancas visuais / CSS |
| `test:` | Adicionar ou corrigir testes |

### Exemplos

```bash
git commit -m "feat: Implement service order management"
git commit -m "fix: Corrigir calculo de parcelas no pagamento"
git commit -m "refactor: Extrair ServiceOrderList do ServiceOrders.tsx"
git commit -m "docs: Adicionar documentacao de endpoints da API"
git commit -m "chore: Atualizar dependencias do projeto"
```

## .gitignore

Arquivos que NAO devem ser versionados:

```
node_modules/
dist/
.env
finance.db
finance.db-shm
finance.db-wal
*.log
```

## Fluxo Recomendado para Refatoracao

Para as fases do roadmap, recomenda-se:

```bash
# Fase 2
git checkout -b feature/react-router
# ... implementar React Router
git commit -m "feat: Implementar React Router v6"
# ... implementar Contexts
git commit -m "feat: Criar AuthContext e DataContexts"
git checkout main
git merge feature/react-router

# Fase 3
git checkout -b feature/modularizacao
# ... quebrar componentes
git commit -m "refactor: Dividir ServiceOrders em subcomponentes"
git checkout main
git merge feature/modularizacao
```

## Antes de Cada Commit

1. Verificar tipos: `npm run lint`
2. Testar build: `npm run build`
3. Testar a aplicacao manualmente
4. Revisar mudancas: `git diff`
5. Nao incluir arquivos sensiveis (.env, banco)
