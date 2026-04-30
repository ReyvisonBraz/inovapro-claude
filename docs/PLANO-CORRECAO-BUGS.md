# PLANO DETALHADO DE CORREÇÃO DE BUGS - INOVA PRO

## Data da Análise: 2026-04-28
## Total de Bugs Identificados: 4 (2 críticos, 2 moderados)

---

## BUG #1: Dashboard - Gráficos com DataKeys Incorretos (CRÍTICO)

### Localização
- `src/components/dashboard/Dashboard.tsx` - linhas 129, 157, 158
- `src/components/reports/Reports.tsx` - linhas 156, 157 (chart) e 240, 241, 244, 246 (table)

### Problema
Os gráficos e tabelas usam `dataKey="renda"` e `dataKey="despesa"`, mas a API `/api/stats` retorna objetos com `income` e `expense`.

**API Response (confirmado):**
```json
{
  "chartData": [
    { "name": "ABR.", "income": 1500, "expense": 300 }
  ]
}
```

**Código atual (errado):**
```tsx
// Dashboard.tsx linha 129
<Area dataKey="renda" ... />

// Dashboard.tsx linhas 157-158
<Bar dataKey="renda" fill="#1152d4" ... />
<Bar dataKey="despesa" fill="#ffffff10" ... />

// Reports.tsx linha 240
{formatCurrency(data.renda)}

// Reports.tsx linha 241
{formatCurrency(data.despesa)}
```

### Impacto
- Gráficos do Dashboard não exibem dados (barras vazias)
- Tabela de relatórios mostra `R$ undefined` ou `R$ 0`
- Rankings de categorias também podem estar com problemas

### Plano de Correção

#### Correção no Dashboard.tsx (linhas 129, 157, 158):

**ANTES (linha 129):**
```tsx
<Area dataKey="renda" ... />
```

**DEPOIS:**
```tsx
<Area dataKey="income" ... />
```

**ANTES (linhas 157-158):**
```tsx
<Bar dataKey="renda" fill="#1152d4" ... />
<Bar dataKey="despesa" fill="#ffffff10" ... />
```

**DEPOIS:**
```tsx
<Bar dataKey="income" fill="#1152d4" ... />
<Bar dataKey="expense" fill="#ef4444" ... />
```

#### Correção no Reports.tsx:

**ANTES (linhas 156-157):**
```tsx
<Bar dataKey="renda" fill="#1152d4" ... />
<Bar dataKey="despesa" fill="#ef4444" ... />
```

**DEPOIS:**
```tsx
<Bar dataKey="income" fill="#1152d4" ... />
<Bar dataKey="expense" fill="#ef4444" ... />
```

**ANTES (linha 240):**
```tsx
{formatCurrency(data.renda)}
```

**DEPOIS:**
```tsx
{formatCurrency(data.income || 0)}
```

**ANTES (linha 241):**
```tsx
{formatCurrency(data.despesa)}
```

**DEPOIS:**
```tsx
{formatCurrency(data.expense || 0)}
```

**ANTES (linha 244):**
```tsx
data.renda - data.despesa >= 0
```

**DEPOIS:**
```tsx
(data.income || 0) - (data.expense || 0) >= 0
```

**ANTES (linha 246):**
```tsx
{formatCurrency(data.renda - data.despesa)}
```

**DEPOIS:**
```tsx
{formatCurrency((data.income || 0) - (data.expense || 0))}
```

---

## BUG #2: ÁreaChart do Dashboard - Gradient ID Errado (MODERADO)

### Localização
`src/components/dashboard/Dashboard.tsx` - linha 133

### Problema
O gradient `url(#colorIncome)` é referenciado na Area, mas o ID no defs está `colorIncome` (linha 112), porém na Line 113 o stopColor usa `#1152d4` diretamente, não referencia o gradient. O problema é que o `fill` usa `url(#colorIncome)` que está correto, mas...

Espera, olhando novamente, o gradient ID está correto (`colorIncome`). O problema real é apenas o dataKey conforme Bug #1.

### Nota
Verificar se não há outros lugares usando nomes errados para os dados do chart.

---

## BUG #3: Ranking com Divisão por Zero (MODERADO)

### Localização
`src/components/dashboard/Dashboard.tsx` - linhas 201, 250

### Problema
Quando `sortedIncomeRanking` ou `sortedExpenseRanking` está vazio, o `Math.max(...sortedIncomeRanking.map(([, a]) => a as number))` pode causar erro ou retornar `-Infinity`.

