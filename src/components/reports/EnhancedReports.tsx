import React, { useState, useCallback } from 'react';
import { format as formatDate } from 'date-fns';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Transaction, Category } from '../../types';
import { useReportData, type ChartPeriod } from '../../hooks/useReportData';
import { ReportKPIs } from './ReportKPIs';
import { ReportCharts } from './ReportCharts';
import { ReportSidebar } from './ReportSidebar';

interface EnhancedReportsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const EnhancedReports: React.FC<EnhancedReportsProps> = ({ transactions }) => {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('30d');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { dateRange, filteredTransactions, kpis, monthlyBarData, categoryPieData, trendLineData, cashFlowData, topCategories } =
    useReportData(transactions, chartPeriod);

  const exportData = useCallback((format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify({
        period: { start: dateRange.start, end: dateRange.end },
        kpis,
        transactions: filteredTransactions,
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
      const rows = filteredTransactions.map(tx => [tx.date, tx.description, tx.category, tx.type, tx.amount.toString()]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredTransactions, dateRange, kpis]);

  return (
    <div className={cn('space-y-8', isFullscreen && 'fixed inset-0 z-50 bg-slate-900 p-8 overflow-auto')}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Painel de Relatórios</h3>
          <p className="text-sm text-slate-500">
            Análise completa do período: {formatDate(dateRange.start, 'dd/MM/yyyy')} a {formatDate(dateRange.end, 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {(['7d', '30d', '90d', '12m'] as ChartPeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  chartPeriod === period ? 'bg-primary text-white' : 'text-slate-400 hover:text-white',
                )}
              >
                {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : '12 meses'}
              </button>
            ))}
          </div>

          <button onClick={() => exportData('csv')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            <Download size={16} />CSV
          </button>
          <button onClick={() => exportData('json')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            <Download size={16} />JSON
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <ReportKPIs kpis={kpis} />

      {/* Gráficos */}
      <ReportCharts
        monthlyBarData={monthlyBarData}
        categoryPieData={categoryPieData}
        trendLineData={trendLineData}
        cashFlowData={cashFlowData}
      />

      {/* Sidebar (Top Categorias, Resumo, Transações Recentes) */}
      <ReportSidebar
        topCategories={(topCategories ?? []).map(c => ({ ...c, color: c.color ?? '#6366f1' }))}
        categoryPieData={(categoryPieData ?? []).map(c => ({ ...c, color: c.color ?? '#6366f1' }))}
        kpis={kpis}
        dateRange={dateRange}
        filteredTransactions={filteredTransactions}
      />
    </div>
  );
};

export default EnhancedReports;