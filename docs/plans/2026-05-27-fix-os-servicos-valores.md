# Plano: Correção de Serviços, Peças e Valores no Formulário de OS

**Data:** 27/05/2026  
**Status:** Concluído

---

## Diagnóstico

### Bug Crítico — Auto-cálculo sobrescreve valores manuais dos campos "Mão de Obra" e "Valor Total"
- **Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx` linhas 180-188
- **Causa:** O `useEffect` recalcula `serviceFee` e `totalAmount` a partir da soma de `services[]` e `partsUsed[]` e chama `setValue` **toda vez** que esses arrays mudam. Isso sobrescreve qualquer valor digitado manualmente pelo técnico.
- **Efeito colateral:** Ao abrir uma OS existente com `serviceFee: 150` mas `services[]` vazio, o total é zerado.

### Bug — Falta de feedback ao salvar / modal fecha mesmo com erro
- **Arquivo:** `ServiceOrderForm.tsx` linha 303-396 (`onFormSubmit`)
- **Causa:** Botão "Salvar Alterações" não tem estado de `loading` e não desabilita. Erros de validação (equipamento obrigatório) mostram toast mas ficam atrás do modal. Em caso de erro do `onUpdateOrder`, o modal permanece aberto, mas o usuário não tem indicação clara.

### Melhoria — ProductModal não mostra item cadastrado imediatamente
- **Arquivo:** `ServicesAndPartsSection.tsx` linha 289-320
- **Causa:** Após cadastrar novo serviço/produto via ProductModal, a lista do search só atualiza quando o React Query faz o refetch assíncrono. O item novo não aparece como selecionável imediatamente.

### Melhoria — Fechamento e Valores só visível em modo edição
- **Arquivo:** `ServiceOrderForm.tsx` linha 475
- **Causa:** A seção `ClosingSection` está condicionada a `{editingOrder && ...}`, impedindo o técnico de preencher valores na hora de **criar** uma OS.

---

## Etapas

### Etapa 1 — Adicionar `isSaving` state ao ServiceOrderForm [status: done]
**Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx`

- [x] Adicionar `const [isSaving, setIsSaving] = useState(false);`
- [x] No `onFormSubmit`: setar `true` no início, `false` no `finally`
- [x] Botão "Salvar Alterações": desabilitar (`disabled={isSaving}`), mostrar spinner (`"Salvando..."`) durante o save
- [x] Em caso de erro (`!success`), NÃO resetar nem fechar — manter modal aberto para correção

### Etapa 2 — Corrigir auto-cálculo para não sobrescrever manual [status: done]
**Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx`

- [x] Adicionar `useRef<boolean> manuallyEditedFee = useRef(false);`
- [x] Nos inputs `serviceFee` e `totalAmount` do ClosingSection, adicionar `onChange` que seta `manuallyEditedFee.current = true`
- [x] Na auto-calculação (`useEffect` linha 180): só executar `setValue` se `manuallyEditedFee.current === false`
- [x] Resetar `manuallyEditedFee.current = false` quando `editingOrder` mudar (nova OS carregada)

### Etapa 3 — Mostrar Fechamento e Valores sempre [status: done]
**Arquivo:** `src/components/service-orders/ServiceOrderForm.tsx`

- [x] Remover condicional `{editingOrder && (` que envolve a seção de Fechamento
- [x] Manter QR Code condicionado a `editingOrder` (só quando OS já tem ID)
- [x] Campos `servicesPerformed`, `serviceFee`, `totalAmount`, `finalObservations` visíveis tanto em criar quanto editar

### Etapa 4 — Melhorar ProductModal (item aparece imediatamente) [status: done]
**Arquivo:** `src/components/service-orders/form-sections/ServicesAndPartsSection.tsx`

- [x] Após `saveInventoryItemAPI.then()`: adicionar item ao form, fechar ProductModal, **fechar o search dropdown** e limpar campo de busca
- [x] Adicionar toast de confirmação: "Produto/Serviço adicionado à OS com sucesso!"

### Etapa 5 — Verificação final (lint, typecheck) [status: done]
- [x] Rodar `npx tsc --noEmit` — passou sem erros

---

## Log de Mudanças
| Hora | Etapa | Arquivo | Mudança |
|------|-------|---------|---------|
| 18:21 | 1 | `ServiceOrderForm.tsx` | Adicionado `isSaving` state; botão mostra spinner e desabilita; erros mantém modal aberto |
| 18:22 | 2 | `ServiceOrderForm.tsx` | Adicionado `manuallyEditedFee` useRef; auto-cálculo só roda se flag false; inputs com `onChange` wrapper |
| 18:23 | 3 | `ServiceOrderForm.tsx` | Removido condicional `editingOrder` da seção de fechamento; QR Code condicionado separadamente |
| 18:24 | 4 | `ServicesAndPartsSection.tsx` | ProductModal: fecha dropdown + limpa busca + toast de confirmação após cadastro |
| 18:25 | 5 | (verificação) | `npx tsc --noEmit` passou sem erros |