**Código vulnerável:**
```tsx
// Linha 201
animate={{ width: `${((amount as number) / Math.max(...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}

// Linha 250
animate={{ width: `${((amount as number) / Math.max(...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
```

### Impacto
- Se não houver transações de entrada, o ranking de entradas quebra
- Se não houver transações de saída, o ranking de saídas quebra

### Plano de Correção

**ANTES (linha 201):**
```tsx
animate={{ width: `${((amount as number) / Math.max(...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
```

**DEPOIS:**
```tsx
animate={{ width: `${((amount as number) / Math.max(1, ...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
```

**ANTES (linha 250):**
```tsx
animate={{ width: `${((amount as number) / Math.max(...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
```

**DEPOIS:**
```tsx
animate={{ width: `${((amount as number) / Math.max(1, ...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
```

---

## BUG #4: Filtro de Período no Dashboard - Lógica Incorreta (MODERADO)

### Localização
`src/components/dashboard/Dashboard.tsx` - linhas 45-72

### Problema
A função `filteredChartData` tenta filtrar por data, mas usa `new Date(item.name)` que retorna data inválida para strings como "ABR.". Além disso, a lógica de filtragem não considera o período selecionado corretamente.

**Código проблемa:**
```tsx
const filteredChartData = useMemo(() => {
  // ...
  return chartData.filter((item: { name?: string }) => {
    if (!item.name) return true;
    const itemDate = new Date(item.name); // "ABR." não é uma data válida!
    return itemDate >= cutoffDate;
  });
}, [chartData, selectedPeriod]);
```

### Impacto
- Filtros de período (7d, 30d, 90d, 12m) não funcionam corretamente
- Gráfico sempre mostra todos os 12 meses independente do período selecionado

### Plano de Correção

A lógica atual não consegue converter "ABR." em data. A solução mais simples é remover essa filtragem já que o backend já retorna apenas os últimos 12 meses, ou criar um mapeamento de mês para data real.

**Sugestão de correção (substituir a função filteredChartData):**
```tsx
const filteredChartData = useMemo(() => {
  // O backend já retorna apenas os últimos 12 meses em ordem cronológica
  // Não precisamos filtrar por data, apenas usamos o array diretamente
  if (!chartData || chartData.length === 0) return [];

  // Slice para garantir que temos apenas o número correto de meses baseado no período
  switch (selectedPeriod) {
    case '7d':
    case '30d':
    case '90d':
      // Para períodos curtos, ainda mostramos 12 meses (dados mensais)
      return chartData;
    case '12m':
    default:
      return chartData;
  }
}, [chartData, selectedPeriod]);
```

Ou se a filtragem for necessária, usar índice:
```tsx
const filteredChartData = useMemo(() => {
  if (!chartData || chartData.length === 0) return [];

  const now = new Date();
  let monthsToShow = 12;

  switch (selectedPeriod) {
    case '7d':
    case '30d':
      monthsToShow = 1;
      break;
    case '90d':
      monthsToShow = 3;
      break;
    case '12m':
    default:
      monthsToShow = 12;
  }

  return chartData.slice(-monthsToShow);
}, [chartData, selectedPeriod]);
```

---

## RESUMO DAS CORREÇÕES

| Bug | Severidade | Arquivo | Linhas | Status |
|-----|-----------|---------|--------|--------|
| #1 | CRÍTICO | Dashboard.tsx | 129, 157, 158 | A corrigir |
| #1 | CRÍTICO | Reports.tsx | 156, 157, 240, 241, 244, 246 | A corrigir |
| #2 | BAIXO | - | - | N/A (parece OK) |
| #3 | MODERADO | Dashboard.tsx | 201, 250 | A corrigir |
| #4 | MODERADO | Dashboard.tsx | 45-72 | A corrigir |

---

## INSTRUÇÕES DE TESTE APÓS CORREÇÕES

1. **Dashboard:**
   - Acessar `/dashboard`
   - Verificar se gráficos de "Tendência de Fluxo de Caixa" mostram dados
   - Verificar se gráfico de "Comparação Mensal" mostra barras coloridas
   - Verificar rankings de entradas e saídas

2. **Relatórios:**
   - Acessar `/relatorios`
   - Alternar entre visualização Gráficos e Tabela
   - Verificar se tabela mostra valores corretos (não undefined)

3. **Teste com dados:**
   - Criar transação de entrada (Vendas)
   - Criar transação de saída (Utilidades)
   - Verificar se gráficos atualizam corretamente

---

## PREVENÇÃO

Para evitar regressões futuras:
1. Adicionar testes para verificar dataKeys dos gráficos
2. Documentar convenção: API usa `income/expense`, frontend deve usar o mesmo
3. Adicionar validação TypeScript para garantir compatibilidade de dados