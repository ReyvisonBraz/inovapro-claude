# Variaveis de Ambiente

## Arquivo: .env

### Variaveis Obrigatorias (Producao)

| Variavel | Descricao | Valor Padrao | Producao |
|----------|-----------|--------------|----------|
| `PORT` | Porta do servidor | 3000 | 3000 (ou outra) |
| `JWT_SECRET` | Segredo para assinar tokens JWT | `financeflow-dev-secret...` | **OBRIGATORIO: string aleatoria 32+ chars** |
| `JWT_EXPIRES_IN` | Tempo de expiracao do token | 8h | 8h |
| `BCRYPT_ROUNDS` | Rounds do bcrypt (hash de senha) | 10 | 12 (mais seguro) |
| `CORS_ORIGIN` | Origens permitidas para CORS | `*` | **OBRIGATORIO: dominio real** |
| `NODE_ENV` | Ambiente de execucao | development | **production** |

### Variaveis Opcionais

| Variavel | Descricao | Valor Padrao |
|----------|-----------|--------------|
| `GEMINI_API_KEY` | Chave da API Google Gemini (IA) | (vazio) |
| `DISABLE_HMR` | Desativar Hot Module Replacement | false |
| `DATABASE_URL` | URL do PostgreSQL (Fase 5) | (vazio) |

## Exemplo .env Desenvolvimento

```env
PORT=3000
JWT_SECRET=change-me-in-production-use-a-long-random-string
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10
CORS_ORIGIN=*
DISABLE_HMR=false
GEMINI_API_KEY=
```

## Exemplo .env Producao

```env
PORT=3000
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://seu-dominio.com
NODE_ENV=production
GEMINI_API_KEY=AIza...sua-chave-real
```

## Gerar JWT_SECRET Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Seguranca

- **NUNCA** versionar o arquivo `.env` no Git
- Usar `.env.example` como template (sem valores reais)
- Em servicos de hospedagem, configurar via dashboard (nao arquivo)
- Rotacionar JWT_SECRET periodicamente (invalida todos os tokens)
- Manter BCRYPT_ROUNDS >= 10 (12 recomendado para producao)
- CORS_ORIGIN nunca deve ser `*` em producao

## Onde Sao Usadas

| Variavel | Arquivo que Consome |
|----------|-------------------|
| PORT | server/config.ts → server/index.ts |
| JWT_SECRET | server/config.ts → server/middleware/auth.ts |
| JWT_EXPIRES_IN | server/config.ts → server/middleware/auth.ts |
| BCRYPT_ROUNDS | server/config.ts → server/routes/auth.routes.ts |
| CORS_ORIGIN | server/config.ts → server/index.ts |
| GEMINI_API_KEY | vite.config.ts → src/ (via import.meta.env) |
| DISABLE_HMR | server/index.ts |
| DATABASE_URL | prisma/schema.prisma (futuro) |
