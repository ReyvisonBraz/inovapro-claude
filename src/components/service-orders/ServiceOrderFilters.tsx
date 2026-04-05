import React from 'react';
import { Search, Filter, LayoutGrid, LayoutList, ChevronDown, Calendar, Briefcase, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ServiceOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statuses: any[];
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showColumnConfig: boolean;
  setShowColumnConfig: (show: boolean) => void;
  visibleColumns: any;
  setVisibleColumns: (columns: any) => void;
  filteredOrdersCount: number;
  onClearFilters: () => void;
}

export const ServiceOrderFilters: React.FC<ServiceOrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  statuses,
  priorityFilter,
  setPriorityFilter,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showColumnConfig,
  setShowColumnConfig,
  visibleColumns,
  setVisibleColumns,
  filteredOrdersCount,
  onClearFilters
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Search and View Mode Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por Nº da OS, cliente, equipamento, problema..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
              title="Visualização em Grade"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
              title="Visualização em Lista"
            >
              <LayoutList size={18} />
            </button>
          </div>

          <div className="relative shrink-0">
            <button 
              onClick={() => setShowColumnConfig(!showColumnConfig)}
              className={cn(
                "h-12 px-5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all",
                showColumnConfig ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              <Filter size={16} />
              Colunas
              <ChevronDown size={14} className={cn("transition-transform duration-200", showColumnConfig && "rotate-180")} />
            </button>

            {showColumnConfig && (
              <div className="absolute right-0 top-full mt-2 w-64 glass-modal p-4 z-[60] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configurar Colunas</p>
                  <button onClick={() => setShowColumnConfig(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          checked={value as boolean}
                          onChange={() => setVisibleColumns({ ...visibleColumns, [key]: !value })}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-slate-600 rounded-lg peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                          <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                        {key === 'id' ? 'ID da OS' : 
                         key === 'status' ? 'Status' : 
                         key === 'priority' ? 'Prioridade' : 
                         key === 'entryDate' ? 'Data de Entrada' : 
                         key === 'prediction' ? 'Previsão de Entrega' : 'Valor Total'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <Filter size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filtros</span>
        </div>

        <label className="relative flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group min-w-[140px]">
          <div className="flex flex-col w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary/70 leading-none mb-1 transition-colors">Status</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                {statusFilter === 'all' ? 'Todos os Status' : statusFilter}
              </span>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Todos os Status</option>
            {statuses.map(s => (
              <option key={s.id} value={s.name} className="bg-slate-900 text-white">{s.name}</option>
            ))}
          </select>
        </label>

        <label className="relative flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group min-w-[140px]">
          <div className="flex flex-col w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary/70 leading-none mb-1 transition-colors">Prioridade</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                {priorityFilter === 'all' ? 'Todas Prioridades' : 
                 priorityFilter === 'low' ? 'Baixa' : 
                 priorityFilter === 'medium' ? 'Média' : 'Alta'}
              </span>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Todas Prioridades</option>
            <option value="low" className="bg-slate-900 text-white">Baixa</option>
            <option value="medium" className="bg-slate-900 text-white">Média</option>
            <option value="high" className="bg-slate-900 text-white">Alta</option>
          </select>
        </label>

        <label className="relative flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group min-w-[140px]">
          <div className="flex flex-col w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary/70 leading-none mb-1 transition-colors">Período</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                {dateFilter === 'all' ? 'Todo o Período' : 
                 dateFilter === 'today' ? 'Hoje' : 
                 dateFilter === 'week' ? 'Últimos 7 Dias' : 'Este Mês'}
              </span>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Todo o Período</option>
            <option value="today" className="bg-slate-900 text-white">Hoje</option>
            <option value="week" className="bg-slate-900 text-white">Últimos 7 Dias</option>
            <option value="month" className="bg-slate-900 text-white">Este Mês</option>
          </select>
        </label>

        <label className="relative flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group min-w-[140px]">
          <div className="flex flex-col w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary/70 leading-none mb-1 transition-colors">Ordenar por</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                {sortBy === 'newest' ? 'Mais Recentes' : 
                 sortBy === 'oldest' ? 'Mais Antigas' : 
                 sortBy === 'priority' ? 'Maior Prioridade' : 
                 sortBy === 'prediction' ? 'Previsão mais Próxima' : 
                 sortBy === 'amount-desc' ? 'Maior Valor' : 'Menor Valor'}
              </span>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="newest" className="bg-slate-900 text-white">Mais Recentes</option>
            <option value="oldest" className="bg-slate-900 text-white">Mais Antigas</option>
            <option value="priority" className="bg-slate-900 text-white">Maior Prioridade</option>
            <option value="prediction" className="bg-slate-900 text-white">Previsão mais Próxima</option>
            <option value="amount-desc" className="bg-slate-900 text-white">Maior Valor</option>
            <option value="amount-asc" className="bg-slate-900 text-white">Menor Valor</option>
          </select>
        </label>

        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all') && (
          <button 
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-2 ml-2"
          >
            <X size={14} />
            Limpar
          </button>
        )}

        <div className="ml-auto flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Resultados</span>
            <span className="text-xs font-black text-white leading-none">
              {filteredOrdersCount} <span className="text-slate-500 font-bold">OS</span>
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
