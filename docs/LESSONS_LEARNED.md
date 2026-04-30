# 📚 LIÇÕES APRENDIDAS - INOVA PRO

> Documentação de bugs encontrados e correções aplicadas para evitar regressões futuras.
> Atualizado em: 2026-04-28

---

## 🔴 Bug #1: Nomenclatura de Dados nos Gráficos (CRÍTICO)

### Sintoma
Gráficos do Dashboard não exibiam dados - barras vazias ou valores não apareciam.

### Causa Raiz
Os componentes React usavam `dataKey` diferente do que a API retornava.

### Localização
- `src/components/dashboard/Dashboard.tsx`
- `src/components/reports/Reports.tsx`

### Código Incorreto
```tsx
// ❌ ERRADO - API retorna income/expense, não renda/despesa
<Area dataKey="renda" ... />
<Bar dataKey="renda" fill="#1152d4" ... />
<Bar dataKey="despesa" fill="#ef4444" ... />
```

### Código Correto
```tsx
// ✅ CORRETO
<Area dataKey="income" ... />
<Bar dataKey="income" fill="#1152d4" ... />
<Bar dataKey="expense" fill="#ef4444" ... />
```

### API Response (confirmado)
```json
{
  "chartData": [
    { "name": "ABR.", "income": 2500, "expense": 300 }
  ]
}
```

### Prevenção
- Sempre verificar o formato real da resposta da API
- Usar TypeScript com tipos consistentes entre frontend e backend
- Criar testes de integração para verificar estrutura de dados

---

## 🟡 Bug #2: Divisão por Zero nos Rankings

### Sintoma
Erro `NaN` ou comportamento estranho nos rankings de categorias quando não há dados.

### Causa Raiz
`Math.max()` com array vazio retorna `-Infinity`.

### Localização
`src/components/dashboard/Dashboard.tsx` - linhas 201 e 250

### Código Incorreto
```tsx
// ❌ ERRADO - falha quando sortedIncomeRanking está vazio
animate={{ width: `${((amount as number) / Math.max(...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
```

### Código Correto
```tsx
// ✅ CORRETO - Math.max(1, ...) garante mínimo de 1
animate={{ width: `${((amount as number) / Math.max(1, ...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
```

### Prevenção
- Sempre validar arrays antes de usar com Math.max/Math.min
- Considerar casos vazios desde o design

---

## 🟡 Bug #3: DrillDownModal Null Check

### Sintoma
`TypeError: Cannot read properties of null (reading 'currentLevel')`

### Causa Raiz
Acesso a propriedade de objeto que pode ser null sem verificação.

### Localização
`src/components/ui/DrillDownModal.tsx`

### Código Incorreto
```tsx
// ❌ ERRADO - acesso direto sem verificação
const [history] = useState([{ level: drillDownData.currentLevel || 0 }]);
if (!isOpen || !currentLevel) return null;
```

### Código Correto
```tsx
// ✅ CORRETO - optional chaining e validação
const [history] = useState([{ level: drillDownData?.currentLevel || 0 }]);

if (!isOpen || !drillDownData || !drillDownData.levels || drillDownData.levels.length === 0) return null;

const currentEntry = history[history.length - 1];
if (!currentEntry || currentEntry.level < 0 || currentEntry.level >= drillDownData.levels.length) return null;

const currentLevel = drillDownData.levels[currentEntry.level];
if (!currentLevel) return null;
```

### Prevenção
- Usar optional chaining (`?.`) para acessar propriedades de objetos que podem ser null
- Implementar early returns para validar estado antes de usar dados
- Adicionar null checks em nível de TypeScript via tipos opcionais

---

## 🔴 Bug #4: Módulo @dnd-kit não resolvia no Dev Server

### Sintoma
Erro Vite: `Failed to resolve import "@dnd-kit/core"`

### Causa Raiz
Vite HMR não pré-bundlava corretamente as dependências @dnd-kit.

### Solução Aplicada
Substituímos `DraggableGrid.tsx` para usar `motion` (já disponível no projeto) em vez de `@dnd-kit`.

### Localização
`src/components/ui/DraggableGrid.tsx`

### Alternativas Consideradas
1. Reinstalar dependências (não funcionou)
2. Configurar `optimizeDeps` no vite.config.ts
3. **Solução final: Remover dependência desnecessária**

### Código Anterior (com @dnd-kit)
```tsx
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

### Código Atual (com motion)
```tsx
import { motion } from 'motion/react';
// drag and drop removido,使用的是简单的motion动画
```

### Prevenção
- Evitar bibliotecas que causam conflitos com Vite/Rollup
- Manter lista de dependências atualizada e limpa
- Testar build de produção antes de использовать новые библиотеки

---

## 🟠 Bug #5: Arquivo .env com Valores Duplicados

### Sintoma
Variáveis de ambiente sobrescritas incorretamente.

### Localização
`.env` - linhas 45-50 continham duplicatas

### Solução
Removidas as linhas duplicadas do final do arquivo.

### Prevenção
- Revisar .env antes de commit
- Usar ferramenta de validação de .env

---

## 📋 Resumo de Convenções

### Estrutura de Dados da API (Stats)
```typescript
// CONFIRMADO: API retorna estas chaves
interface ChartDataPoint {
  name: string;      // ex: "ABR.", "MAR."
  income: number;    // não "renda"!
  expense: number;   // não "despesa"!
}
```

### Sempre Usar
- `?.` (optional chaining) para objetos que podem ser null
- `Math.max(1, ...array)` para evitar divisão por zero
- Validação de arrays antes de usar com Math functions
- Early returns para dados ausentes

### Nunca Usar
- Nomes hardcoded que não existem na API
- Acesso direto a propriedades sem verificar null
- Arrays vazios com Math.max/Math.min sem fallback

---

## 🧪 Como Testar Changes

### Após modificar gráficos:
1. Acessar Dashboard
2. Verificar se gráficos mostram dados
3. Clicar em períodos diferentes (7d, 30d, 90d, 12m)

### Após modificar DrillDownModal:
1. Clicar em um mês no gráfico
2. Verificar se modal abre sem erro
3. Testar navegação entre níveis

### Após modificar ranking:
1. Verificar rankings com dados
2. Limpar transactions e verificar rankings vazios

---

## 📁 Arquivos de Referência

- `docs/BUGS-REPORT.md` - Relatório inicial de bugs
- `docs/PLANO-CORRECAO-BUGS.md` - Plano detalhado de correções
- `docs/LESSONS_LEARNED.md` - Este arquivo

---

*Este documento deve ser atualizado sempre que um novo bug for encontrado e corrigido.*