# Visual + Funcionalidades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Style C (Neon Cyber) visual overhaul + Dashboard KPIs com drag & drop + Gráficos interativos + Relatórios com filtros topo/lateral + PDF profissional + Drill-down

**Architecture:** 
- CSS variables para o tema neon com cores do estilo C
- Novo componente StatCard com glow neon
- Layout com drag & drop via @dnd-kit
- Filtros com Zustand store + UI em painel lateral colapsável
- PDF via html2pdf.js ou jspdf com formatação customizada
- Drill-down via modal com navegação hierárquica

**Tech Stack:** 
- React 19 + TypeScript + Vite
- Tailwind CSS 4 + motion/react
- @dnd-kit/core + @dnd-kit/sortable (drag & drop)
- html2pdf.js (PDF export)
- date-fns (formatação)

---

## Task 1: CSS Neon Theme - Variáveis e Classes

**Files:**
- Modify: `src/index.css:1-10` (adicionar variáveis do tema neon)
- Modify: `src/index.css:17-82` (adicionar classes neon)

- [ ] **Step 1: Adicionar variáveis CSS do tema neon**

No `@theme` block, adicionar:
```css
--color-neon-green: #00ff88;
--color-neon-pink: #ff6464;
--color-neon-cyan: #00d4ff;
--color-neon-bg: #0a0a0f;
--color-neon-card: rgba(20, 20, 35, 0.9);
--color-neon-border-green: rgba(0, 255, 136, 0.25);
--color-neon-border-red: rgba(255, 100, 100, 0.25);
--color-neon-border-cyan: rgba(0, 212, 255, 0.25);
```

- [ ] **Step 2: Adicionar classe `.neon-card` em `@layer components`**

```css
.neon-card {
  background: var(--color-neon-card);
  border: 1px solid var(--color-neon-border-green);
  border-radius: 16px;
  box-shadow: 
    0 0 20px rgba(0, 255, 136, 0.1),
    inset 0 1px 0 rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  transition: all 0.2s ease;
}

.neon-card:hover {
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 40px rgba(0, 255, 136, 0.15);
}

.neon-text {
  color: var(--color-neon-green);
  text-shadow: 0 0 15px rgba(0, 255, 136, 0.8);
}

.neon-bar {
  background: linear-gradient(90deg, #00ff88, #00d4ff);
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
}
```

- [ ] **Step 3: Commit**
```bash
git add src/index.css
git commit -m "feat(neon-theme): add CSS variables and neon card classes"
```

---

## Task 2: StatCard Neon - Card de KPI Moderno

**Files:**
- Modify: `src/components/ui/StatCard.tsx:15-44` (reestilizar componente)
- Modify: `src/components/dashboard/Dashboard.tsx:45-77` (usar novo StatCard)

- [ ] **Step 1: Reescrever StatCard com estilo neon**

Substituir o componente StatCard inteiro por:
```tsx
export const StatCard = ({ title, value, change, trend, icon: Icon, color }: StatCardProps) => {
  const glowColor = trend === 'up' ? '#00ff88' : '#ff6464';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-6 group cursor-default"
      style={{ 
        background: 'rgba(20, 20, 35, 0.9)',
        border: `1px solid ${trend === 'up' ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 100, 100, 0.25)'}`,
        boxShadow: `0 0 20px ${trend === 'up' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 100, 100, 0.1)'}`,
      }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${glowColor}15 0%, transparent 50%)`,
        }}
      />
      
      <div className="flex justify-between items-start relative z-10">
        <div 
          className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{ 
            background: `${glowColor}15`,
            border: `1px solid ${glowColor}30`,
            boxShadow: `0 0 15px ${glowColor}30`
          }}
        >
          <Icon size={20} style={{ color: glowColor }} />
        </div>
        <div 
          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
          style={{ 
            background: `${glowColor}15`,
            color: glowColor,
            border: `1px solid ${glowColor}30`,
            textShadow: `0 0 10px ${glowColor}80`
          }}
        >
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      </div>
      
      <div className="mt-4 relative z-10">
        <p 
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ 
            color: glowColor,
            textShadow: `0 0 15px ${glowColor}80`
          }}
        >
          {title}
        </p>
        <h3 
          className="text-2xl font-bold"
          style={{ 
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          {formatCurrency(value)}
        </h3>
        <div className="flex items-center gap-3 mt-4">
          <div 
            className="h-1.5 flex-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${glowColor}, ${trend === 'up' ? '#00d4ff' : '#ff9f9f'})`,
                boxShadow: `0 0 15px ${glowColor}80`
              }}
            />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase">vs mês</p>
        </div>
      </div>
    </motion.div>
  );
};
```

- [ ] **Step 2: Commit**
```bash
git add src/components/ui/StatCard.tsx
git commit -m "feat(neon): restyle StatCard with neon cyber theme"
```

---

## Task 3: Dashboard Drag & Drop Grid

**Files:**
- Create: `src/components/ui/DraggableGrid.tsx`
- Modify: `src/components/dashboard/Dashboard.tsx:44-77` (substituir grid por DraggableGrid)
- Modify: `src/store/useAppStore.ts` (adicionar estado para order dos cards)

- [ ] **Step 1: Verificar useAppStore e adicionar estado**

Ler `src/store/useAppStore.ts` e adicionar:
```ts
dashboardCardOrder: string[];
setDashboardCardOrder: (order: string[]) => void;
```

- [ ] **Step 2: Criar DraggableGrid component**

Criar arquivo com:
```tsx
import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

