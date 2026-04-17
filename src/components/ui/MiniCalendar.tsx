import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, isToday, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface MiniCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKEND_DAYS = [0, 6];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelect, size = 'lg' }) => {
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

  const isWeekend = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return WEEKEND_DAYS.includes(d.getDay());
  };

  const cells: (number | null)[] = [
    ...Array(startWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const sizeClasses = {
    sm: {
      container: 'p-3',
      nav: 'p-1.5',
      navIcon: 16,
      header: 'text-base py-2',
      weekday: 'text-xs py-1.5',
      day: 'w-9 h-9 text-sm',
      footer: 'py-2 text-xs'
    },
    md: {
      container: 'p-4',
      nav: 'p-2',
      navIcon: 18,
      header: 'text-lg py-3',
      weekday: 'text-xs py-2',
      day: 'w-10 h-10 text-sm',
      footer: 'py-2.5 text-xs'
    },
    lg: {
      container: 'p-5',
      nav: 'p-2.5',
      navIcon: 20,
      header: 'text-xl py-3',
      weekday: 'text-xs py-2',
      day: 'w-12 h-12 text-base',
      footer: 'py-3 text-sm'
    }
  };

  const s = sizeClasses[size];

  return (
    <div className={cn("flex flex-col h-full", s.container)}>
      <div className={cn("flex items-center justify-between px-2 border-b border-white/5", s.header)}>
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className={cn(
            "hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all",
            s.nav
          )}
        >
          <ChevronLeft size={s.navIcon} />
        </button>
        <span className="font-black tracking-wide capitalize text-slate-200">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className={cn(
            "hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all",
            s.nav
          )}
        >
          <ChevronRight size={s.navIcon} />
        </button>
      </div>

      <div className={cn("flex-1", size === 'lg' ? 'pt-4' : 'pt-3')}>
        <div className={cn("grid grid-cols-7 mb-2")}>
          {WEEKDAYS.map((d, i) => (
            <div key={i} className={cn(
              "text-center font-bold uppercase tracking-wider",
              i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-500',
              s.weekday
            )}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1.5">
          {cells.map((day, i) => {
            const dayOfWeek = day !== null ? new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay() : null;
            const isSatSun = dayOfWeek !== null && WEEKEND_DAYS.includes(dayOfWeek);

            return (
              <div key={i} className="flex items-center justify-center">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDay(day)}
                    className={cn(
                      "rounded-xl font-bold transition-all flex items-center justify-center",
                      s.day,
                      isSelectedDay(day)
                        ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110'
                        : isTodayDay(day)
                        ? 'bg-white/15 text-white border-2 border-white/30'
                        : isSatSun
                        ? 'text-rose-400 hover:bg-rose-500/15'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {day}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn("px-2", size === 'lg' ? 'pt-4' : 'pt-3')}>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            onSelect(format(now, 'yyyy-MM-dd'));
          }}
          className={cn(
            "w-full rounded-xl font-bold uppercase tracking-wider text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10",
            s.footer
          )}
        >
          Hoje
        </button>
      </div>
    </div>
  );
};