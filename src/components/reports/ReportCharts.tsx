import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  AreaChart, Area,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const tooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 };
const itemStyle = { color: '#f1f5f9' };

export const ReportCharts: React.FC<{
  monthlyBarData: Record<string, unknown>[];
  categoryPieData: Record<string, unknown>[];
  trendLineData: Record<string, unknown>[];
  cashFlowData: Record<string, unknown>[];
}> = ({ monthlyBarData, categoryPieData, trendLineData, cashFlowData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-primary" />Receitas vs Despesas
      </h4>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyBarData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} />
            <Legend />
            <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
        <PieChartIcon size={20} className="text-primary" />Por Categoria
      </h4>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {categoryPieData.map((entry, index) => (<Cell key={index} fill={entry.color as string} />))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-primary" />Tendência de Saldo
      </h4>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendLineData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="cumulative" name="Saldo Acumulado" stroke="#1152d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-primary" />Fluxo de Caixa
      </h4>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="income" name="Receitas" fill="#10b981" fillOpacity={0.2} stroke="#10b981" />
            <Area type="monotone" dataKey="expense" name="Despesas" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>
);