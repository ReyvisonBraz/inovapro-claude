import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  limit: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit
}) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const pages = useMemo(() => {
    const items: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        items.push(i);
      }
      if (currentPage < totalPages - 2) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  // Early-return depois dos hooks (regra dos hooks: chamada incondicional).
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-xs text-slate-500 font-medium hidden sm:block">
        <span className="font-semibold text-slate-300">{startItem}</span> até{' '}
        <span className="font-semibold text-slate-300">{endItem}</span> de{' '}
        <span className="font-semibold text-slate-300">{totalItems}</span> resultados
      </p>

      <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`e-${idx}`} className="w-8 text-center text-xs text-slate-600 font-bold">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  currentPage === page
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
