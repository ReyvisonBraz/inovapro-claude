# Glossario

## Termos do Dominio

| Termo | Significado |
|-------|-------------|
| OS | Ordem de Servico - registro de manutencao/reparo de equipamento |
| Receita | Transacao de entrada de dinheiro (income) |
| Despesa | Transacao de saida de dinheiro (expense) |
| Parcela | Divisao de um pagamento em partes (installment) |
| Fiado | Credito concedido ao cliente para pagamento posterior |
| PIX | Sistema de pagamento instantaneo brasileiro |
| CNPJ | Cadastro Nacional de Pessoa Juridica |
| CPF | Cadastro de Pessoa Fisica |
| Contas a Receber | Valores que clientes devem pagar (accounts receivable) |
| Contas a Pagar | Valores que a empresa deve pagar (accounts payable) |
| Saldo | Diferenca entre receitas e despesas (balance) |
| SKU | Stock Keeping Unit - codigo unico de produto no estoque |

## Termos Tecnicos

| Termo | Significado |
|-------|-------------|
| JWT | JSON Web Token - padrao de autenticacao via token |
| Bearer Token | Token enviado no header Authorization das requisicoes |
| WAL Mode | Write-Ahead Logging - modo do SQLite para leituras concorrentes |
| Rate Limiting | Limitacao de requisicoes para prevenir abuso |
| Middleware | Funcao intermediaria que processa requisicoes antes das rotas |
| Seed | Dados iniciais inseridos no banco ao criar as tabelas |
| CRUD | Create, Read, Update, Delete - operacoes basicas de dados |
| SPA | Single Page Application - aplicacao de pagina unica |
| HMR | Hot Module Replacement - atualizacao em tempo real no desenvolvimento |
| Glass-morphism | Estilo visual com efeito de vidro translucido |
| Neon | Efeito visual de brilho/luminosidade nas bordas e textos |

## Roles (Papeis de Usuario)

| Role | Descricao |
|------|-----------|
| Owner | Dono do sistema - acesso total, todas as permissoes automaticamente |
| Manager | Gerente - permissoes configuraveis por administrador |
| Employee | Funcionario - permissoes limitadas configuraveis |

## Status de Ordem de Servico

| Status | Cor | Significado |
|--------|-----|-------------|
| Aguardando Analise | Amarelo (#f59e0b) | Equipamento recebido, aguardando diagnostico |
| Em Manutencao | Azul (#3b82f6) | Reparo em andamento |
| Urgente | Rosa (#f43f5e) | Prioridade maxima |
| Aguardando Pecas | Laranja (#f97316) | Esperando pecas para continuar |
| Pronto para Retirada | Verde (#10b981) | Servico concluido, cliente pode buscar |
| Concluido | Cinza (#64748b) | Equipamento entregue ao cliente |
| Sem Conserto | Vermelho (#ef4444) | Equipamento sem possibilidade de reparo |

## Status de Pagamento

| Status | Significado |
|--------|-------------|
| pending | Pagamento pendente - nenhum valor recebido |
| partial | Pagamento parcial - parte do valor recebido |
| paid | Pagamento completo - valor total recebido |
