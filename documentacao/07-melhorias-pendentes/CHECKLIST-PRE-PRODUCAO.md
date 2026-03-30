# Checklist Pre-Producao

## O Que PRECISA Ser Feito Antes de Publicar Online

---

### Seguranca (OBRIGATORIO)

- [ ] **Trocar JWT_SECRET** - O valor padrao `financeflow-dev-secret-change-in-production` NUNCA deve ir para producao. Usar string longa e aleatoria (32+ caracteres)
- [ ] **Trocar senha admin** - Senha padrao `admin` deve ser trocada imediatamente
- [ ] **Trocar senha configuracoes** - Senha padrao `1234` deve ser trocada
- [ ] **Configurar CORS** - Trocar `*` por dominio real (ex: `https://meusite.com`)
- [ ] **Habilitar HTTPS** - Obrigatorio para proteger tokens e senhas em transito
- [ ] **Revisar body limit** - 50MB e excessivo para producao. Reduzir para 5-10MB
- [ ] **Remover .env do repositorio** - Se estiver versionado, remover e adicionar ao .gitignore
- [ ] **Revisar rate limiting** - Ajustar limites para producao real

---

### Codigo (RECOMENDADO)

- [ ] **Remover server.ts legado** - Arquivo de 1160 linhas nao utilizado
- [ ] **Remover script dev:legacy** - Nao necessario em producao
- [ ] **Eliminar componentes duplicados** - 10+ componentes existem em 2 locais
- [ ] **Remover console.logs** - Podem vazar informacoes sensiveis
- [ ] **Corrigir tipos `any`** - Melhorar seguranca de tipos

---

### Arquitetura (RECOMENDADO)

- [x] **Implementar React Router** - URLs reais para navegacao (Fase 2)
- [x] **Implementar React Context** - AuthContext, DataContext, SettingsContext (Fase 2)
- [ ] **Modularizar componentes grandes** - ServiceOrders.tsx, ClientPayments.tsx (Fase 3)

---

### Banco de Dados

- [ ] **Backup strategy** - Definir como fazer backup do finance.db
- [ ] **Dados de exemplo** - Remover transacoes de seed em producao
- [ ] **Indices** - Adicionar indices em colunas frequentemente buscadas (customerId, date, status)

---

### Build e Deploy

- [ ] **Testar build de producao** - `npm run build` sem erros
- [ ] **Testar modo producao** - `NODE_ENV=production` com static files
- [ ] **Configurar PM2 ou similar** - Process manager para manter servidor ativo
- [ ] **Configurar dominio** - DNS apontando para o servidor
- [ ] **Configurar SSL/TLS** - Certificado HTTPS (Let's Encrypt)
- [ ] **Definir porta** - Usar reverse proxy (nginx) na porta 80/443

---

### Variaveis de Ambiente (Producao)

```env
# OBRIGATORIO - Valores reais
PORT=3000
JWT_SECRET=<string-longa-aleatoria-32-chars>
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://seu-dominio.com
NODE_ENV=production

# OPCIONAL
GEMINI_API_KEY=<sua-chave>
DATABASE_URL=<se-migrar-para-postgresql>
```

---

### Testes Minimos Antes de Publicar

- [ ] Login funciona com usuario real (nao admin/admin)
- [ ] CRUD de transacoes funciona
- [ ] CRUD de clientes funciona
- [ ] Criar e editar OS funciona
- [ ] Pagamentos e parcelas funcionam
- [ ] Recibos geram corretamente
- [ ] Pagina publica de status funciona
- [ ] Rate limiting bloqueia tentativas excessivas de login
- [ ] Token expirado redireciona para login
- [ ] Roles e permissoes funcionam (testar com employee)

---

### Monitoramento Pos-Deploy

- [ ] **Logs do servidor** - Configurar log em arquivo (nao so console)
- [ ] **Health check** - Endpoint GET /api/health para monitorar
- [ ] **Backup automatico** - Cron job para copiar finance.db
- [ ] **Alertas** - Notificacao se o servidor cair

---

## Resumo de Prioridades

| Prioridade | Itens | Tempo Estimado |
|------------|-------|----------------|
| Bloqueante | Seguranca (JWT, senhas, CORS, HTTPS) | 1-2 horas |
| Alta | Remover legado, duplicatas, console.logs | 2-4 horas |
| Media | Modularizar componentes | 1-2 dias (Fase 3) |
| Baixa | Testes, ESLint, PWA | 3-5 dias (Fase 4) |

## Progresso Atual

| Fase | Status | Concluido em |
|------|--------|--------------|
| Fase 1: Backend Modular | ✅ CONCLUIDA | 2026-03 |
| Fase 2: Router + Contexts | ✅ INTEGRADA | 2026-03 |
| Fase 3: Modularizacao | ⏳ PENDENTE | - |
| Fase 4: Qualidade e Testes | ⏳ PENDENTE | - |
| Fase 5: Cloud Deploy | ⏳ PENDENTE | - |
