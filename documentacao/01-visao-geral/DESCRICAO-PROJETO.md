# Descricao do Projeto - FinanceFlow OS

## O Que E

O **FinanceFlow OS** e um sistema completo de gestao financeira e ordens de servico, desenvolvido para assistencias tecnicas, lojas de informatica e pequenas empresas de tecnologia.

O sistema unifica em uma unica plataforma:
- Controle financeiro (receitas e despesas)
- Gestao de clientes
- Contas a receber e a pagar
- Ordens de servico (OS) para manutencao de equipamentos
- Controle de estoque
- Relatorios e dashboards
- Auditoria de operacoes

## Publico-Alvo

- Assistencias tecnicas de informatica
- Lojas de informatica com servico de manutencao
- Pequenas empresas de TI
- Tecnicos autonomos

## Problema que Resolve

Muitas assistencias tecnicas usam planilhas, cadernos ou sistemas separados para controlar financas, clientes e ordens de servico. O FinanceFlow OS centraliza tudo em um sistema web moderno, acessivel de qualquer dispositivo.

## Funcionalidades Principais

### Financeiro
- Dashboard com metricas em tempo real (receitas, despesas, saldo)
- Graficos interativos (area, barra, pizza)
- Categorias de receita e despesa configuraveis
- Historico completo de transacoes

### Clientes
- Cadastro completo com CPF, telefone, empresa
- Limite de credito por cliente
- Historico de pagamentos e ordens de servico
- Integracao com WhatsApp para comunicacao

### Ordens de Servico
- Fluxo completo: entrada > analise > manutencao > entrega
- Registro de equipamento (tipo, marca, modelo, serial, cor)
- Foto do equipamento na chegada
- Analise tecnica com sugestao por IA (Google Gemini)
- Controle de pecas usadas (integrado ao estoque)
- 7 status configuraveis com cores
- Pagina publica para cliente acompanhar status via CPF
- Niveis de prioridade (baixa, media, alta, urgente)
- Impressao de OS com layout configuravel

### Pagamentos
- Contas a receber com parcelamento
- Historico de pagamentos por parcela
- Status: pendente, parcial, pago
- Geracao de recibos com QR code PIX
- Agrupamento por venda

### Estoque
- Produtos e servicos
- Controle de SKU
- Preco de custo e venda
- Alerta de estoque minimo
- Deducao automatica ao usar pecas em OS

### Configuracoes
- Personalizacao visual (cores, fontes, tema escuro)
- Dados da empresa (nome, CNPJ, endereco)
- Chave PIX e QR code para recibos
- Templates de WhatsApp e Telegram
- Categorias, marcas, modelos e tipos de equipamento
- Gerenciamento de usuarios e permissoes
- Logs de auditoria

## Diferenciais

- **Interface moderna** com tema escuro, efeitos glass e neon
- **Responsivo** para uso em desktop e mobile
- **Seguro** com JWT, bcrypt, rate limiting e auditoria
- **Offline-first** com banco SQLite local
- **IA integrada** para analise tecnica de equipamentos
- **Pagina publica** para clientes acompanharem OS sem login
