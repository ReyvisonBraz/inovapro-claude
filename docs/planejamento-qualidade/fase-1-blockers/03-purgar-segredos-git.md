# Fase 1 · Tarefa 03 — Purgar segredos e PII do git + rotacionar credenciais (B4)

**Goal:** Remover do repositório (working tree **e histórico**) a pasta `backups/`, que contém hashes bcrypt de senhas reais (`users.json`), segredos de negócio (`settings.json`: `settingsPassword`, `pixKey`, `sendPulseClientSecret`) e PII de clientes (`customers.json`: nome, telefone, CPF). Depois, **rotacionar** tudo que vazou, porque remover do git não desfaz a exposição.

**Architecture:** Três frentes: (1) parar de rastrear e ignorar; (2) reescrever o histórico para apagar o conteúdo dos commits antigos; (3) rotacionar credenciais. Não há TDD aqui — a verificação é por comandos git que devem retornar vazio.

> ⚠️ **Reescrita de histórico é destrutiva e coordenada.** Todos que têm clone precisarão re-clonar após o force-push. Combine uma janela com o time (ou faça agora, se você é o único). Faça um clone-espelho de backup antes.

## Interfaces

- **Produz:** `.gitignore` cobrindo `backups/`; histórico sem `backups/`; segredos novos em produção. Nenhum código de app muda.

---

### Parte A — Parar de rastrear e ignorar

- [ ] **Step 1: Backup de segurança do repositório inteiro (antes de reescrever)**

```powershell
cd ..
git clone --mirror "REYVISON PROJECTS/inovapro-claude" inovapro-mirror-backup.git
cd "REYVISON PROJECTS/inovapro-claude"
```

- [ ] **Step 2: Remover `backups/` do índice (mantém no disco por ora) e ignorar**

```powershell
git rm -r --cached backups
```
Adicione ao `.gitignore` (ele já tem `data/` e `*.db`; acrescente):
```
backups/
```

- [ ] **Step 3: Commit da remoção do índice**

```powershell
git add .gitignore
git commit -m @'
chore(security): para de rastrear backups/ (contem hashes/segredos/PII)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

> Isto remove do HEAD, mas o conteúdo **continua no histórico**. A Parte B apaga do histórico.

### Parte B — Apagar do histórico

- [ ] **Step 4: Instalar `git-filter-repo`**

```powershell
pip install git-filter-repo
git filter-repo --version
```
(Se não usa Python, alternativa: BFG Repo-Cleaner — `java -jar bfg.jar --delete-folders backups`.)

- [ ] **Step 5: Reescrever o histórico removendo a pasta**

```powershell
git filter-repo --path backups --invert-paths --force
```
Esperado: reescreve todos os commits; `backups/` deixa de existir em qualquer ponto do histórico.

- [ ] **Step 6: Verificar que sumiu do histórico (deve retornar VAZIO)**

```powershell
git log --all --oneline -- backups
git log --all -p -S "sendPulseClientSecret" -- settings.json
```
Esperado: **nenhuma** saída em ambos. Confirme também um hash conhecido não aparece:
```powershell
git grep -I "lecFJYyj9IsQ" $(git rev-list --all) 2>$null
```
Esperado: vazio.

- [ ] **Step 7: Re-adicionar o remoto e force-push (filter-repo remove o origin por segurança)**

```powershell
git remote add origin <URL_DO_REPOSITORIO>
git push origin --force --all
git push origin --force --tags
```

> Avise o time: **todos devem re-clonar**. Clones antigos ainda contêm os segredos e podem re-introduzi-los num merge.

### Parte C — Rotacionar tudo que vazou (obrigatório)

Remover do git **não** invalida credenciais já expostas. Rotacione:

- [ ] **Step 8: `JWT_SECRET`** — gerar novo e atualizar no provedor de deploy (Render/Vercel → Environment). Efeito: desloga todo mundo (aceitável).
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

- [ ] **Step 9: Senha do banco (`DATABASE_URL`/`DB_PASSWORD`)** — trocar no painel do banco (Supabase/Neon/Railway) e atualizar a env no deploy e no `.env` local.

- [ ] **Step 10: `GEMINI_API_KEY`** — revogar a chave antiga no Google AI Studio e gerar nova.

- [ ] **Step 11: `SENDPULSE_CLIENT_SECRET`** — regenerar no painel SendPulse e atualizar env.

- [ ] **Step 12: Senhas de usuários e `settingsPassword`** — os hashes bcrypt do `admin` e `REY` vazaram. Forçar troca de senha desses usuários no app e trocar `settingsPassword` (hoje default `"1234"`). *(A troca é via UI de usuários/configurações do próprio sistema.)*

- [ ] **Step 13: `pixKey`** — avaliar risco. Chave PIX não é secreta por si só (é destino de pagamento), mas se for CPF/telefone pessoal, considere migrar para chave aleatória.

- [ ] **Step 14: Registrar a rotação**

Crie `docs/planejamento-qualidade/_rotacao-segredos.md` com data e checklist do que foi rotacionado (sem valores). Commit:
```powershell
git add docs/planejamento-qualidade/_rotacao-segredos.md
git commit -m @'
docs(security): registra rotacao de segredos pos-purga do git

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `git log --all -- backups` vazio.
- [ ] `.gitignore` contém `backups/`.
- [ ] `JWT_SECRET`, senha do banco, `GEMINI_API_KEY`, `SENDPULSE_CLIENT_SECRET` rotacionados.
- [ ] Senhas de `admin`/`REY` e `settingsPassword` trocadas.
- [ ] Clone-espelho de backup guardado fora do repo até validar tudo.

## Riscos

- **Force-push quebra clones:** coordene. Quem não re-clonar pode reintroduzir `backups/`.
- **Provedores mantêm cache:** se o repo é público ou já foi forkeado, considere os segredos **permanentemente** comprometidos — por isso a Parte C é inegociável.
