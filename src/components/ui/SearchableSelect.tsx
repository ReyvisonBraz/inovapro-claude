import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  onAdd?: (name: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  onAdd,
  placeholder = "Selecione...",
  label,
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value || opt.label === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAdd = () => {
    if (onAdd && searchTerm.trim()) {
      onAdd(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-1 block">
          {label}
        </label>
      )}
      
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10",
          className?.split(' ').filter(c => c.startsWith('h-')),
          !className?.includes('h-') && "h-12",
          isOpen && "ring-2 ring-primary/50 border-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn("text-sm font-medium truncate", !selectedOption && "text-slate-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-bottom border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredOptions.length === 0 && onAdd) {
                    handleAdd();
                  }
                }}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-white/10",
                    (opt.value === value || opt.label === value) ? "bg-primary/20 text-primary" : "text-slate-300"
                  )}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">Nenhum resultado encontrado</p>
                {onAdd && searchTerm.trim() && (
                  <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={14} />
                    Adicionar "{searchTerm}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
