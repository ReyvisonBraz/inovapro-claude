# GUIA RÁPIDO DE EXECUÇÃO

## Para iniciar a correção:

### 1. Faça backup manual
```bash
# No diretório do projeto
mkdir -p backups/$(date +%Y-%m-%d)
cp finance.db backups/$(date +%Y-%m-%d)/
cp server.ts backups/$(date +%Y-%m-%d)/
cp -r src backups/$(date +%Y-%m-%d)/src
```

### 2. Leia o plano completo
```bash
cat IMPLEMENTAÇÃO/IMPLEMENTATION_PLAN.md
```

### 3. Execute fase por fase
```bash
# FASE 0: Verificar
npm run lint

# FASE 1: Segurança
# ... siga o plano

# Ao final de cada fase:
npm run lint && echo "OK"
```

### 4. Marque no checklist
```bash
# Edite IMPLEMENTAÇÃO/CHECKLIST.md
```

---

## Dúvidas Frequentes

### "O que fazer se algo falhar?"
1. Pare imediatamente
2. Não avance para próxima fase
3. Volte ao checkpoint anterior
4. Leia o erro com cuidado
5. Consulte o plano para possíveis causas
6. Corrija e teste novamente

### "Posso pular uma fase?"
**NÃO.** Cada fase depende da anterior.

### "Posso fazer fases em paralelo?"
**NÃO.** Execute sequencialmente para garantir que cada passo está funcionando.

### "Quanto tempo tenho para completar?"
Não há pressa. É melhor demorar mais e fazer certo do que apressar e errar.

---

## Comandos Úteis

```bash
# Verificar se lint passa
npm run lint

# Verificar se projeto inicia
npm run dev

# Ver banco de dados
sqlite3 finance.db ".tables"

# Ver usuários
sqlite3 finance.db "SELECT id, username, role FROM users"

# Verificar senhas (DEV)
sqlite3 finance.db "SELECT username, password FROM users"
# Se começar com $2 = hash bcrypt (OK)
# Se texto plano = VULNERÁVEL
```

---

## Contato/Emergência

Se algo muito errado acontecer:
1. Restaurar backup: `cp backups/YYYY-MM-DD/finance.db ./`
2. Restaurar server.ts: `cp backups/YYYY-MM-DD/server.ts ./`
3. Restaurar src/: `cp -r backups/YYYY-MM-DD/src ./`

---

*Este é um guia resumido. Para detalhes, consulte IMPLEMENTATION_PLAN.md*
