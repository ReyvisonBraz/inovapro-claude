# Middleware

## Pipeline de Middleware

A ordem de execucao dos middleware no Express:

```
Requisicao HTTP
    │
    ▼
1. express.json()          → Parseia body JSON (limite 50MB)
    │
    ▼
2. express.urlencoded()    → Parseia form data (limite 50MB)
    │
    ▼
3. apiLimiter              → Rate limiting global (200 req/min)
    │
    ▼
4. Router                  → Direciona para rota correta
    │
    ▼
5. loginLimiter            → Rate limiting login (10/15min) [so no POST /login]
    │
    ▼
6. requireAuth             → Valida JWT token [rotas protegidas]
    │
    ▼
7. requireRole/Permission  → Verifica acesso [rotas restritas]
    │
    ▼
8. Route Handler           → Logica da rota
    │
    ▼
9. errorHandler            → Captura erros nao tratados
    │
    ▼
Response HTTP
```

## auth.ts - Autenticacao e Autorizacao

### generateToken(payload)

Gera um JWT token com o payload fornecido.

```typescript
const token = generateToken({
  userId: 1,
  role: "owner",
  permissions: ["view_dashboard", "manage_transactions"]
});
// Retorna: string JWT (valido por 8h)
```

### verifyToken(token)

Valida e decodifica um JWT token.

```typescript
const payload = verifyToken(token);
// Retorna: { userId, role, permissions } ou lanca erro
```

### requireAuth (Middleware)

Middleware que exige autenticacao em uma rota.

```
1. Busca header: Authorization: Bearer <token>
2. Extrai o token
3. Valida com verifyToken()
4. Seta req.user = { userId, role, permissions }
5. Chama next()

Erros:
- 401: Token ausente → "Token nao fornecido"
- 401: Token invalido → "Token invalido ou expirado"
```

### requireRole(...roles) (Factory)

Cria middleware que exige um dos roles listados.

```typescript
// Uso nas rotas:
router.post("/users", requireAuth, requireRole("owner"), handler);

// Verifica:
// req.user.role esta em ["owner"]?
// Sim → next()
// Nao → 403 "Acesso negado: role insuficiente"
```

### requirePermission(...permissions) (Factory)

Cria middleware que exige permissoes especificas.

```typescript
// Uso nas rotas:
router.get("/reports", requireAuth, requirePermission("view_reports"), handler);

// Verifica:
// req.user.role === "owner"? → bypass (acesso total)
// req.user.permissions contem TODAS as permissoes? → next()
// Nao → 403 "Acesso negado: permissao insuficiente"
```

## errorHandler.ts - Tratamento de Erros

Middleware global que captura todos os erros nao tratados.

### Tipos de Erro

| Tipo | Status | Resposta |
|------|--------|----------|
| ZodError | 400 | `{ error: "Dados invalidos", details: [...] }` |
| AppError | Variavel | `{ error: mensagem }` |
| Error generico | 500 | `{ error: "Erro interno do servidor" }` |

### AppError (Classe Custom)

```typescript
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Uso:
throw new AppError("Cliente nao encontrado", 404);
throw new AppError("Acesso negado", 403);
```

### Seguranca

- Em desenvolvimento: log completo do erro no console
- Em producao: nao expoe stack traces ou detalhes internos
- Erros Zod retornam campos invalidos para o frontend

## rateLimiter.ts - Rate Limiting

### loginLimiter

Protege endpoint de login contra brute-force.

| Configuracao | Valor |
|-------------|-------|
| Janela | 15 minutos |
| Max tentativas | 10 |
| Resposta ao exceder | 429 Too Many Requests |
| Aplicado em | `POST /api/login` |

### apiLimiter

Protecao geral contra abuso da API.

| Configuracao | Valor |
|-------------|-------|
| Janela | 1 minuto |
| Max requisicoes | 200 |
| Resposta ao exceder | 429 Too Many Requests |
| Aplicado em | Todos os endpoints |
