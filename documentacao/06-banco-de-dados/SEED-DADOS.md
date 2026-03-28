# Dados Iniciais (Seed)

## Arquivo: server/seed.ts

A funcao `initializeDatabase()` cria tabelas e insere dados padrao na primeira execucao.

---

## Usuario Padrao

| Campo | Valor |
|-------|-------|
| username | admin |
| password | admin (hasheado com bcrypt) |
| role | owner |
| name | Administrador |
| permissions | (todas - owner tem bypass) |

**ATENCAO:** Trocar senha antes de ir para producao!

---

## Categorias de Receita

| Nome |
|------|
| Salario |
| Vendas |
| Servicos |
| Investimentos |
| Outros |

## Categorias de Despesa

| Nome |
|------|
| Alimentacao |
| Trabalho |
| Utilidades |
| Viagem |
| Lazer |
| Outros |

---

## Status de Ordem de Servico

| Nome | Cor | Prioridade | Padrao |
|------|-----|------------|--------|
| Aguardando Analise | #f59e0b (amarelo) | 1 | Sim |
| Em Manutencao | #3b82f6 (azul) | 2 | Sim |
| Urgente | #f43f5e (rosa) | 3 | Sim |
| Aguardando Pecas | #f97316 (laranja) | 4 | Sim |
| Pronto para Retirada | #10b981 (verde) | 5 | Sim |
| Concluido | #64748b (cinza) | 6 | Sim |
| Sem Conserto | #ef4444 (vermelho) | 7 | Sim |

Status marcados como padrao (isDefault=1) nao podem ser excluidos.

---

## Tipos de Equipamento

| Nome |
|------|
| Notebook |
| Desktop |
| Smartphone |
| Tablet |
| Monitor |
| Impressora |
| Console |

---

## Configuracoes Padrao (settings id=1)

| Campo | Valor Padrao |
|-------|-------------|
| appName | FinanceFlow OS |
| appVersion | 1.0.0 |
| primaryColor | #1152d4 |
| initialBalance | 0 |
| showWarnings | 1 (ativo) |
| settingsPassword | 1234 |

**ATENCAO:** A senha padrao das configuracoes e "1234" - trocar antes de producao!

---

## Transacoes Exemplo

5 transacoes de exemplo sao inseridas para demonstracao:

| Descricao | Categoria | Tipo | Valor |
|-----------|-----------|------|-------|
| (exemplos variados de receita e despesa) | Variadas | income/expense | Variados |

---

## Migrations Inline

O seed.ts tambem executa migrations para adicionar colunas novas em tabelas existentes:

```sql
-- Exemplos de migrations executadas:
ALTER TABLE service_orders ADD COLUMN arrivalPhotoBase64 TEXT;
ALTER TABLE service_orders ADD COLUMN services TEXT;
ALTER TABLE service_orders ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE service_orders ADD COLUMN accessories TEXT;
ALTER TABLE service_orders ADD COLUMN ramInfo TEXT;
ALTER TABLE service_orders ADD COLUMN ssdInfo TEXT;
ALTER TABLE inventory_items ADD COLUMN unitPrice REAL;
ALTER TABLE inventory_items ADD COLUMN stockLevel INTEGER;
```

As migrations usam try/catch para ignorar erros quando a coluna ja existe (idempotente).
