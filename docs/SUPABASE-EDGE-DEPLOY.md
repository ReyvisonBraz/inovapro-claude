# Supabase Edge Functions - Guia de Deploy

## 1. Instalar Supabase CLI

```bash
# Linux/macOS
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz
tar -xzf /tmp/supabase.tar.gz -C /tmp
chmod +x /tmp/supabase
sudo mv /tmp/supabase /usr/local/bin/supabase

# Verificar instalação
supabase --version
```

## 2. Login no Supabase

```bash
supabase login
```

## 3. Linkar o projeto

```bash
cd supabase
supabase link --project-ref dqpxwyixiluiyfjxakge
```

## 4. Configurar Secrets

```bash
supabase secrets set JWT_SECRET="cda85d85dd2a068fcfb9b76223b511dd3b22299db35b2c545e2d214dc05a4484"
```

## 5. Deployar todas as funções

```bash
supabase functions deploy
```

## 6. Testar

```bash
# Health check
curl https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/health

# Login
curl -X POST https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin2021"}'
```

## URLs das Functions

Após deploy, as functions estarão disponíveis em:
```
https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/{function-name}
```

Exemplos:
- `https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/login`
- `https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/customers`
- `https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/transactions`
- `https://dqpxwyixiluiyfjxakge.supabase.co/functions/v1/stats`

## Estrutura das Pastas

```
supabase/
└── functions/
    ├── _shared/
    │   └── database.ts      # Lib compartilhada
    ├── login/
    │   └── index.ts
    ├── categories/
    │   └── index.ts
    ├── customers/
    │   └── index.ts
    ├── transactions/
    │   └── index.ts
    ├── service-orders/
    │   └── index.ts
    ├── client-payments/
    │   └── index.ts
    ├── settings/
    │   └── index.ts
    ├── users/
    │   └── index.ts
    ├── inventory/
    │   └── index.ts
    ├── brands/
    │   └── index.ts
    ├── equipment-types/
    │   └── index.ts
    ├── models/
    │   └── index.ts
    ├── service-order-statuses/
    │   └── index.ts
    ├── audit-logs/
    │   └── index.ts
    ├── receipts/
    │   └── index.ts
    └── health/
        └── index.ts
```

## Notas Importantes

1. **CORS**: As functions já têm headers CORS configurados
2. **Auth**: A verificação de JWT não está incluída (pode adicionar depois)
3. **Conexão BD**: Usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` automaticamente
4. **Tempo limite**: Edge Functions têm limite de ~60s