# SPEC: Visual e Funcionalidades - Financeiro Inova

**Data:** 2026-04-27  
**Status:** Aprovado pelo usuário

---

## 1. Estilo Visual: Neon Cyber (Style C)

### Paleta de Cores
```
Background:     #0a0a0f (escuro absoluto)
Cards:          rgba(20, 20, 35, 0.9)
Bordas:         rgba(0, 255, 136, 0.25) - verde neon
                rgba(255, 100, 100, 0.25) - vermelho neon (despesas)
                rgba(0, 212, 255, 0.25) - ciano (balanço)

Texto Principal: #ffffff
Texto Secundário: #636366

Accent Verde:    #00ff88 (receitas, positivo)
Accent Rosa:     #ff6464 (despesas, negativo)
Accent Ciano:    #00d4ff (balanço, destaque)

Glows:           text-shadow: 0 0 15px rgba(0, 255, 136, 0.8)
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.1)
```

### Tipografia
- Font Family: 'Inter', system-ui, sans-serif
- Headings: 700 weight, com glow sutil
- Body: 400-500 weight
- Monospace para números: 'JetBrains Mono', monospace

### Efeitos Visuais
- Bordas com glow neon sutil (1px solid com box-shadow)
- Gradientes radiais sutis no background (verde/azul nos cantos)
- Barras de progresso com glow
- Hover com intensificação do glow
- Transições suaves (200ms ease)

---

## 2. Dashboard - Funcionalidades

### 2.1 KPIs Visuais (Cards de Estatísticas)
4 cards principais em grid 2x2:
- Saldo Inicial (verde neon)
- Total Receitas (verde neon)
- Total Despesas (rosa neon)
- Saldo Líquido (ciano neon)

Cada card contém:
- Label em uppercase com glow
- Valor grande com text-shadow
- Comparativo com mês anterior (↑ ou ↓ com %)
- Barra de progresso com glow
- Ícone representativo

### 2.2 Drag & Drop
- Usuário pode reorganizar os cards de KPIs
- Layout salvo no localStorage
- Indicador visual de "arrastável" no hover
- Animações suaves durante reorder

### 2.3 Gráficos Interativos
Área de gráficos com:
- Tooltips ricos com valores formatados em BRL
- Possibilidade de filtrar período (7d, 30d, 90d, 12m, custom)
- Zoom in/out no gráfico
- Click no gráfico abre drill-down

Gráficos:
- Cash Flow (area chart) - Entradas vs Saídas
- Comparativo Mensal (bar chart)
- Ranking de Categorias (horizontal bars)

---

## 3. Relatórios - Funcionalidades

### 3.1 Filtros (Topo + Lateral)

**Filtros no Topo (Dropdown):**
- Período: Últimos 7 dias, 30 dias, 90 dias, Ano atual, Personalizado
- Tipo: Todos, Receitas, Despesas
- Categoria: Dropdown com todas as categorias

**Painel Lateral (Expandível):**
- Filtros avançados colapsável
- Cliente: Busca com autocomplete
- Status pagamento: Pago, Pendente, Atrasado
- Tags: Multi-select com chips
- Botão "Aplicar Filtros" e "Limpar"

### 3.2 Exportação PDF Profissional
PDF formatado com:
- Header com logo/nome da empresa
- Período do relatório
- Gráfico principal em alta resolução
- Tabela com dados formatados (valores em R$, alinhamento)
- Footer com data de geração e página
- Design consistente com o app (dark theme neon)

### 3.3 Drill-down
- Click em qualquer gráfico abre modal com detalhamento
- Click em categoria na tabela expande para ver transações
- Filtros persistem durante drill-down
- Botão "Voltar" para navegação hierárquica

---

## 4. Componentes a Modificar/Criar

### Novos Componentes
- `StatCard.tsx` - Card KPI com neon styling
- `DraggableGrid.tsx` - Grid com drag & drop
- `NeonChart.tsx` - Wrapper para gráficos com styling neon
- `FilterBar.tsx` - Filtros do topo
- `FilterPanel.tsx` - Painel lateral colapsável
- `PDFExporter.tsx` - Geração de PDF profissional
- `DrillDownModal.tsx` - Modal de detalhamento

### Arquivos a Modificar
- `src/index.css` - Adicionar variáveis neon, animações
- `src/components/dashboard/Dashboard.tsx` - Atualizar styling
- `src/components/reports/Reports.tsx` - Adicionar filtros e PDF
- `src/components/ui/StatCard.tsx` - Refazer com neon

---

## 5. Implementação Prioritária

1. **CSS Base** - Variáveis neon, animações, efeitos
2. **StatCard Neon** - Cards de estatísticas com novo visual
3. **Dashboard Grid** - Layout 2x2 com drag & drop
4. **Gráficos Interativos** - Tooltips, filtros, zoom
5. **Filtros Relatórios** - Topo + Lateral
6. **PDF Export** - Profissional formatado
7. **Drill-down** - Modal de detalhamento