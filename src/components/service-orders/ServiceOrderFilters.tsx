import React from 'react';
import { Search, Filter, LayoutGrid, LayoutList, ChevronDown, Calendar, Briefcase } from 'lucide-react';
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
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showColumnConfig: boolean;
  setShowColumnConfig: (show: boolean) => void;
  visibleColumns: any;
  setVisibleColumns: (columns: any) => void;
  filteredOrdersCount: number;
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
  viewMode,
  setViewMode,
  showColumnConfig,
  setShowColumnConfig,
  visibleColumns,
  setVisibleColumns,
  filteredOrdersCount
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por cliente, equipamento ou problema..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
              )}
            >
              <LayoutList size={18} />
            </button>
          </div>

          <div className="relative shrink-0">
            <button 
              onClick={() => setShowColumnConfig(!showColumnConfig)}
              className={cn(
                "h-11 px-4 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all",
                showColumnConfig ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              <Filter size={16} />
              Colunas
              <ChevronDown size={14} className={cn("transition-transform", showColumnConfig && "rotate-180")} />
            </button>

            {showColumnConfig && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-modal p-4 z-[60] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Configurar Colunas</p>
                <div className="space-y-2">
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          checked={value as boolean}
                          onChange={() => setVisibleColumns({ ...visibleColumns, [key]: !value })}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-slate-600 rounded-md peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                        {key === 'id' ? 'ID da OS' : 
                         key === 'status' ? 'Status' : 
                         key === 'priority' ? 'Prioridade' : 
                         key === 'entryDate' ? 'Entrada' : 
                         key === 'prediction' ? 'Previsão' : 'Total'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Filter size={14} className="text-slate-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">Todos os Status</option>
            {statuses.map(s => (
              <option key={s.id} value={s.name} className="bg-slate-900">{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Briefcase size={14} className="text-slate-500" />
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">Todas Prioridades</option>
            <option value="low" className="bg-slate-900">Baixa</option>
            <option value="medium" className="bg-slate-900">Média</option>
            <option value="high" className="bg-slate-900">Alta</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Calendar size={14} className="text-slate-500" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">Qualquer Data</option>
            <option value="today" className="bg-slate-900">Hoje</option>
            <option value="week" className="bg-slate-900">Esta Semana</option>
            <option value="month" className="bg-slate-900">Este Mês</option>
          </select>
        </div>

        <div className="ml-auto text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {filteredOrdersCount} Ordens encontradas
        </div>
      </div>
    </div>
  );
};
