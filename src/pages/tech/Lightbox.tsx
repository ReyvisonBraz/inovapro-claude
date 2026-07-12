import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LightboxProps {
  photos: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}

export function Lightbox({ photos, index, onClose, onChange }: LightboxProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onChange]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-xs font-bold text-slate-400">{index + 1} / {photos.length}</span>
        <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 min-h-0" onClick={e => e.stopPropagation()}>
        <img src={photos[index]} alt={`Foto ${index + 1}`} className="max-h-full max-w-full object-contain rounded-xl" style={{ userSelect: 'none' }} />
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onChange(index - 1)} disabled={index === 0} className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => onChange(i)} className={cn("h-2 w-2 rounded-full transition-all", i === index ? "bg-primary w-5" : "bg-white/30")} />
            ))}
          </div>
          <button onClick={() => onChange(index + 1)} disabled={index === photos.length - 1} className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}