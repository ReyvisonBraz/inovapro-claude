# Product Requirements Document (PRD) - FINANCEIRO INOVA

## 1. Visão Geral do Produto
O **FINANCEIRO INOVA** é um sistema de gestão financeira e operacional robusto, desenvolvido para pequenas e médias empresas (PMEs), com foco especial em assistências técnicas e comércios que necessitam de controle rigoroso de fluxo de caixa, ordens de serviço e relacionamento com clientes.

### 1.1 Objetivo
Centralizar a gestão financeira, operacional e de clientes em uma única plataforma moderna, rápida e segura, eliminando a dependência de planilhas e processos manuais.

---

## 2. Público-Alvo
- Proprietários de pequenas empresas.
- Gerentes financeiros.
- Técnicos e prestadores de serviços.

---

## 3. Funcionalidades Principais

### 3.1 Gestão Financeira (Transactions)
- Registro de entradas e saídas.
- Categorização detalhada de movimentações.
- Filtros avançados por data, tipo, categoria e valor.
- Paginação para alta performance com grandes volumes de dados.

### 3.2 Gestão de Clientes (CRM)
- Cadastro completo com CPF/CNPJ, telefone e observações.
- Definição de limite de crédito por cliente.
- Histórico de pagamentos e serviços vinculados.
- Verificação de similaridade para evitar cadastros duplicados.

### 3.3 Vendas e Contas a Receber (Client Payments)
- Registro de vendas parceladas com geração automática de parcelas.
- Controle de status (Pendente, Parcial, Pago).
- Histórico de recebimentos por lançamento.
- Envio de lembretes e comprovantes via WhatsApp.

### 3.4 Ordens de Serviço (OS)
- Fluxo completo: Entrada -> Análise -> Manutenção -> Entrega.
- Registro de fotos de entrada (Base64).
- Detalhamento técnico: Problema relatado, análise técnica, serviços e peças.
- Status customizáveis com cores e prioridades.
- Impressão de recibos em A4 ou Térmico.

### 3.5 Gestão de Estoque (Inventory)
- Controle de produtos e serviços.
- Alertas de estoque baixo.
- Vinculação de peças às Ordens de Serviço.

### 3.6 Dashboard e Relatórios
- Gráficos comparativos de Receita vs. Despesa.
- Ranking de categorias mais lucrativas/custosas.
- Indicadores de saúde financeira (Saldo Líquido, OS Ativas, Pagamentos Pendentes).
- Exportação de dados para relatórios externos.

---

## 4. Arquitetura e Organização do Código

### 4.1 Frontend (React + TypeScript)
Organizado de forma modular para facilitar a manutenção:
- **Pages:** Telas principais (Dashboard, Vendas, Clientes, etc.).
- **Components:** UI reutilizável (shadcn-like), Layout (Sidebar, Header) e Modais Globais.
- **Hooks:** Lógica de negócio e chamadas de API encapsuladas.
- **Store (Zustand):** Gerenciamento de estado global segmentado (Auth, App, Modais, Filtros).
- **Lib:** Utilitários de formatação, impressão e templates de recibos.

### 4.2 Backend (Node.js + Express)
- **BFF (Backend for Frontend):** Servidor leve que expõe APIs REST.
- **Validação:** Uso de **Zod** para garantir a integridade dos dados recebidos.
- **Banco de Dados:** SQLite (`better-sqlite3`) para persistência local rápida.
- **Segurança:** Sistema de autenticação JWT-like e Logs de Auditoria para todas as ações críticas.

---

## 5. Comunicação e Fluxo de Dados
1. **UI -> Hook:** O componente interage com um custom hook.
2. **Hook -> API:** O hook dispara uma requisição `fetch` para o backend.
3. **API -> DB:** O Express valida via Zod e executa a query no SQLite.
4. **DB -> API -> Hook:** A resposta retorna e o hook atualiza o estado global (Zustand).
5. **Hook -> UI:** O React re-renderiza apenas os componentes necessários.

---

## 6. Roadmap e Evolução
1. **Migração para Cloud:** Transição do SQLite para **Supabase (PostgreSQL)**.
2. **Autenticação Avançada:** Implementação de Supabase Auth e RLS (Row Level Security).
3. **Armazenamento de Mídia:** Uso de Supabase Storage para fotos de OS.
4. **Integrações:** Automação de notificações via WhatsApp API e e-mail.
5. **Mobile:** Desenvolvimento de App nativo ou PWA aprimorado.

---
**Versão:** 1.0.0
**Data:** Abril de 2026
