# Fase 1 — Autenticação JWT

**Status:** ⏳ Pendente  
**Prioridade:** 🔴 Crítico — bloqueador absoluto  
**Estimativa:** 3-4 horas

## Problema Atual

Todas as ~50 rotas da API estão completamente abertas. Qualquer pessoa que acesse `http://servidor:3000/api/users` recebe todos os usuários sem qualquer verificação de identidade. O arquivo `src/middleware/auth.ts` existe mas contém apenas placeholders não funcionais.

## O que será feito

### 1.1 Instalar dependência
```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 1.2 Implementar `src/middleware/auth.ts`

Substituir os placeholders:
- `generateToken(payload)` → usa `jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })`
- `verifyToken(token)` → usa `jwt.verify(token, JWT_SECRET)`
- Middleware `requireAuth(req, res, next)`:
  - Lê header `Authorization: Bearer <token>`
  - Verifica com `jwt.verify`
  - Anexa `req.user = { userId, username, role }` ao request
  - Retorna 401 se token inválido ou ausente

### 1.3 Atualizar endpoint de login em `server.ts` (~linha 925)

- Após validar bcrypt, chamar `generateToken({ userId, username, role })`
- **Remover campo `password`** do objeto antes de retornar
- Retornar `{ token, user: { id, username, role, permissions } }`

### 1.4 Proteger todas as rotas em `server.ts`

Reorganizar a ordem dos middlewares logo após `app.use(express.json())`:

```typescript
// 1. Rota pública (antes do middleware de auth)
app.post('/api/login', loginLimiter, loginHandler);

// 2. Middleware de auth — protege tudo abaixo
app.use('/api', requireAuth);

// 3. Registrar todas as outras rotas depois
```

### 1.5 Atualizar `src/lib/api.ts`

Adicionar request interceptor para injetar token:
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 1.6 Atualizar `src/store/useAuthStore.ts`

- `login()`: salvar `token` em localStorage, salvar `currentUser` (sem senha)
- `logout()`: limpar `token` e `currentUser` do localStorage
- Derivar `isAuthenticated` da existência do token em vez de campo separado

## Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `src/middleware/auth.ts` | Implementação real do JWT |
| `server.ts` | Login retorna token; rotas protegidas com requireAuth |
| `src/lib/api.ts` | Request interceptor para injetar Bearer token |
| `src/store/useAuthStore.ts` | Salvar/ler token do localStorage |

## Verificação

```bash
# Sem token → deve retornar 401
curl http://localhost:3000/api/transactions

# Login → deve retornar { token, user } sem campo password
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Com token → deve retornar dados
curl http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <token_do_login>"
```

## Status de Conclusão

- [ ] `jsonwebtoken` instalado
- [ ] `src/middleware/auth.ts` implementado com JWT real
- [ ] Login endpoint retorna `{ token, user }` sem senha
- [ ] `requireAuth` aplicado a todas as rotas `/api/*` exceto `/api/login`
- [ ] Frontend injeta Bearer token em todas as requisições
- [ ] `useAuthStore` salva/lê token do localStorage
- [ ] Verificação manual com curl aprovada
