# Débitos Técnicos e Refatoração

Este documento rastreia arquivos grandes, gargalos de performance e áreas que necessitam de refatoração para melhorar a manutenibilidade do projeto.

## 🚨 Arquivos Críticos (Muito Grandes)

Os seguintes arquivos excederam o tamanho recomendado e devem ser desmembrados em componentes menores ou hooks:

1.  **`src/App.tsx` (~1820 linhas)**
    *   **Problema:** Centraliza muita lógica de estado, renderização de modais e roteamento.
    *   **Sugestão:** Mover a lógica de modais para componentes dedicados ou usar o `useModalStore` de forma mais agressiva. Extrair o roteamento para um componente de layout separado.
2.  **`src/components/ServiceOrders.tsx` (~1790 linhas)**
    *   **Problema:** Contém toda a lógica de listagem, filtros e o formulário gigante de OS.
    *   **Sugestão:** O formulário de criação/edição de OS deve ser um componente separado (`ServiceOrderForm.tsx`). A lógica de cálculo de valores e peças pode ser movida para um hook específico (`useServiceOrderForm`).
3.  **`src/types.ts` (~200 linhas)**
    *   **Problema:** Todas as interfaces estão em um único arquivo.
    *   **Sugestão:** Criar uma pasta `src/types/` e separar por domínio (ex: `customer.ts`, `service-order.ts`, `transaction.ts`).

## 🛠️ Oportunidades de Melhoria

*   **Validação de Formulários:** Atualmente a validação é manual e imperativa. Considerar o uso de **Zod** (já no package.json) com **React Hook Form** para uma abordagem mais declarativa e robusta.
*   **Abstração de API:** Criar uma camada de serviço (`src/services/api.ts`) para centralizar as chamadas `fetch`, facilitando a migração para outros backends (como Supabase) no futuro.
*   **Componentização da UI:** Alguns elementos repetitivos (como labels de formulários com ícones) podem ser transformados em componentes reutilizáveis no `src/components/ui`.

## 📈 Roadmap de Refatoração

- [ ] Fase 1: Extrair formulário de Ordem de Serviço de `ServiceOrders.tsx`.
- [ ] Fase 2: Desmembrar `App.tsx` movendo modais globais para um `ModalProvider`.
- [ ] Fase 3: Organizar `types.ts` em diretórios por domínio.
- [ ] Fase 4: Implementar React Hook Form + Zod nos formulários principais.