interface DraggableGridProps {
  items: React.ReactNode[];
  onReorder: (newOrder: number[]) => void;
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({ items, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => `card-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `card-${i}` === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex).map((_, i) => i);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((_, i) => `card-${i}`)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((child, index) => (
            <SortableItem key={`card-${index}`} id={`card-${index}`}>
              {child}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
```

- [ ] **Step 3: Atualizar Dashboard para usar DraggableGrid**

Substituir a seção de Stats Grid no Dashboard.

- [ ] **Step 4: Commit**
```bash
git add src/components/ui/DraggableGrid.tsx src/components/dashboard/Dashboard.tsx src/store/useAppStore.ts
git commit -m "feat(drag-drop): add draggable grid for dashboard cards"
```

---

## Task 4: Gráficos Interativos com Tooltips Ricos

**Files:**
- Create: `src/components/ui/NeonChart.tsx` (wrapper para gráficos)
- Modify: `src/components/dashboard/Dashboard.tsx:79-175` (atualizar gráficos)

- [ ] **Step 1: Criar NeonChart wrapper**

Criar componente que aplica styling neon aos tooltips e adiciona filtros de período.

- [ ] **Step 2: Atualizar gráficos do Dashboard**

Atualizar AreaChart e BarChart com:
- Tooltips customizados com styling neon
- Filtro de período (7d, 30d, 90d, 12m)
- Click handler para drill-down

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/NeonChart.tsx src/components/dashboard/Dashboard.tsx
git commit -m "feat(charts): add interactive neon charts with rich tooltips"
```

---

## Task 5: Filtros Relatórios - Topo + Lateral

**Files:**
- Create: `src/components/reports/FilterBar.tsx` (filtros topo)
- Create: `src/components/reports/FilterPanel.tsx` (painel lateral)
- Modify: `src/components/reports/Reports.tsx` (integrar filtros)
- Modify: `src/store/useFilterStore.ts` (adicionar estado dos filtros)

- [ ] **Step 1: Adicionar estados ao FilterStore**

```ts
reportTypeFilter: 'all' | 'income' | 'expense';
reportCategoryFilter: string;
reportCustomerFilter: string;
reportPaymentStatus: 'all' | 'paid' | 'pending' | 'overdue';
setReportTypeFilter: (filter: 'all' | 'income' | 'expense') => void;
setReportCategoryFilter: (category: string) => void;
// etc.
```

- [ ] **Step 2: Criar FilterBar (topo)**

Dropdown para período, tipo e categoria.

- [ ] **Step 3: Criar FilterPanel (lateral)**

Painel colapsável com filtros avançados (cliente, status pagamento, tags).

- [ ] **Step 4: Integrar no Reports.tsx**

- [ ] **Step 5: Commit**
```bash
git add src/components/reports/FilterBar.tsx src/components/reports/FilterPanel.tsx src/components/reports/Reports.tsx src/store/useFilterStore.ts
git commit -m "feat(filters): add top and lateral filters to reports"
```

---

## Task 6: PDF Export Profissional

**Files:**
- Create: `src/lib/pdfExporter.ts` (lógica de geração)
- Create: `src/components/reports/PDFExportButton.tsx` (botão de exportar)
- Modify: `src/components/reports/Reports.tsx` (adicionar botão)

- [ ] **Step 1: Instalar dependência**
```bash
npm install html2pdf.js
```

- [ ] **Step 2: Criar pdfExporter.ts**

Função que captura o elemento do relatório e gera PDF formatado com:
- Header com logo/nome
- Período do relatório
- Gráfico exportado como imagem
- Tabela com dados formatados
- Footer com data/página

- [ ] **Step 3: Criar PDFExportButton**

Botão que chama o exporter com loading state.

- [ ] **Step 4: Integrar no Reports**

- [ ] **Step 5: Commit**
```bash
git add src/lib/pdfExporter.ts src/components/reports/PDFExportButton.tsx src/components/reports/Reports.tsx
git commit -m "feat(pdf): add professional PDF export for reports"
npm install html2pdf.js
```

---

## Task 7: Drill-Down Modal

**Files:**
- Create: `src/components/ui/DrillDownModal.tsx`
- Modify: `src/components/dashboard/Dashboard.tsx` (handler do chart click)
- Modify: `src/components/reports/Reports.tsx` (handler do chart click)

- [ ] **Step 1: Criar DrillDownModal**

Modal com:
- Header com título e botão voltar
- Área de drill-down (tabela detalhada ou gráfico expandido)
- Navegação hierárquica (mantém histórico)
- Filtros persistem durante drill-down

- [ ] **Step 2: Adicionar handlers nos gráficos**

Chamar DrillDownModal quando usuário clicar em um gráfico.

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/DrillDownModal.tsx src/components/dashboard/Dashboard.tsx src/components/reports/Reports.tsx
git commit -m "feat(drill-down): add modal for chart drill-down navigation"
```

---

## Spec Coverage Check

| Requisito | Task |
|-----------|------|
| Style C Neon | Task 1, 2 |
| KPIs visuais | Task 2 |
| Drag & drop | Task 3 |
| Gráficos interativos | Task 4 |
| Filtros topo + lateral | Task 5 |
| PDF profissional | Task 6 |
| Drill-down | Task 7 |

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-27-visual-funcionalidades.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**