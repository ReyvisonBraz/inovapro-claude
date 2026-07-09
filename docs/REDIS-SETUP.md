# Configurar `REDIS_URL` (rate-limit de login) — Upstash + Vercel

**Por quê:** na Vercel (serverless), cada invocação é um processo isolado. O rate-limit de login em memória (`express-rate-limit`) **não** compartilha o contador entre instâncias, então a proteção contra brute-force fica fraca. Com `REDIS_URL` definido, o contador vai para o Redis (compartilhado entre todas as instâncias) e a proteção passa a valer de verdade.

O código já está pronto (`src/lib/rate-limit.ts`): **se `REDIS_URL` existe, usa Redis; senão, cai para memória.** Você só precisa provisionar o Redis e colar a URL na Vercel.

> Usamos **Upstash** (Redis serverless com free tier generoso, TLS por padrão, cobra por request — ideal para esse uso esporádico). Qualquer Redis com URL `rediss://`/`redis://` acessível pela internet também serve.

---

## Passo 1 — Criar o banco Redis no Upstash

1. Acesse **https://upstash.com** e entre (dá pra logar com GitHub/Google).
2. No console, vá em **Redis → Create Database**.
3. Preencha:
   - **Name:** `inovapro-ratelimit` (ou o que preferir).
   - **Type/Primary Region:** escolha **Regional** (free) e uma região **próxima da região do seu deploy Vercel** (ex.: `us-east-1` se o projeto estiver em `iad1`). Menos latência.
   - **TLS:** deixe **ligado** (padrão).
   - **Eviction:** pode deixar ligado (não faz diferença para rate-limit).
4. Clique em **Create**.

## Passo 2 — Copiar a `REDIS_URL` (formato ioredis, com TLS)

1. Abra o banco recém-criado no console do Upstash.
2. Na seção **Connect to your database**, escolha a aba **Node** / **ioredis** (ou o campo **Endpoint**).
3. Copie a connection string que **começa com `rediss://`** (com dois "s" = TLS). O formato é:
   ```
   rediss://default:<SENHA>@<ENDPOINT>.upstash.io:<PORTA>
   ```
   > ⚠️ Use a URL **`rediss://`** (TLS), não a `redis://`. O `ioredis` conecta na porta TLS do Upstash. Se copiar só o endpoint + senha, monte a URL nesse formato.

## Passo 3 — Setar a env var na Vercel

1. Vercel → seu projeto **inovapro** → **Settings → Environment Variables**.
2. **Add New:**
   - **Key:** `REDIS_URL`
   - **Value:** a string `rediss://...` do Passo 2.
   - **Environments:** marque **Production** (e Preview/Development se quiser proteger esses ambientes também).
3. **Save.**

## Passo 4 — Redeploy (obrigatório)

Env vars só entram em vigor em **novos** deploys.
- **Deployments → deploy mais recente → menu ⋯ → Redeploy**, **ou**
- faça um push qualquer na `main` (o merge do PR de qualidade já serve).

## Passo 5 — Verificar que funcionou

Escolha um:

- **Pelo Upstash (mais fácil):** faça 1 tentativa de login no app em produção e, no console do Upstash, abra **Data Browser** (ou **Metrics**). Deve aparecer uma chave de rate-limit (prefixo tipo `rl:` / a chave do `rate-limit-redis`) e o gráfico de comandos subir.
- **Pelo comportamento:** faça **11 tentativas de login com senha errada** do mesmo IP em menos de 15 min. A **11ª** deve responder **HTTP 429** com `{"error":"Muitas tentativas. Tente novamente em 15 minutos."}`. Com Redis, esse limite vale **entre todas as instâncias serverless** (antes, cada instância tinha o seu contador).

---

## Parâmetros atuais (referência)

Definidos em [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts):

| Parâmetro | Valor | Significado |
|-----------|-------|-------------|
| `windowMs` | `15 * 60 * 1000` | janela de 15 minutos |
| `max` | `10` | 10 tentativas por janela, por IP |
| `maxRetriesPerRequest` | `3` | retries do ioredis por comando |

Para afrouxar/apertar, ajuste `max`/`windowMs` nesse arquivo.

## Notas de serverless

- **Churn de conexão:** cada cold start abre uma conexão ioredis nova. Para um limiter de login (baixo volume) é aceitável; o Upstash aguenta muitas conexões. Não precisa de pool.
- **Sem `REDIS_URL`:** o app **não quebra** — só volta ao rate-limit em memória (por-instância). Serve para dev/local; em produção serverless, prefira o Redis.
- **Cache do rastreio público** (`node-cache`) segue em memória de propósito (TTL 2 min, impacto pequeno). Só o rate-limit de login precisa do Redis.

## Checklist

- [ ] Banco criado no Upstash (região próxima do deploy).
- [ ] `REDIS_URL` (`rediss://...`) copiada.
- [ ] `REDIS_URL` setada na Vercel (Production).
- [ ] Redeploy feito.
- [ ] Verificado (chave aparece no Upstash **ou** 11ª tentativa → 429).
