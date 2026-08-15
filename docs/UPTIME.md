# Monitor de uptime — INOVA PRO

Detecta indisponibilidade da infraestrutura (deploy quebrado, banco fora,
certificado expirado) mesmo quando nenhum erro chega aos logs — sem depender de
alguém notar primeiro.

## Endpoint monitorado

`GET /health` → responde `200` com `{"status":"ok",...}` quando o processo e a
conexão com o banco estão saudáveis (rotas em `src/routes/health.ts`).

> A Vercel já valida o boot da função; o valor do monitor externo é verificar o
> **domínio público** (TLS, roteamento, proxy) a cada poucos minutos.

## Configuração (UptimeRobot, ~5 min)

Criar um monitor HTTP(S) apontando para:

```
https://www.inovapro3d.com.br/health
```

| Configuração | Valor |
| --- | --- |
| Monitor type | HTTP(S) |
| Interval | 5 minutos |
| Timeout | 30 s |
| Alert threshold | 1 falha consecutiva (evita falso positivo) |
| Successful status codes | 200 |
| Alert contacts | e-mail do dono; opcionalmente telefone/WhatsApp |

Alternativa equivalente: Healthchecks.io (self-hostável) ou o uptime check do
Sentry se o Sentry for habilitado depois.

## Critérios de alerta

- **Downtime**: resposta não-200 ou timeout ≥30 s em 1 verificação.
- **Degradação**: 2 falhas em 10 minutos (análise manual, não alerta automático).
- **Banco**: um deploy com o banco inacessível costuma manter `/health` 200 no
  boot e falhar nas rotas autenticadas — o monitor externo cobre só o básico; a
  cobertura de erros 5xx é responsabilidade da observabilidade (SystemError +
  futuro provedor de alertas).

## Checkout

- [ ] Monitor criado apontando para `/health` no domínio público
- [ ] Intervalo 5 min, alerta em 1 falha, contato correto
- [ ] Um teste de queda real (ex.: pausar o monitor e conferir que o alerta chega)
