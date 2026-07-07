# Fase 5 · Tarefa 02 — Expurgar resíduo de SQLite (M8)

**Goal:** Remover todo vestígio do banco antigo (SQLite), que hoje engana quem lê o projeto e carrega peso morto: `better-sqlite3` em `dependencies`, `DB_PATH=.../finance.db` no `render.yaml`, `mkdir data` e comentários "caso SQLite" no `Dockerfile`, e `*.db`/`data/` no gitignore por precaução.

**Architecture:** Busca-e-remove guiada. `better-sqlite3` é uma dependência nativa pesada e não usada (o backend é PostgreSQL via Prisma). Confirmamos que nada importa SQLite antes de remover.

## Interfaces

- **Produz:** `package.json` sem `better-sqlite3`; `Dockerfile`/`render.yaml` sem SQLite; scripts de migração antigos avaliados.

---

- [ ] **Step 1: Provar que SQLite não é usado no código de runtime**

Run:
```powershell
npm run lint 2>&1 | Out-Null   # garante build atual
```
Busque por usos (editor ou grep): `better-sqlite3`, `sqlite`, `finance.db`, `DB_PATH` em `src/`, `server.ts`, `prisma/`. Esperado: nenhum uso em código de runtime. (Pode haver em `scripts/` de migração histórica — tratado no Step 4.)

- [ ] **Step 2: Remover `better-sqlite3` das dependências**

Run:
```powershell
npm uninstall better-sqlite3
```
Rode `npm run verify`. Esperado: nada quebra (não era importado).

- [ ] **Step 3: Limpar o `Dockerfile`**

Remova as linhas relativas a SQLite:
- `RUN mkdir -p /app/data` e o comentário `# Diretório para dados SQLite (caso necessário)`.
- Qualquer menção a `data/` que só existia para SQLite.
> Mantenha o resto (multi-stage, `prisma generate`, `migrate deploy`).

- [ ] **Step 4: Avaliar `render.yaml`**

Se a Opção A (Render) foi escolhida na Tarefa 01, remova `DB_PATH` e demais env de SQLite (já previsto lá). Se `render.yaml` foi removido (Opção B), ignore este passo.

- [ ] **Step 5: Avaliar scripts históricos de migração**

`scripts/` tem migradores de dados antigos (`import-from-railway.js`, `import-to-supabase.js`, `migrate-server.cjs`, `migratePasswords.ts`, `migrate-json-fields.ts`). Eles serviram à migração para Postgres e provavelmente são one-shot concluídos. Opções:
- Se concluídos: mova-os para `scripts/_arquivo/` com um `README.md` explicando que são históricos, **ou** remova-os.
- Não os deixe sugerindo um fluxo SQLite ativo.

- [ ] **Step 6: Ajustar o `.gitignore`**

`*.db` e `data/` podem permanecer (defensivos), mas adicione um comentário deixando claro que SQLite foi descontinuado, para não confundir:
```
# (SQLite descontinuado — banco atual é PostgreSQL via Prisma)
*.db
```

- [ ] **Step 7: Gate**

Run:
```powershell
npm run verify
```
Esperado: verde; `package-lock.json` sem `better-sqlite3`.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m @'
chore(cleanup): remove residuo de SQLite (better-sqlite3, DB_PATH, Dockerfile)

- backend e PostgreSQL via Prisma; SQLite era peso morto
- scripts historicos de migracao arquivados

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `better-sqlite3` fora de `package.json`/`package-lock.json`.
- [ ] Sem `finance.db`/`DB_PATH`/`mkdir data` em configs de deploy.
- [ ] Scripts históricos arquivados ou removidos.
- [ ] `npm run verify` verde.
