FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY src/middleware ./src/middleware
COPY tsconfig.json ./
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["npm", "start"]
