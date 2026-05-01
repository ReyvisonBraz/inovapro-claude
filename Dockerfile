# ============================================================
# INOVA PRO — Dockerfile otimizado para Google Cloud Run
# ============================================================
# Estágio 1: build (dependências completas + compilação)
# Estágio 2: produção (apenas runtime, imagem mínima)

FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Gerar Prisma client a partir do schema
COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ─── Estágio de Produção ───
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# tsx está em dependencies, não devDependencies — será instalado
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma client gerado + schema
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Frontend compilado
COPY --from=builder /app/dist ./dist

# Código do servidor (TypeScript, executado via tsx)
COPY server.ts ./
COPY src ./src

# Diretório para dados SQLite (caso necessário)
RUN mkdir -p /app/data

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
