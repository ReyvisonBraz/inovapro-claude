# CHECKLIST DE EXECUÇÃO

## Como usar este arquivo

Marque cada item com `[x]` quando concluído e `[FAILED]` se falhou.

---

## FASE 0: Preparação e Backup

### 0.1 - Estrutura de Pastas
- [ ] Pasta `backups/` criada
- [ ] Pasta `scripts/` criada
- [ ] Pasta `src.refactor/` criada

### 0.2 - Backup
- [ ] Backup de `finance.db` criado
- [ ] Backup de `server.ts` criado
- [ ] Backup de `src/` criado

### 0.3 - Verificação Inicial
- [ ] `npm install` sem erros
- [ ] `npm run lint` retorna 0 errors
- [ ] `npm run dev` inicia corretamente

**FASE 0 CONCLUÍDA EM:** __/__/____

---

## FASE 1: Segurança Fundamental

### 1.1 - Correção de Senhas
- [ ] bcryptjs e jsonwebtoken instalados
- [ ] Script `migratePasswords.ts` criado
- [ ] Script testado e executado
- [ ] Login funciona pós-migração
- [ ] Senhas no DB são hashes

### 1.2 - Autenticação JWT
- [ ] `auth.ts` middleware criado
- [ ] `roles.ts` middleware criado
- [ ] `/api/auth/me` implementado
- [ ] `/api/auth/change-password` implementado
- [ ] `/api/auth/logout` implementado
- [ ] Todos endpoints protegidos

### 1.3 - Autorização
- [ ] Tabela de permissões definida
- [ ] Employee: CREATE/transactions ✅, DELETE/transactions ❌
- [ ] Employee: CREATE/OS ✅, DELETE/OS ❌
- [ ] Manager: DELETE/transactions ✅
- [ ] Manager: DELETE/users ❌
- [ ] Manager: READ/audit ✅
- [ ] Owner: ALL ✅

### 1.4 - SQL Injection
- [ ] Whitelist de colunas implementada
- [ ] ORDER BY validado
- [ ] Teste de SQL injection passa

### 1.5 - CORS
- [ ] CORS configurado
- [ ] Testado com frontend

### 1.6 - Rate Limiting
- [ ] express-rate-limit instalado
- [ ] Login limiter (5/min) implementado
- [ ] API limiter (100/min) implementado
- [ ] Testado: 6 login rápido = blocked

### 1.7 - Variáveis de Ambiente
- [ ] `.env` criado
- [ ] JWT_SECRET definido
- [ ] FRONTEND_URL definido

**FASE 1 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 2: Qualidade de Código

### 2.1 - Unificação da API
- [ ] `src/services/api.ts` removido
- [ ] `useClientPayments` migrado para axios
- [ ] Interceptor de token funcionando
- [ ] Interceptor de 401 funcionando

### 2.2 - ServiceOrderForm
- [ ] `ServiceOrderBasicInfo.tsx` criado
- [ ] `ServiceOrderTechnical.tsx` criado
- [ ] `ServiceOrderPartsServices.tsx` criado
- [ ] `ServiceOrderFinancial.tsx` criado
- [ ] `ServiceOrderPhotos.tsx` criado
- [ ] `ServiceOrderAccessories.tsx` criado
- [ ] `ServiceOrderForm.tsx` refatorado
- [ ] Funcionalidade mantida

### 2.3 - Memoização
- [ ] `TransactionList` com React.memo
- [ ] `CustomerList` com React.memo
- [ ] `ServiceOrderList` com React.memo
- [ ] `InventoryList` com React.memo (se existir)

### 2.4 - Schemas Zod
- [ ] `inventorySchema` criado
- [ ] `settingsSchema` criado
- [ ] `brandSchema` criado
- [ ] `modelSchema` criado
- [ ] `equipmentTypeSchema` criado
- [ ] `npm run lint` passa

### 2.5 - Error Handling
- [ ] ErrorBoundary criado
- [ ] ErrorBoundary em App.tsx
- [ ] Toast para erros de rede

**FASE 2 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 3: Banco de Dados

### 3.1 - Prisma Schema
- [ ] provider = "sqlite"
- [ ] paymentId em Transaction
- [ ] saleId em Transaction
- [ ] saleId em ClientPayment
- [ ] services em ServiceOrder
- [ ] createdBy/updatedBy relations
- [ ] `npx prisma validate` passa

### 3.2 - Dados
- [ ] Cliente de teste removido
- [ ] CPF inválido removido

### 3.3 - Documentação
- [ ] `docs/DATABASE.md` criado

**FASE 3 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 4: Frontend

### 4.1 - Exportação
- [ ] `exportToCSV` função criada
- [ ] Exportar transações funciona
- [ ] Exportar clientes funciona

### 4.2 - Alertas de Estoque
- [ ] `/api/inventory/alerts` implementado
- [ ] Badge no header funciona
- [ ] Contagem correta

### 4.3 - Notificações
- [ ] `/api/notifications` implementado
- [ ] NotificationCenter criado
- [ ] Auto-refresh funcionando

**FASE 4 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 5: Integrações

### 5.1 - SendPulse/WhatsApp
- [ ] Decisão tomada: IMPLEMENTAR / REMOVER
- [ ] Se implementar: código funcional
- [ ] Se remover: dependências removidas

### 5.2 - Gemini AI
- [ ] Decisão tomada: IMPLEMENTAR / REMOVER
- [ ] Se implementar: feature funcional
- [ ] Se remover: dependência removida

**FASE 5 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 6: Testes

### 6.1 - Autenticação
- [ ] Login correto → token
- [ ] Login incorreto → 401
- [ ] Rate limit funciona
- [ ] Logout funciona
- [ ] Change password funciona
- [ ] Token expirado → 401

### 6.2 - Autorização
- [ ] Employee: CREATE ✅
- [ ] Employee: DELETE ❌ (403)
- [ ] Manager: DELETE ✅
- [ ] Manager: DELETE User ❌ (403)
- [ ] Owner: ALL ✅

### 6.3 - Segurança
- [ ] Sem token → 401
- [ ] SQL injection → prevenido
- [ ] XSS → sanitizado

### 6.4 - Funcionalidades
- [ ] CRUD Customers
- [ ] CRUD Transactions
- [ ] CRUD Service Orders
- [ ] CRUD Inventory
- [ ] Pagamentos → transações
- [ ] OS com peças → estoque

### 6.5 - Performance
- [ ] Navegação fluida
- [ ] Sem lag em listas grandes
- [ ] Sem memory leaks

**FASE 6 CONCLUÍDA EM:** __/__/____
**VERIFICADO POR:** ________________

---

## FASE 7: Documentação

- [ ] ARCHITECTURE.md atualizado
- [ ] DEVELOPER_GUIDE.md atualizado
- [ ] docs/CHANGELOG.md criado
- [ ] docs/DECISIONS.md criado

**FASE 7 CONCLUÍDA EM:** __/__/____

---

## RESULTADO FINAL

| Métrica | Valor |
|---------|-------|
| Total de itens | TBD |
| Concluídos | TBD |
| Falhados | TBD |
| Taxa de sucesso | TBD% |
| Início | __/__/____ |
| Término | __/__/____ |
| Tempo total | TBD horas |

---

## NOTAS

### Problemas Encontrados
_____________________________________________
_____________________________________________
_____________________________________________

### Soluções Aplicadas
_____________________________________________
_____________________________________________
_____________________________________________

### Lições Aprendidas
_____________________________________________
_____________________________________________
_____________________________________________
