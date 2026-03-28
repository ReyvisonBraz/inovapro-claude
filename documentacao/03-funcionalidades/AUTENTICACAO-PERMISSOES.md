# Autenticacao e Permissoes

## Visao Geral

O sistema usa autenticacao baseada em JWT (JSON Web Token) com controle de acesso por roles (papeis) e permissoes granulares.

## Fluxo de Login

1. Usuario envia `POST /api/login` com `{ username, password }`
2. Rate limiter verifica: maximo 10 tentativas a cada 15 minutos
3. Servidor busca usuario no banco por username
4. Compara senha:
   - Se hash bcrypt: `bcrypt.compare(password, hash)`
   - Se plaintext legado: comparacao direta + auto-upgrade para bcrypt
5. Gera JWT com payload: `{ userId, role, permissions }`
6. Retorna token + dados do usuario ao frontend
7. Frontend salva token em `localStorage("financeflow_token")`

## JWT Token

### Payload

```typescript
{
  userId: number,
  role: "owner" | "manager" | "employee",
  permissions: string[]
}
```

### Configuracao

| Parametro | Valor Padrao | Variavel de Ambiente |
|-----------|--------------|---------------------|
| Secret | `financeflow-dev-secret-change-in-production` | `JWT_SECRET` |
| Expiracao | 8 horas | `JWT_EXPIRES_IN` |
| Algoritmo | HS256 (padrao do jsonwebtoken) | - |

### Uso nas Requisicoes

Todas as requisicoes autenticadas devem incluir:

```
Authorization: Bearer <token>
```

O `api.ts` do frontend adiciona automaticamente o token em todas as requisicoes.

## Roles (Papeis)

| Role | Descricao | Permissoes |
|------|-----------|------------|
| `owner` | Dono do sistema | TODAS (bypass automatico) |
| `manager` | Gerente | Configuraveis pelo owner |
| `employee` | Funcionario | Configuraveis pelo owner |

### Regras de Role

- Somente `owner` pode criar, editar e excluir usuarios
- Somente `owner` pode excluir o ultimo owner (bloqueado pelo sistema)
- `owner` tem todas as permissoes automaticamente, independente do campo `permissions`

## Permissoes Granulares

| Permissao | Descricao |
|-----------|-----------|
| `view_dashboard` | Visualizar dashboard financeiro |
| `manage_transactions` | Criar, editar, excluir transacoes |
| `view_reports` | Visualizar relatorios |
| `manage_customers` | Gerenciar clientes |
| `manage_payments` | Gerenciar pagamentos |
| `manage_settings` | Acessar configuracoes |
| `manage_users` | Gerenciar usuarios (somente owner) |

### Como Funciona

- Permissoes sao armazenadas como JSON array no campo `permissions` da tabela `users`
- Exemplo: `["view_dashboard", "manage_transactions", "manage_customers"]`
- Owner ignora permissoes (tem acesso total)
- Manager e employee precisam ter a permissao explicita

## Middleware de Autenticacao

### `requireAuth`

Verifica se a requisicao tem um token JWT valido.

```
Requisicao → Verifica header Authorization
           → Extrai Bearer token
           → Valida JWT com secret
           → Seta req.user = { userId, role, permissions }
           → Proxima middleware/rota

Erro: 401 Unauthorized (token ausente ou invalido)
```

### `requireRole(...roles)`

Verifica se o usuario tem um dos roles permitidos.

```
Requisicao → requireAuth (primeiro)
           → Verifica se req.user.role esta em roles[]
           → Proxima middleware/rota

Erro: 403 Forbidden (role nao autorizado)
```

### `requirePermission(...permissions)`

Verifica se o usuario tem as permissoes necessarias.

```
Requisicao → requireAuth (primeiro)
           → Se role = "owner" → bypass (acesso total)
           → Verifica se req.user.permissions contem TODAS as permissoes
           → Proxima middleware/rota

Erro: 403 Forbidden (permissao insuficiente)
```

## Rate Limiting

| Endpoint | Limite | Janela | Proposito |
|----------|--------|--------|-----------|
| `POST /api/login` | 10 tentativas | 15 minutos | Protecao contra brute-force |
| Todos os endpoints | 200 requisicoes | 1 minuto | Protecao geral contra abuso |

## Senhas

### Hash

- Algoritmo: bcrypt
- Rounds: 10 (configuravel via `BCRYPT_ROUNDS`)
- Novas senhas sempre hasheadas

### Compatibilidade Legada

O sistema detecta senhas em plaintext e faz auto-upgrade:

```
Login com senha plaintext
  → Compara diretamente
  → Se valido: hash a senha com bcrypt
  → Atualiza no banco
  → Proximos logins usam bcrypt
```

### Usuario Padrao

| Campo | Valor |
|-------|-------|
| Username | `admin` |
| Password | `admin` |
| Role | `owner` |

**IMPORTANTE:** Trocar a senha padrao antes de ir para producao!

## Sessao

- Token armazenado em `localStorage("financeflow_token")`
- Dados do usuario em `localStorage("financeflow_user")`
- Token expira apos 8h (configuravel)
- Ao receber 401, o frontend:
  1. Remove token do localStorage
  2. Recarrega a pagina (volta para login)
- Nao ha refresh token (sessao expira e precisa logar novamente)

## Seguranca - Pontos de Atencao

### Implementado
- Hash bcrypt para senhas
- JWT com expiracao
- Rate limiting no login
- Validacao de entrada com Zod
- Error handler que nao expoe stack traces
- CORS configuravel

### A Melhorar (Pre-Producao)
- [ ] Trocar JWT_SECRET padrao
- [ ] Trocar senha do admin padrao
- [ ] Configurar CORS restritivo (nao usar `*`)
- [ ] Implementar HTTPS
- [ ] Adicionar refresh token para sessoes mais longas
- [ ] Implementar logout no backend (blacklist de tokens)
- [ ] Revisar body limit de 50MB (muito alto para producao)
