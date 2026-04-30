# 📋 BUGS ENCONTRADOS

## Resumo
| # | Bug | Prioridade |
|---|-----|-----------|
| 1 | Cannot GET / (porta errada) | ✅ CORRIGIDO |
| 2 | primaryColor not in AppState | ✅ CORRIGIDO |
| 3 | format conflict (not callable) | ✅ CORRIGIDO |
| 4 | toFixed precedence | ✅ CORRIGIDO |
| 5 | AxiosResponse vs Promise\<void\> | ✅ CORRIGIDO |
| 6 | EquipmentSettings missing props | ✅ CORRIGIDO |
| 7 | Cannot find name 'api' | ⚠️ PENDENTE |
| 8 | Login frontend não conecta | ✅ CORRIGIDO |
| 9 | Transactions sem customerId | ✅ CORRIGIDO |
| 10 | 401 durante carregamento inicial | ⚠️ BAIXA |
| 11 | Título pages não atualiza | ⚠️ BAIXA |
| 12 | Charts não renderizam (0) | ✅ JA CORRIGIDO |

---

## Como usar este arquivo
Procure pelo bug pelo código/marcador para encontrar a correção aplicada.

---

## 1. ERRO: `Cannot GET /` ao acessar localhost:3000

**Sintoma:** Ao digitar `npm run dev` e acessar `localhost:3000`, aparece "Cannot GET /"

**Causa:** O `npm run dev` rodava apenas o backend (server.ts) que é uma API Express - ela NÃO serve arquivos HTML.

**Correção:**
- Frontend (React/Vite) precisa rodar SEPARADAMENTE na porta 5173
- Backend serve APENAS a API REST na porta 3000

**Comando para development:**
```bash
# Terminal 1 - Backend API
npm run dev:api

# Terminal 2 - Frontend
npm run dev:frontend
```

