import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { format, parseISO, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wrench, Package, TrendingUp, Calendar, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { ServiceOrder, InventoryItem } from '../../types';

interface OSReportsProps {
  serviceOrders: ServiceOrder[];
  inventoryItems: InventoryItem[];
}

const COLORS = ['#1152d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#0ea5e9', '#84cc16'];

type Period = '3m' | '6m' | '12m';

export const OSReports: React.FC<OSReportsProps> = ({ serviceOrders, inventoryItems }) => {
  const [period, setPeriod] = useState<Period>('3m');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'parts' | 'equipment'>('overview');

  const dateRange = useMemo(() => {
    const end = new Date();
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const start = subMonths(end, months);
    return { start, end };
  }, [period]);

  const prevDateRange = useMemo(() => {
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const end = subMonths(dateRange.start, 0);
    const start = subMonths(dateRange.start, months);
    return { start, end };
  }, [dateRange, period]);

  const filtered = useMemo(() => serviceOrders.filter(os => {
    try {
      const d = parseISO(os.createdAt);
      return isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
    } catch { return false; }
  }), [serviceOrders, dateRange]);

  const prevFiltered = useMemo(() => serviceOrders.filter(os => {
    try {
      const d = parseISO(os.createdAt);
      return isWithinInterval(d, { start: prevDateRange.start, end: prevDateRange.end });
    } catch { return false; }
  }), [serviceOrders, prevDateRange]);

  // KPIs
  const kpis = useMemo(() => {
    const totalRevenue = filtered.reduce((s, os) => s + (os.totalAmount || 0), 0);
    const prevRevenue = prevFiltered.reduce((s, os) => s + (os.totalAmount || 0), 0);
    const revTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const avgTicket = filtered.length > 0 ? totalRevenue / filtered.length : 0;
    const prevAvg = prevFiltered.length > 0 ? prevFiltered.reduce((s, os) => s + (os.totalAmount || 0), 0) / prevFiltered.length : 0;

    const countTrend = prevFiltered.length > 0 ? ((filtered.length - prevFiltered.length) / prevFiltered.length) * 100 : 0;

    return { totalRevenue, prevRevenue, revTrend, avgTicket, prevAvg, countTrend };
  }, [filtered, prevFiltered]);

  // OS por mês
  const monthlyData = useMemo(() => {
    const months: Record<string, { count: number; revenue: number; prevCount: number; prevRevenue: number }> = {};
    const numMonths = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const key = format(d, 'yyyy-MM');
      months[key] = { count: 0, revenue: 0, prevCount: 0, prevRevenue: 0 };
    }
    filtered.forEach(os => {
      try {
        const key = os.createdAt.substring(0, 7);
        if (months[key]) {
          months[key].count++;
          months[key].revenue += os.totalAmount || 0;
        }
      } catch {}
    });
    return Object.entries(months).map(([month, d]) => ({
      month: format(parseISO(`${month}-01`), 'MMM', { locale: ptBR }).toUpperCase(),
      ...d
    }));
  }, [filtered, period]);

  // Top serviços realizados
  const topServices = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.forEach(os => {
      (os.services || []).forEach(s => {
        if (!map[s.name]) map[s.name] = { count: 0, revenue: 0 };
        map[s.name].count++;
        map[s.name].revenue += s.price || 0;
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  // Top peças usadas
  const topParts = useMemo(() => {
    const map: Record<string, { count: number; qty: number; revenue: number }> = {};
    filtered.forEach(os => {
      (os.partsUsed || []).forEach(p => {
        if (!map[p.name]) map[p.name] = { count: 0, qty: 0, revenue: 0 };
        map[p.name].count++;
        map[p.name].qty += p.quantity || 1;
        map[p.name].revenue += p.subtotal || 0;
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [filtered]);

  // Top tipos de equipamento
  const topEquipment = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.forEach(os => {
      const key = os.equipmentType || 'Não informado';
      if (!map[key]) map[key] = { count: 0, revenue: 0 };
      map[key].count++;
      map[key].revenue += os.totalAmount || 0;
    });
    return Object.entries(map)
      .map(([name, d], i) => ({ name, ...d, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Top marcas
  const topBrands = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(os => {
      const key = os.equipmentBrand || 'Não informado';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count], i) => ({ name, count, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filtered]);

  // Status distribution
  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(os => { map[os.status] = (map[os.status] || 0) + 1; });
    return Object.entries(map)
      .map(([name, count], i) => ({ name, count, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Mês atual vs anterior
  const currentMonth = format(new Date(), 'yyyy-MM');
  const prevMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
  const currentMonthOS = serviceOrders.filter(os => os.createdAt?.startsWith(currentMonth));
  const prevMonthOS = serviceOrders.filter(os => os.createdAt?.startsWith(prevMonth));
  const currentRev = currentMonthOS.reduce((s, os) => s + (os.totalAmount || 0), 0);
  const prevRev = prevMonthOS.reduce((s, os) => s + (os.totalAmount || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'services', label: 'Serviços' },
    { id: 'parts', label: 'Peças' },
    { id: 'equipment', label: 'Equipamentos' },
  ] as const;

  const Trend = ({ value }: { value: number }) => (
    <span className={cn('flex items-center gap-1 text-xs font-bold', value >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
      {value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(value).toFixed(1)}% vs período anterior
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><Wrench size={20} /></div>
            Relatórios de OS
          </h3>
          <p className="text-sm text-slate-500 mt-1">Análise completa de ordens de serviço, serviços e peças</p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          {(['3m', '6m', '12m'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-4 py-2 rounded-lg text-xs font-bold transition-all',
                period === p ? 'bg-primary text-white' : 'text-slate-400 hover:text-white')}>
              {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '12 meses'}
            </button>
          ))}
        </div>
      </div>

      {/* Comparativo mês atual vs anterior */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'OS este mês', current: currentMonthOS.length, prev: prevMonthOS.length, fmt: 'n' },
          { label: 'Receita este mês', current: currentRev, prev: prevRev, fmt: 'r' },
          { label: 'OS no período', current: filtered.length, prev: prevFiltered.length, fmt: 'n' },
          { label: 'Receita no período', current: kpis.totalRevenue, prev: kpis.prevRevenue, fmt: 'r' },
        ].map((item, i) => {
          const diff = item.prev > 0 ? ((item.current - item.prev) / item.prev) * 100 : 0;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 border-l-4 border-l-primary">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{item.label}</p>
              <p className="text-2xl font-black text-white">
                {item.fmt === 'r' ? formatCurrency(item.current) : item.current}
              </p>
              <div className="mt-2"><Trend value={diff} /></div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-white')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OS por mês */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                <Calendar size={16} /> OS por Mês
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
                    <Bar dataKey="count" name="Quantidade" fill="#1152d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Receita por mês */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                <TrendingUp size={16} /> Receita por Mês
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                      formatter={(v) => formatCurrency(Number(v))} />
                    <Line type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Status */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Status das OS</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDist} dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Ticket médio */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Ticket Médio por OS</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                      formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Receita Total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* TAB: Serviços */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                <Award size={16} /> Serviços Mais Realizados
              </h4>
              <div className="space-y-3">
                {topServices.slice(0, 8).map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{s.name}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(s.count / topServices[0]?.count) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black">{s.count}x</p>
                      <p className="text-xs text-slate-500">{formatCurrency(s.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topServices.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Nenhum serviço no período</p>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Receita por Serviço</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topServices.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff08" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                      formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* TAB: Peças */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                <Package size={16} /> Peças Mais Utilizadas
              </h4>
              <div className="space-y-3">
                {topParts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(p.qty / topParts[0]?.qty) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black">{p.qty} un</p>
                      <p className="text-xs text-slate-500">{formatCurrency(p.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topParts.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Nenhuma peça no período</p>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Distribuição de Peças</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topParts.slice(0, 8)} dataKey="qty" cx="50%" cy="50%" innerRadius={40} outerRadius={100} paddingAngle={3}>
                      {topParts.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* TAB: Equipamentos */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Tipos de Equipamento</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEquipment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
                    <Bar dataKey="count" name="Quantidade" radius={[4, 4, 0, 0]}>
                      {topEquipment.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Marcas Mais Atendidas</h4>
              <div className="space-y-3">
                {topBrands.map((b, i) => (
                  <div key={b.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: b.color }}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{b.name}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(b.count / topBrands[0]?.count) * 100}%`, backgroundColor: b.color }} />
                      </div>
                    </div>
                    <p className="text-sm font-black shrink-0">{b.count} OS</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 lg:col-span-2">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">
                Receita por Tipo de Equipamento
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEquipment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                      formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Receita" radius={[4, 4, 0, 0]}>
                      {topEquipment.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OSReports;
