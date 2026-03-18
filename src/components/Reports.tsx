import React from 'react';
import { motion } from 'motion/react';
import { Printer } from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '../lib/utils';
import { Transaction, Category, AppSettings } from '../types';

interface ReportsProps {
  settings: AppSettings;
  reportView: 'charts' | 'table';
  setReportView: (view: 'charts' | 'table') => void;
  categories: Category[];
  transactions: Transaction[];
  chartData: any[];
  handleChartClick: (data: any) => void;
  reportMonth: string | null;
  setReportMonth: (month: string | null) => void;
}

export const Reports = ({
  settings,
  reportView,
  setReportView,
  categories,
  transactions,
  chartData,
  handleChartClick,
  reportMonth,
  setReportMonth
}: ReportsProps) => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Análise Detalhada</h3>
          <p className="text-sm text-slate-500">Relatórios gerados com base no ano fiscal {settings.fiscalYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setReportView('charts')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                reportView === 'charts' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Gráficos
            </button>
            <button 
              onClick={() => setReportView('table')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                reportView === 'table' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Tabela
            </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      {reportView === 'charts' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <h4 className="text-lg font-bold mb-6">Gastos por Categoria</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.filter(c => c.type === 'expense').map(cat => ({
                        name: cat.name,
                        value: transactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                      })).filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categories.filter(c => c.type === 'expense').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <h4 className="text-lg font-bold mb-6">Comparativo de Fluxo</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} onClick={handleChartClick}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    <Bar dataKey="renda" fill="#1152d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Transactions for the selected month in Reports */}
          {reportMonth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Transações de {format(parseISO(`${reportMonth}-01`), 'MMMM yyyy', { locale: ptBR })}</h4>
                  <p className="text-xs text-slate-500 font-medium">Lista detalhada de entradas e saídas do período</p>
                </div>
                <button 
                  onClick={() => setReportMonth(null)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
                >
                  Limpar Filtro
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions
                      .filter(tx => format(parseISO(tx.date), 'yyyy-MM') === reportMonth)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-400">
                            {format(parseISO(tx.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {tx.description}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {tx.category}
                            </span>
                          </td>
                          <td className={cn(
                            "px-4 py-3 text-sm font-black text-right",
                            tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Período</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entradas</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Saídas</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {chartData.map((data, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6 text-sm font-bold">{data.name}</td>
                    <td className="px-8 py-6 text-sm font-bold text-emerald-500">{formatCurrency(data.renda)}</td>
                    <td className="px-8 py-6 text-sm font-bold text-rose-500">{formatCurrency(data.despesa)}</td>
                    <td className={cn(
                      "px-8 py-6 text-sm font-black",
                      data.renda - data.despesa >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {formatCurrency(data.renda - data.despesa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
