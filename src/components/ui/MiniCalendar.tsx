import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, isToday, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface MiniCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelect }) => {
  const parseSelected = () => {
    try { return selectedDate ? parseISO(selectedDate) : new Date(); } catch { return new Date(); }
  };

  const [viewDate, setViewDate] = useState(() => {
    const d = parseSelected();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    try {
      if (selectedDate) {
        const d = parseISO(selectedDate);
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    } catch {}
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(viewDate);
  const startWeekDay = startOfMonth(viewDate).getDay();
  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: ptBR });

  const handleDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onSelect(format(d, 'yyyy-MM-dd'));
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    try {
      return isSameDay(parseISO(selectedDate), new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    } catch { return false; }
  };

  const isTodayDay = (day: number) =>
    isToday(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));

  const cells: (number | null)[] = [
    ...Array(startWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs font-black tracking-wide capitalize text-slate-300">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="p-3 flex-1">
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-700 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => (
            <div key={i} className="flex items-center justify-center">
              {day ? (
                <button
                  type="button"
                  onClick={() => handleDay(day)}
                  className={cn(
                    'w-8 h-8 rounded-xl text-xs font-bold transition-all',
                    isSelectedDay(day)
                      ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110'
                      : isTodayDay(day)
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            onSelect(format(now, 'yyyy-MM-dd'));
          }}
          className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all border border-white/5"
        >
          Ir para hoje
        </button>
      </div>
    </div>
  );
};
