# ============================================================
# INOVA PRO — Dockerfile (Node + Express + Prisma + PostgreSQL)
# ============================================================
# Estágio 1: build (dependências completas + compilação)
# Estágio 2: produção (apenas runtime, imagem mínima)

FROM node:20-slim AS builder

WORKDIR /app

# Schema copiado ANTES do npm ci: o postinstall roda `prisma generate`
# e precisa do schema presente.
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Estágio de Produção ───
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Schema antes do install (postinstall gera o Prisma Client). tsx está em
# dependencies, então roda o server em produção.
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --omit=dev

# Frontend compilado
COPY --from=builder /app/dist ./dist

# Código do servidor (TypeScript, executado via tsx)
COPY server.ts ./
COPY src ./src

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Aplica migrations pendentes antes de subir o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
