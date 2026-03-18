import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, TrendingDown, Wallet, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';
import { StatCard } from './StatCard';
import { formatCurrency, formatMonthYear } from '../lib/utils';

interface DashboardProps {
  settings: {
    initialBalance: number;
  };
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  chartData: any[];
  handleChartClick: (data: any) => void;
  dashboardMonth: string;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  sortedIncomeRanking: [string, number][];
  sortedExpenseRanking: [string, number][];
}

export const Dashboard = ({
  settings,
  totalIncome,
  totalExpenses,
  netBalance,
  chartData,
  handleChartClick,
  dashboardMonth,
  handlePrevMonth,
  handleNextMonth,
  sortedIncomeRanking,
  sortedExpenseRanking
}: DashboardProps) => {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Saldo Inicial" 
          value={settings.initialBalance} 
          change="Configurado" 
          trend="up" 
          icon={Briefcase} 
          color="bg-slate-500/10 text-slate-500"
        />
        <StatCard 
          title="Renda Total" 
          value={totalIncome} 
          change="+12.4%" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard 
          title="Despesas Totais" 
          value={totalExpenses} 
          change="-5.2%" 
          trend="down" 
          icon={TrendingDown} 
          color="bg-rose-500/10 text-rose-500"
        />
        <StatCard 
          title="Saldo Líquido" 
          value={netBalance} 
          change="+18.1%" 
          trend="up" 
          icon={Wallet} 
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Tendência de Fluxo de Caixa</h4>
              <p className="text-xs text-slate-500 font-medium">Desempenho de flutuação mensal</p>
            </div>
            <select className="bg-slate-800 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900">
              <option>Últimos 12 Meses</option>
              <option>Últimos 6 Meses</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} onClick={handleChartClick}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="renda" 
                  stroke="#1152d4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Comparação Mensal</h4>
              <p className="text-xs text-slate-500 font-medium">Detalhamento de Renda vs Despesas</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-slate-400">Renda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/10"></span>
                <span className="text-slate-400">Despesa</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="renda" fill="#1152d4" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="despesa" fill="#ffffff10" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Rankings Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Ranking de Entradas</h4>
              <p className="text-xs text-slate-500 font-medium">Categorias mais rentáveis</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                {formatMonthYear(dashboardMonth)}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {sortedIncomeRanking.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{category}</span>
                    <span className="text-sm font-black text-emerald-500">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((amount as number) / Math.max(...sortedIncomeRanking.map(([, a]) => a as number))) * 100}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {sortedIncomeRanking.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma entrada registrada para este mês.</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Ranking de Saídas</h4>
              <p className="text-xs text-slate-500 font-medium">Maiores despesas por categoria</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest min-w-[100px] text-center">
                {formatMonthYear(dashboardMonth)}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {sortedExpenseRanking.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{category}</span>
                    <span className="text-sm font-black text-rose-500">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((amount as number) / Math.max(...sortedExpenseRanking.map(([, a]) => a as number))) * 100}%` }}
                      className="h-full bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {sortedExpenseRanking.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-10">Nenhuma saída registrada para este mês.</p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};
