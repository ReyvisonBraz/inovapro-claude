/**
 * ROBUST REPORTS DASHBOARD
 * ========================
 * Sistema completo de relatórios com:
 * - Gráficos customizáveis
 * - Filtros avançados
 * - KPIs personalizáveis
 * - Exportação multi-formato
 * - Análise de tendências
 *
 * PONTOS DE DEBUG/CORREÇÃO:
 * - Para corrigir bugs de dados: procure "📊 DEBUG:" neste arquivo
 * - Para corrigir cálculos: procure "🧮 CALCULATION:"
 * - Para corrigir filtros: procure "🔍 FILTER:"
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { format as formatDate, parseISO, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown,
  Calendar, Filter, Download, Eye, EyeOff, Plus, Minus, Settings,
  ChevronDown, ChevronUp, RefreshCw, Save, Trash2, Edit3, Check,
  X, AlertTriangle, DollarSign, Users, ShoppingCart, Wrench,
  ArrowUpRight, ArrowDownRight, Minus as MinusIcon, FileText,
  Printer, Share2, Maximize2, Minimize2, LayoutDashboard
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction, Category } from '../../types';
import { useFilterStore } from '../../store/useFilterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';

interface KPICard {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'number' | 'percent';
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  title: string;
  dataKey: string;
  visible: boolean;
}

interface EnhancedReportsProps {
  transactions: Transaction[];
  categories: Category[];
}

type ViewMode = 'dashboard' | 'detailed' | 'custom';
type ChartPeriod = '7d' | '30d' | '90d' | '12m' | 'custom';

export const EnhancedReports: React.FC<EnhancedReportsProps> = ({
  transactions,
  categories
}) => {
  // 📊 DEBUG: Estado principal
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('30d');
  const [selectedCharts, setSelectedCharts] = useState<ChartConfig[]>([
    { id: 'income-expense', type: 'bar', title: 'Receitas vs Despesas', dataKey: 'monthly', visible: true },
    { id: 'category-pie', type: 'pie', title: 'Por Categoria', dataKey: 'category', visible: true },
    { id: 'trend-line', type: 'line', title: 'Tendência', dataKey: 'trend', visible: true },
    { id: 'cash-flow', type: 'area', title: 'Fluxo de Caixa', dataKey: 'cashflow', visible: true },
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKPIPanel, setShowKPIPanel] = useState(false);

  // 🔍 FILTER: Estado dos filtros
  const {
    reportStartDate,
    reportEndDate,
    reportTypeFilter,
    reportCategoryFilter,
    setReportStartDate,
    setReportEndDate,
    setReportTypeFilter,
    setReportCategoryFilter,
  } = useFilterStore();

  const { settings } = useSettingsStore();
  const { fontSize } = useAppStore();

  // 🧮 CALCULATION: Período de datas
  const dateRange = useMemo(() => {
    const end = reportEndDate ? new Date(reportEndDate) : new Date();
    let start: Date;

    switch (chartPeriod) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '12m':
        start = subMonths(end, 12);
        break;
      case 'custom':
      default:
        start = reportStartDate ? new Date(reportStartDate) : subDays(end, 30);
    }

    return { start, end };
  }, [chartPeriod, reportStartDate, reportEndDate]);

  // 🔍 FILTER: Transações filtradas
  const filteredTransactions = useMemo(() => {
    // 📊 DEBUG: Log de filtragem
    console.log('[REPORTS] 🔍 FILTER: Iniciando filtragem', {
      totalTransactions: transactions.length,
      dateRange,
      typeFilter: reportTypeFilter,
      categoryFilter: reportCategoryFilter
    });

    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);

      // Filtro de período
      if (!isWithinInterval(txDate, {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end)
      })) {
        return false;
      }

      // Filtro de tipo
      if (reportTypeFilter !== 'all' && tx.type !== reportTypeFilter) {
        return false;
      }

      // Filtro de categoria
      if (reportCategoryFilter !== 'all' && tx.category !== reportCategoryFilter) {
        return false;
      }

      return true;
    });

    console.log('[REPORTS] 🔍 FILTER: Filtragem concluída', {
      filteredCount: filtered.length
    });

    return filtered;
  }, [transactions, dateRange, reportTypeFilter, reportCategoryFilter]);

  // 🧮 CALCULATION: KPIs principais
  const kpis = useMemo(() => {
    console.log('[REPORTS] 🧮 CALCULATION: Calculando KPIs');

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;
    const avgTransaction = transactionCount > 0 ? balance / transactionCount : 0;

    // Calcular período anterior para tendências
    const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(dateRange.start.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const prevEnd = new Date(dateRange.start.getTime() - 1);

    const prevTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start: prevStart, end: prevEnd });
    });

    const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const prevBalance = prevIncome - prevExpense;

    const incomeTrend = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseTrend = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
    const balanceTrend = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

    const kpiList: KPICard[] = [
      {
        id: 'income',
        label: 'Total Receitas',
        value: totalIncome,
        previousValue: prevIncome,
        format: 'currency',
        icon: <ArrowUpRight className="text-emerald-500" />,
        color: 'emerald',
        trend: incomeTrend >= 0 ? 'up' : 'down'
      },
      {
        id: 'expense',
        label: 'Total Despesas',
        value: totalExpense,
        previousValue: prevExpense,
        format: 'currency',
        icon: <ArrowDownRight className="text-rose-500" />,
        color: 'rose',
        trend: expenseTrend <= 0 ? 'up' : 'down'
      },
      {
        id: 'balance',
        label: 'Saldo',
        value: balance,
        previousValue: prevBalance,
        format: 'currency',
        icon: balance >= 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />,
        color: balance >= 0 ? 'emerald' : 'rose',
        trend: balanceTrend >= 0 ? 'up' : 'down'
      },
      {
        id: 'count',
        label: 'Transações',
        value: transactionCount,
        format: 'number',
        icon: <FileText className="text-blue-500" />,
        color: 'blue',
        trend: 'neutral'
      },
      {
        id: 'avg',
        label: 'Média/Transação',
        value: avgTransaction,
        format: 'currency',
        icon: <DollarSign className="text-purple-500" />,
        color: 'purple',
        trend: 'neutral'
      },
    ];

    console.log('[REPORTS] 🧮 CALCULATION: KPIs calculados', { kpis: kpiList.length });
    return kpiList;
  }, [filteredTransactions, dateRange, transactions]);

  // 🧮 CALCULATION: Dados para gráfico de barras (Receitas vs Despesas mensal)
  const monthlyBarData = useMemo(() => {
    console.log('[REPORTS] 🧮 CALCULATION: Calculando dados mensais');

    const byMonth: Record<string, { income: number; expense: number }> = {};

    // Inicializar todos os meses do período
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const monthKey = formatDate(current, 'yyyy-MM');
      const monthName = formatDate(current, 'MMM', { locale: ptBR }).toUpperCase();
      byMonth[monthKey] = { income: 0, expense: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    // Preencher com dados
    filteredTransactions.forEach(tx => {
      const monthKey = tx.date.substring(0, 7);
      if (byMonth[monthKey]) {
        if (tx.type === 'income') {
          byMonth[monthKey].income += tx.amount;
        } else {
          byMonth[monthKey].expense += tx.amount;
        }
      }
    });

    return Object.entries(byMonth).map(([month, data]) => ({
      month: formatDate(parseISO(`${month}-01`), 'MMM', { locale: ptBR }).toUpperCase(),
      fullMonth: month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }));
  }, [filteredTransactions, dateRange]);

  // 🧮 CALCULATION: Dados para gráfico de pizza (Por categoria)
  const categoryPieData = useMemo(() => {
    console.log('[REPORTS] 🧮 CALCULATION: Calculando dados por categoria');

    const byCategory: Record<string, number> = {};

    filteredTransactions.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    });

    const colors = ['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return Object.entries(byCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // 🧮 CALCULATION: Dados para gráfico de linha (Tendência)
  const trendLineData = useMemo(() => {
    console.log('[REPORTS] 🧮 CALCULATION: Calculando tendência');

    const byDay: Record<string, { income: number; expense: number; balance: number }> = {};

    // Inicializar dias
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const dayKey = formatDate(current, 'yyyy-MM-dd');
      byDay[dayKey] = { income: 0, expense: 0, balance: 0 };
      current.setDate(current.getDate() + 1);
    }

    // Preencher
    filteredTransactions.forEach(tx => {
      const dayKey = tx.date;
      if (byDay[dayKey]) {
        if (tx.type === 'income') {
          byDay[dayKey].income += tx.amount;
        } else {
          byDay[dayKey].expense += tx.amount;
        }
        byDay[dayKey].balance = byDay[dayKey].income - byDay[dayKey].expense;
      }
    });

    // Converter para array e calcular acumulado
    let cumulative = 0;
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        cumulative += data.balance;
        return {
          date: formatDate(parseISO(date), 'dd/MM'),
          fullDate: date,
          ...data,
          cumulative
        };
      });
  }, [filteredTransactions, dateRange]);

  // 🧮 CALCULATION: Dados para gráfico de área (Fluxo de Caixa)
  const cashFlowData = useMemo(() => {
    console.log('[REPORTS] 🧮 CALCULATION: Calculando fluxo de caixa');

    let runningBalance = 0;
    const startBalance = 0; // Pode ser configurado das settings

    return trendLineData.map(d => {
      runningBalance = startBalance + d.cumulative;
      return {
        ...d,
        runningBalance
      };
    });
  }, [trendLineData]);

  // 🧮 CALCULATION: Top categorias
  const topCategories = useMemo(() => {
    return categoryPieData.slice(0, 5);
  }, [categoryPieData]);

  // Função para exportar dados
  const exportData = useCallback((format: 'csv' | 'json') => {
    console.log('[REPORTS] 📊 DEBUG: Exportando dados em formato', format);

    if (format === 'json') {
      const dataStr = JSON.stringify({
        period: { start: dateRange.start, end: dateRange.end },
        kpis,
        transactions: filteredTransactions,
        monthlyData: monthlyBarData,
        categoryData: categoryPieData,
        trendData: trendLineData
      }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
      const rows = filteredTransactions.map(tx => [
        tx.date,
        tx.description,
        tx.category,
        tx.type,
        tx.amount.toString()
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredTransactions, dateRange, kpis, monthlyBarData, categoryPieData, trendLineData]);

  // Renderizar KPI Card
  const renderKPICard = (kpi: KPICard) => {
    const formatValue = (value: number, fmt: string) => {
      switch (fmt) {
        case 'currency':
          return formatCurrency(value);
        case 'percent':
          return `${value.toFixed(1)}%`;
        default:
          return value.toLocaleString('pt-BR');
      }
    };

    const trendColor = kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-rose-500' : 'text-slate-400';
    const trendIcon = kpi.trend === 'up' ? <ChevronUp size={16} /> :
                      kpi.trend === 'down' ? <ChevronDown size={16} /> :
                      <MinusIcon size={16} />;

    return (
      <motion.div
        key={kpi.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "glass-card p-6 relative overflow-hidden",
          "border-l-4",
          kpi.color === 'emerald' && "border-l-emerald-500",
          kpi.color === 'rose' && "border-l-rose-500",
          kpi.color === 'blue' && "border-l-blue-500",
          kpi.color === 'purple' && "border-l-purple-500"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className={cn(
              "text-2xl font-black",
              kpi.color === 'emerald' && "text-emerald-500",
              kpi.color === 'rose' && "text-rose-500",
              kpi.color === 'blue' && "text-blue-500",
              kpi.color === 'purple' && "text-purple-500"
            )}>
              {formatValue(kpi.value, kpi.format)}
            </p>
            {kpi.previousValue !== undefined && (
              <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
                {trendIcon}
                <span className="text-xs font-bold">
                  {Math.abs(kpi.trend === 'up' ?
                    ((kpi.value - kpi.previousValue) / kpi.previousValue * 100) :
                    kpi.previousValue > 0 ? ((kpi.value - kpi.previousValue) / kpi.previousValue * 100) : 0).toFixed(1)}%
                </span>
                <span className="text-slate-500 text-xs">vs período anterior</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            {kpi.icon}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("space-y-8", isFullscreen && "fixed inset-0 z-50 bg-slate-900 p-8 overflow-auto")}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Painel de Relatórios</h3>
          <p className="text-sm text-slate-500">
            Análise completa do período: {formatDate(dateRange.start, 'dd/MM/yyyy')} a {formatDate(dateRange.end, 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Período Rápido */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {(['7d', '30d', '90d', '12m'] as ChartPeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  chartPeriod === period ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                )}
              >
                {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : '12 meses'}
              </button>
            ))}
          </div>

          {/* Exportar */}
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
          >
            <Download size={16} />
            CSV
          </button>

          <button
            onClick={() => exportData('json')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
          >
            <Download size={16} />
            JSON
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(renderKPICard)}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras - Receitas vs Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Receitas vs Despesas
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Pizza - Por Categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-primary" />
            Por Categoria
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Linha - Tendência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Tendência de Saldo
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                />
                <Line type="monotone" dataKey="cumulative" name="Saldo Acumulado" stroke="#1152d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Área - Fluxo de Caixa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-primary" />
            Fluxo de Caixa
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="income" name="Receitas" fill="#10b981" fillOpacity={0.2} stroke="#10b981" />
                <Area type="monotone" dataKey="expense" name="Despesas" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Categorias e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4">Top Categorias</h4>
          <div className="space-y-3">
            {topCategories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{cat.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(cat.value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-500">
                    {(((cat.value / (categoryPieData.reduce((s, c) => s + c.value, 0))) * 100)).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resumo do Período */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4">Resumo do Período</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-slate-400">Total de Dias</span>
              <span className="font-bold">{Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-slate-400">Média Diária (Receitas)</span>
              <span className="font-bold text-emerald-500">
                {formatCurrency(kpis.find(k => k.id === 'income')!.value / Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-slate-400">Média Diária (Despesas)</span>
              <span className="font-bold text-rose-500">
                {formatCurrency(kpis.find(k => k.id === 'expense')!.value / Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-slate-400">Saldo Médio</span>
              <span className={cn("font-bold", kpis.find(k => k.id === 'balance')!.value >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {formatCurrency(kpis.find(k => k.id === 'avg')!.value)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Transações Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-4">Últimas Transações</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredTransactions.slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  tx.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.category} • {formatDate(parseISO(tx.date), 'dd/MM')}</p>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedReports;