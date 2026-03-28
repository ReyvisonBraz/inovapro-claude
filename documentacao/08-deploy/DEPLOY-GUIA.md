# Guia de Deploy

## Opcoes de Hospedagem

---

### Opcao 1: VPS (DigitalOcean, Contabo, Hostinger)

**Melhor para:** Controle total, menor custo a longo prazo

#### Passos

```bash
# 1. Conectar ao servidor
ssh user@seu-servidor

# 2. Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar PM2 (process manager)
npm install -g pm2

# 4. Clonar o projeto
git clone <url-do-repositorio> /var/www/financeiro
cd /var/www/financeiro

# 5. Instalar dependencias
npm install

# 6. Configurar .env de producao
cp .env.example .env
nano .env  # Configurar valores reais

# 7. Build do frontend
npm run build

# 8. Iniciar com PM2
NODE_ENV=production pm2 start server/index.ts --interpreter tsx --name financeiro

# 9. Configurar auto-start
pm2 startup
pm2 save
```

#### Nginx (Reverse Proxy + HTTPS)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

| Pro | Contra |
|-----|--------|
| Controle total | Manutencao manual |
| Custo fixo baixo | Precisa configurar tudo |
| Sem limites de uso | Responsavel por seguranca |

---

### Opcao 2: Railway.app

**Melhor para:** Deploy rapido, zero configuracao de servidor

#### Passos

1. Criar conta em railway.app
2. Conectar repositorio GitHub
3. Railway detecta Node.js automaticamente
4. Configurar variaveis de ambiente no dashboard
5. Deploy automatico a cada push

#### Configuracao

```
Build Command: npm run build
Start Command: NODE_ENV=production tsx server/index.ts
```

| Pro | Contra |
|-----|--------|
| Deploy automatico | Custo pode crescer |
| SSL automatico | Menos controle |
| Zero manutencao | SQLite pode ter problemas (disco efemero) |

**ATENCAO:** Railway usa disco efemero. O SQLite pode perder dados em redeploy. Considere migrar para PostgreSQL ou usar volume persistente.

---

### Opcao 3: Render.com

**Melhor para:** Free tier para testes, deploy simples

#### Passos

1. Criar conta em render.com
2. New Web Service → conectar repositorio
3. Configurar:
   - Build Command: `npm install && npm run build`
   - Start Command: `NODE_ENV=production tsx server/index.ts`
4. Adicionar variaveis de ambiente
5. Deploy

| Pro | Contra |
|-----|--------|
| Free tier disponivel | Free tier dorme apos 15 min |
| SSL automatico | Disco efemero (mesmo problema SQLite) |
| Deploy por push | Latencia se servidor dormir |

---

### Opcao 4: Supabase + Vercel (Fase 5)

**Melhor para:** Arquitetura cloud-native, escalabilidade

#### Arquitetura

```
Vercel (Frontend React)
    ↕ HTTPS
Render/Railway (Backend Express)
    ↕ SQL
Supabase (PostgreSQL + Storage)
```

#### Passos

1. Criar projeto Supabase (regiao sa-east-1)
2. Migrar banco para PostgreSQL (Prisma)
3. Deploy frontend no Vercel
4. Deploy backend no Render/Railway
5. Configurar CORS entre frontend e backend

| Pro | Contra |
|-----|--------|
| Escalavel | Complexidade maior |
| Banco na nuvem | Custo distribuido |
| Backup automatico | Latencia de rede |
| Storage para fotos | Requer migracao (Fase 5) |

---

## Recomendacao

### Para MVP / Primeiro Deploy

**VPS (Opcao 1)** com:
- SQLite (sem migrar banco)
- PM2 para manter servidor ativo
- Nginx com HTTPS (Let's Encrypt)
- Backup diario do finance.db via cron

### Para Producao Escalavel

**Supabase + Vercel/Render (Opcao 4)** apos completar Fase 5:
- PostgreSQL na nuvem
- Frontend e backend separados
- Fotos no Supabase Storage
- Backup automatico pelo Supabase

---

## Backup do SQLite (Producao com VPS)

```bash
# Cron job para backup diario
crontab -e

# Adicionar linha:
0 2 * * * cp /var/www/financeiro/finance.db /backups/finance-$(date +\%Y\%m\%d).db
```
