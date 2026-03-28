# Funcionalidades Existentes

## 1. Dashboard Financeiro

**Status:** Implementado

- Cards com metricas em tempo real:
  - Total de receitas
  - Total de despesas
  - Saldo atual
  - Pagamentos pendentes
  - Ordens de servico ativas
- Graficos interativos (Recharts):
  - Grafico de area (evolucao financeira)
  - Grafico de barra (comparativo)
  - Grafico de pizza (distribuicao por categoria)
- Ranking de receitas por categoria
- Filtros por periodo

## 2. Gestao de Transacoes

**Status:** Implementado

- CRUD completo (criar, listar, editar, excluir)
- Tipos: receita (income) e despesa (expense)
- Categorias configuraveis (5 de receita, 6 de despesa por padrao)
- Busca por descricao, categoria e valor
- Paginacao (20 itens por pagina)
- Status da transacao
- Rastreamento de quem criou/editou (createdBy/updatedBy)

## 3. Gestao de Clientes

**Status:** Implementado

- CRUD completo
- Campos: nome, sobrenome, apelido, CPF, empresa, telefone, observacao
- Limite de credito por cliente
- Busca por nome, apelido, telefone, empresa
- Paginacao
- Historico de pagamentos por cliente (`GET /customers/:id/payments`)
- Exclusao em cascata (remove pagamentos associados)
- Integracao com WhatsApp (modal de envio)

## 4. Pagamentos de Clientes (Contas a Receber/Pagar)

**Status:** Implementado

- CRUD completo com parcelas
- Tipos: receita (income) e despesa (expense)
- Status: pendente, parcial, pago
- Historico de pagamentos (JSON com data e valor de cada pagamento)
- Agrupamento por venda (saleId)
- Exclusao individual ou por grupo
- Metodos de pagamento configuraveis
- Geracao de recibos em HTML
- QR code PIX nos recibos
- Busca por nome do cliente, descricao, saleId
- Ordenacao por data de vencimento

## 5. Ordens de Servico

**Status:** Implementado

- CRUD completo
- Fluxo de status (7 status padrao com cores):
  1. Aguardando Analise (amarelo)
  2. Em Manutencao (azul)
  3. Urgente (rosa)
  4. Aguardando Pecas (laranja)
  5. Pronto para Retirada (verde)
  6. Concluido (cinza)
  7. Sem Conserto (vermelho)
- Status customizaveis (criar/excluir novos)
- Dados do equipamento: tipo, marca, modelo, cor, serial
- Foto do equipamento na chegada (base64)
- Problema relatado pelo cliente
- Analise tecnica pelo tecnico
- Sugestao de analise por IA (Google Gemini)
- Servicos realizados
- Pecas usadas (integrado ao estoque - deducao automatica)
- Valor do servico e valor total
- Observacoes finais
- Niveis de prioridade: baixa, media, alta, urgente
- Senha do equipamento do cliente
- Acessorios entregues
- Info de RAM e SSD
- Data de entrada e previsao de analise
- Contadores de status (aguardando, ativos, prontos, urgentes)
- Impressao de OS com layout configuravel
- **Pagina publica de status** (sem login):
  - Cliente informa ID da OS e primeiros 4 digitos do CPF
  - Ve: status, problema, analise, dados do equipamento

## 6. Controle de Estoque

**Status:** Implementado

- CRUD completo
- Categorias: produto e servico
- Campos: nome, SKU, preco de custo, preco de venda, quantidade, quantidade minima
- Alerta de estoque baixo (quantidade < minima)
- Deducao automatica ao usar pecas em OS
- Reconciliacao ao editar OS (devolve pecas antigas, deduz novas)
- Ordenacao por nome

## 7. Relatorios

**Status:** Implementado (basico)

- Graficos de resumo financeiro
- Baseado nos dados de transacoes e pagamentos
- Visualizacao por periodo

## 8. Configuracoes

**Status:** Implementado

### Dados da Empresa
- Nome da aplicacao
- Versao
- Nome do perfil e avatar
- CNPJ e endereco
- Ano fiscal

### Visual
- Cor primaria customizavel
- Tamanho da fonte (salvo no localStorage)
- Colunas visiveis/ocultas (hiddenColumns)
- Avisos (showWarnings)

### Categorias
- CRUD de categorias de receita e despesa
- Categorias usadas nas transacoes

### Equipamentos
- CRUD de tipos de equipamento (com icone)
- CRUD de marcas
- CRUD de modelos (vinculados a marcas)

### Recibos e Impressao
- Layout de recibo configuravel
- Logo do recibo
- Chave PIX
- QR code PIX

### Integracoes
- Template de cobranca WhatsApp
- Template de OS WhatsApp
- SendPulse (client ID, secret, template ID)
- Telegram (bot token, chat ID)

### Usuarios e Permissoes
- CRUD de usuarios (somente owner)
- 3 roles: owner, manager, employee
- 7 permissoes granulares
- Senha das configuracoes (protege acesso)

## 9. Auditoria

**Status:** Implementado

- Log automatico de todas as operacoes CRUD
- Campos: usuario, acao, entidade, ID da entidade, detalhes, timestamp
- Visualizador de logs (ultimos 100 registros)
- JOIN com tabela de usuarios (mostra username)

## 10. Seguranca

**Status:** Implementado

- Autenticacao JWT com Bearer token
- Senhas hasheadas com bcrypt (10 rounds)
- Auto-upgrade de senhas legadas em plaintext
- Rate limiting no login (10 tentativas / 15 minutos)
- Rate limiting geral na API (200 req / minuto)
- Controle de acesso por role e permissao
- Owner tem bypass automatico de permissoes
- Validacao de entrada com Zod em todos os endpoints
- Error handler global (nao expoe detalhes internos)
- CORS configuravel

## 11. UI/UX

**Status:** Implementado

- Tema escuro com efeitos glass-morphism e neon
- Animacoes com Framer Motion
- Notificacoes toast
- Modais para formularios e confirmacoes
- Sidebar de navegacao colapsavel
- Paginacao em listas grandes
- Busca em tempo real
- Responsivo (reducao de blur em mobile)
- Icones Lucide React
- Fonte Manrope (Google Fonts)