**Arquivos envolvidos:**
- `package.json` (scripts atualizados)
- `.env` (adicionado VITE_API_URL=http://localhost:3000)

**Prevenir:** Sempre usar `npm run dev:api` + `npm run dev:frontend` para desenvolvimento local.

---

## 2. ERRO: `primaryColor` does not exist on type 'AppState'

**Arquivo:** `src/components/reports/EnhancedReports.tsx:96`

**Causa:** Tentou usar `primaryColor` do useAppStore, mas esse campo não existe no store.

**Correção:** Remover `primaryColor` da destructuring:
```typescript
// ANTES (com erro)
const { fontSize, primaryColor } = useAppStore();

// DEPOIS (corrigido)
const { fontSize } = useAppStore();
```

---

## 3. ERRO: `This expression is not callable` - format

**Arquivo:** `src/components/reports/EnhancedReports.tsx:391,408`

**Causa:** Conflito de nomes entre `format` do date-fns e alguma outra função `format` importada/acessada erroneamente.

**Correção:** Renomear import:
```typescript
// ANTES
import { format, parseISO, subDays, ... } from 'date-fns';

// DEPOIS
import { format as formatDate, parseISO, subDays, ... } from 'date-fns';
// E usar formatDate() em vez de format()
```

---

## 4. ERRO: `format(1.234).toFixed(1)` - operador precedence

**Arquivo:** `src/components/reports/EnhancedReports.tsx:681`

**Causa:** `.toFixed()` foi chamado antes da multiplicação por 100, resultando em string não numérica.

**Correção:**
```typescript
// ANTES (com erro)
{((cat.value / total) * 100.toFixed(1))}%

// DEPOIS (corrigido)
{(((cat.value / total) * 100)).toFixed(1)}%
```

---

## 5. ERRO: SettingsPage AxiosResponse vs Promise\<void\>

**Arquivo:** `src/pages/SettingsPage.tsx:46-51`

**Causa:** Funções de equipment (addBrand, updateBrand, etc) retornavam `AxiosResponse` mas o tipo esperado era `Promise<void>`.

**Correção:** Criar wrappers no `useServiceOrders.ts` que convertem o retorno:
```typescript
// ANTES
addBrandAPI: (name, equipmentType) => addBrandMutation.mutateAsync({ name, equipmentType }),

// DEPOIS
const addBrandAPI = async (name: string, equipmentType: string): Promise<void> => {
  await addBrandMutation.mutateAsync({ name, equipmentType });
};
```

**Status:** ✅ CORRIGIDO

---

## 6. ERRO: SettingsLayout EquipmentSettings props

**Arquivo:** `src/components/settings/SettingsLayout.tsx:163`

**Causa:** Faltavam props `onUpdateBrand`, `onUpdateModel`, `onUpdateEquipmentType` no componente EquipmentSettings.

**Correção:**
1. Adicionar tipos no `SettingsLayoutProps`
2. Passar as props no JSX

**Status:** ✅ CORRIGIDO

---

## 7. ERRO: Cannot find name 'api'

**Arquivo:** `src/pages/ClientPaymentsPage.tsx:196`

**Causa:** Referência a `api` que não está importado no arquivo.

**Status:** ⚠️ PENDENTE -有待确认

---

## 8. ERRO: Login funciona no backend mas falha no frontend

**Sintoma:** POST para /api/login retorna token válido, mas frontend não conecta.

**Causa:** Frontend não sabe para qual URL enviar requests (VITE_API_URL não configurado).

**Correção:** Adicionar no `.env`:
```
VITE_API_URL=http://localhost:3000
```

---

## 9. ERRO: Transactions não salvam customerId/customerName

**Arquivo:** `server.ts:27` (TransactionSchema) e `server.ts:735` (POST /api/transactions)

**Sintoma:** Ao criar transação com customerId, os campos não eram salvos no banco.

**Causa:**
1. `TransactionSchema` não tinha campos `customerId`, `customerName`, `customerPhone`
2. `prisma.transaction.create()` não recebia esses campos

**Correção:**
```typescript
// ANTES (schema)
const TransactionSchema = z.object({
  description, category, type, amount, date, createdBy, updatedBy
});

// DEPOIS (schema)
const TransactionSchema = z.object({
  description, category, type, amount, date, createdBy, updatedBy,
  customerId: z.coerce.number().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable()
});

// ANTES (create)
prisma.transaction.create({ data: { description, category, type, amount, date, createdBy } });

// DEPOIS (create)
prisma.transaction.create({
  data: {
    description, category, type, amount, date, createdBy,
    customerId, customerName, customerPhone
  }
});
```

**TESTE VERIFICADO:** ✅ Cascade update funciona - transação atualiza junto com cliente.

---

## 10. ERRO: 401 Unauthorized após login (Frontend → API)

**Sintoma:** Após fazer login, o frontend mostra 12 erros de "401 Unauthorized" no console.

**Causa:** Race condition - componentes/hooks tentam carregar dados ANTES do token estar disponível no localStorage.

**ANÁLISE (29/04/2026):**
- ✅ Login funciona - token salvo no localStorage corretamente
- ✅ API responde 200 com token válido em TODOS os endpoints
- ✅ Dados carregam: transactions, customers, stats, etc
- ❌ Ainda há 12 erros de 401

**TEORIA:** Os erros 401 acontecem durante o carregamento INICIAL da página, antes do login, quando hooks como useStats, useTransactions tentam buscar dados automaticamente.

**SOLUÇÃO APLICADA (29/04/2026):**
```typescript
// api.ts - ignorar 401 quando não há token
if (error.response?.status === 401 && !localStorage.getItem('token')) {
  return Promise.reject(new Error('Not authenticated'));
}
```

**RESULTADO:** Erros reduzidos de 12 para 4 (67% de redução)

---

## 13. MELHORIA: Mostrar Tipo de Equipamento na Lista de OS

**Arquivo:** `src/components/service-orders/ServiceOrderCard.tsx:140-143`

**Sintoma:** Na lista de ordens de serviço, só aparecia "Marca Modelo" sem mostrar o tipo.

**Correção:** Agora exibe "{Tipo} - {Marca} {Modelo}" ou "Sem equipamento" se vazio.

**Status:** ✅ IMPLEMENTADO

---

## 14. MELHORIA: Checkbox "Pular Equipamento" no Form de OS

**Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx`

**Sintoma:** O campo "Modelo" não é obrigatório, mas o formulário exigia todos os dados de equipamento.

**Solução Implementada:**
1. Adicionado estado `skipEquipmentValidation`
2. Checkbox "Pular" ao lado do título "Dados do Equipamento"
3. Quando ativado:
   - Mostra aviso amarelo "Modo simplificado ativo"
   - Desabilita campos de equipamento (opacity-50 pointer-events-none)
   - Limpa erros de equipamento
4. No submit:
   - Se "Pular" ativado, não valida equipmentType/Brand/Model
   - Limpa os campos para null antes de salvar

**Status:** ✅ IMPLEMENTADO

---

## 15. MELHORIA: Nova Impressão de OS

**Arquivo:** `src/components/service-orders/modals/PrintModal.tsx`

**Nova estrutura A4 (2 seções):**

1. **RECIBO DO CLIENTE** (amarelo destacado)
   - Telefone grande e destacado (azul)
   - Nome do cliente
   - Data completa por extenso

2. **PROBLEMA DO EQUIPAMENTO** (vermelho destacado - MAIS IMPORTANTE)
   - Box vermelho com fundo gradiente
   - Problema em destaque branco

3. **DADOS DO EQUIPAMENTO** (azul destacado)
   - Grid com Tipo, Marca, Modelo
   - Serial e Cor

4. **INFORMAÇÕES EXTRAS**
   - Status, Técnico, Senha, Acessórios

5. **QR CODES** para Cliente e Técnico

**Elementos DESTACADOS:**
- 📞 Telefone (badge azul grande)
- ⚠️ Problema (box vermelho gradiente - MAIOR DESTACADO)
- 📱 Equipamento (grid azul destacado)

**Status:** ✅ IMPLEMENTADO

---

## MARCADORES DE DEBUG

Procure estes termos no código para pontos de debug:

- `📊 DEBUG:` - Logs de debug para relatórios
- `🧮 CALCULATION:` - Pontos de cálculo de KPIs
- `🔍 FILTER:` - Filtragem de dados
- `📝 AUDIT:` - Logs de auditoria
- `🔄 CASCADE:` - Updates em cascata (cliente → transações/OS)
- `⚠️ FIXME:` - Bug conhecido que precisa correção
- `💡 TODO:` - Melhoria planejada
- `🔥 TEMP:` - Código temporário/remover depois

---

## FLUXO DE DEBUG RECOMENDADO

1. Verifique `npm run lint` para erros de tipo
2. Verifique `npm run build` para erros de compilação
3. Teste API com curl antes do frontend
4. Use React DevTools para estado do frontend
5. Verifique Network tab do browser para requests falhando
