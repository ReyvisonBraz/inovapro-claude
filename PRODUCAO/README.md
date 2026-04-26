# INOVA PRO — Roteiro de Produção

Este diretório documenta todas as etapas necessárias para colocar o projeto em produção no Render.com de forma segura.

## Status Geral

| Fase | Descrição | Status |
|------|-----------|--------|
| [Fase 1](./FASE-1-AUTH.md) | Autenticação JWT | ✅ Concluída |
| [Fase 2](./FASE-2-SEGURANCA.md) | Segurança HTTP (CORS, Helmet, Rate Limit) | ✅ Concluída |
| [Fase 3](./FASE-3-SECRETS.md) | Secrets & Proxy Gemini | ✅ Concluída |
| [Fase 4](./FASE-4-DEPLOY.md) | Build de Produção & Deploy | ✅ Concluída |
| [Fase 5](./FASE-5-QUALIDADE.md) | Qualidade & Error Handling | ✅ Concluída |
| [Fase 6](./FASE-6-CICD.md) | CI/CD (GitHub Actions) | ✅ Concluída |

## Ordem de Execução

```
Fase 1 (Auth JWT)          ← começar aqui — bloqueador principal
Fase 2 (HTTP Security)     ← paralelo com Fase 1
Fase 3 (Secrets/Gemini)    ← após Fase 1
Fase 4 (Build/Deploy)      ← após Fases 1, 2, 3
Fase 5 (Error Handling)    ← após Fase 4
Fase 6 (CI/CD)             ← por último
```

## Checklist de Verificação Final

- [ ] `GET /api/transactions` sem token → retorna 401
- [ ] `POST /api/login` → retorna `{ token, user }` sem campo `password`
- [ ] `GET /api/transactions` com `Authorization: Bearer <token>` → retorna dados
- [ ] DevTools → Sources → buscar `GEMINI` no bundle JS → não encontrar nada
- [ ] `GET /health` → `{ status: "ok", timestamp: "...", version: "1.0.0" }`
- [ ] `npm run build && NODE_ENV=production npm start` → app funciona em localhost:3000
- [ ] `docker build -t inovapro . && docker run -p 3000:3000 inovapro` → app responde

## Estimativa Total

**7-10 horas** de implementação distribuídas nas 6 fases.
