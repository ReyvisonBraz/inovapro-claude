# Próximos Passos (Plano de Consolidação e Solidez)

Após as refatorações iniciais, o foco agora é tornar a base de código "production-ready", utilizando padrões de mercado e bibliotecas validadas.

## 1. Padronização da Camada de Dados (Alta Prioridade)
*   **Objetivo:** Eliminar `useEffect` para fetching e gerenciar cache/estados de erro de forma robusta.
*   **Ação:** Instalar e configurar **TanStack Query (React Query)**. Criar um cliente de API centralizado em `src/lib/api.ts`.
*   **Benefício:** Cache automático, refetching inteligente, estados de loading/error padronizados e código mais declarativo.

## 2. Robustez em Formulários e Validação (Alta Prioridade)
*   **Objetivo:** Substituir o gerenciamento manual de estado de formulários por uma solução performática e tipada.
*   **Ação:** Implementar **React Hook Form** integrado com **Zod** para validação de esquemas.
*   **Benefício:** Validação complexa simplificada, melhor performance (menos re-renders) e total segurança de tipos do formulário ao backend.

## 3. Padronização de UI com shadcn/ui (Médio Prazo)
*   **Objetivo:** Usar componentes de UI acessíveis e testados em vez de implementações customizadas ad-hoc.
*   **Ação:** Inicializar o **shadcn/ui** e começar a substituir componentes como `Button`, `Input`, `Select` e `Dialog`.
*   **Benefício:** Consistência visual, acessibilidade (A11y) nativa e facilidade de manutenção.

## 4. Centralização de Serviços e Hooks (Contínuo)
*   **Objetivo:** Evitar duplicação de lógica de negócio.
*   **Ação:** Mover lógicas complexas de dentro dos componentes para hooks especializados ou arquivos de serviço (ex: `src/services/`).
*   **Benefício:** Código mais limpo, testável e reutilizável.

## 5. Testes Automatizados (Longo Prazo)
*   **Objetivo:** Garantir que novas funcionalidades não quebrem o que já funciona.
*   **Ação:** Configurar Vitest para testes unitários de hooks e serviços.
*   **Benefício:** Segurança em refatorações e redução de bugs em produção.

---

**Status Atual:**
*   [x] Refatoração de Componentes (Concluído)
*   [x] Centralização de Modais Globais (Concluído)
*   [x] Error Boundaries e Lazy Loading (Concluído)
*   [x] Debounce para Buscas (Concluído)
*   [x] Centralização de Recibos (Concluído)
*   [ ] Configuração do TanStack Query (Pendente)
*   [ ] Migração de Formulários para React Hook Form + Zod (Pendente)
*   [ ] Inicialização do shadcn/ui (Pendente)
