# Ambiente Local (Desenvolvimento)

## Pre-Requisitos

| Requisito | Versao Minima |
|-----------|---------------|
| Node.js | 18+ |
| npm | 9+ |
| Git | 2.30+ |

## Instalacao

```bash
# 1. Clonar o repositorio
git clone <url-do-repositorio>
cd FINANCEIRO-INOVA

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Editar .env conforme necessario

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

## Acesso

| Item | Valor |
|------|-------|
| URL | http://localhost:3000 |
| Usuario | admin |
| Senha | admin |

## Como Funciona

Ao executar `npm run dev`:

1. `tsx server/index.ts` inicia o Express
2. `initializeDatabase()` cria tabelas e seed (se necessario)
3. Vite cria dev server em modo middleware dentro do Express
4. Frontend e backend rodam na mesma porta (3000)
5. HMR (Hot Module Replacement) ativo para mudancas no frontend

## Scripts Disponiveis

```bash
npm run dev        # Servidor de desenvolvimento (Express + Vite HMR)
npm run dev:legacy # Servidor legado monolitico (NAO USAR)
npm run build      # Build de producao (Vite → /dist)
npm run preview    # Preview do build de producao
npm run clean      # Remove pasta /dist
npm run lint       # Verifica tipos TypeScript
```

## Banco de Dados

- Arquivo: `finance.db` na raiz do projeto
- Criado automaticamente na primeira execucao
- Dados de seed inseridos automaticamente
- Para resetar: deletar `finance.db`, `finance.db-shm`, `finance.db-wal` e reiniciar

## Variaveis de Ambiente (Desenvolvimento)

```env
PORT=3000
JWT_SECRET=change-me-in-production-use-a-long-random-string
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10
CORS_ORIGIN=*
DISABLE_HMR=false
GEMINI_API_KEY=        # Opcional - IA para analise de OS
```

## Troubleshooting

### Porta 3000 em uso

```bash
# Trocar a porta no .env
PORT=3001
```

### Banco corrompido

```bash
# Deletar e reiniciar
rm finance.db finance.db-shm finance.db-wal
npm run dev
```

### Erro de dependencias

```bash
rm -rf node_modules package-lock.json
npm install
```

### HMR nao funciona

```bash
# Desativar e reativar
DISABLE_HMR=true npm run dev  # sem HMR
DISABLE_HMR=false npm run dev # com HMR
```
