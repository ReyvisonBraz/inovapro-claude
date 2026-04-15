# Manual de Uso Local — INOVA PRO

## Primeira vez em uma máquina nova

```bash
git clone https://github.com/ReyvisonBraz/inovapro-claude.git
cd inovapro-claude
npm install
npm run dev
```

Só isso. O banco de dados (`finance.db`) vem junto com o clone — todos os dados incluídos.

---

## Fluxo do dia a dia

**Antes de começar a trabalhar — puxar o que tem de novo:**
```bash
git pull origin main
```

**Depois de trabalhar — salvar código + banco:**
```bash
git add .
git commit -m "descricao do que foi feito"
git push origin main
```

---

## ⚠️ Regra importante sobre o banco de dados

O `finance.db` é um arquivo binário (SQLite). Se você trabalhar em **duas máquinas ao mesmo tempo** sem sincronizar, vai gerar conflito de merge — e o git não consegue resolver conflito em arquivo binário automaticamente.

**Regra simples para nunca ter problema:**
> Sempre `git pull` antes de começar e `git push` ao terminar.

---

## O que NÃO precisa instalar

- Nenhum banco de dados separado — SQLite já está embutido no projeto
- Nenhum serviço externo — tudo roda localmente
- O `npm install` já cuida de todas as dependências (bcryptjs, better-sqlite3, etc.)

---

## Credenciais padrão

| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `admin` |

---

## Observações para migração futura (produção)

Quando for colocar online, os pontos que precisam de atenção são:

- **Banco de dados** — migrar SQLite para PostgreSQL ou MySQL
- **Autenticação** — implementar JWT para proteger as rotas da API
- **Variáveis de ambiente** — criar `.env` real no servidor com `PORT` e `ADMIN_PASSWORD`
- **Build** — rodar `npm run build` e servir a pasta `dist/` via Express
- **HTTPS** — configurar Nginx ou Caddy como proxy reverso
- **`finance.db`** — remover do `.gitignore` antes de subir (não expor dados reais)
