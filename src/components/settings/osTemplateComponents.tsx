import React, { useRef } from 'react';

export function useTextareaCursor(ref: React.RefObject<HTMLTextAreaElement | null>) {
  const posRef = useRef<number | null>(null);

  const scheduleRestore = (pos: number) => { posRef.current = pos; };

  React.useEffect(() => {
    if (posRef.current !== null && ref.current) {
      const pos = posRef.current;
      ref.current.selectionStart = pos;
      ref.current.selectionEnd   = pos;
      ref.current.focus();
      posRef.current = null;
    }
  });

  return scheduleRestore;
}

export function PreviewFrame({ html, nW, nH, scale }: { html: string; nW: number; nH: number; scale: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  React.useEffect(() => { if (ref.current) ref.current.srcdoc = html; }, [html]);

  return (
    <div
      className="rounded-lg overflow-hidden mx-auto"
      style={{ width: Math.round(nW * scale), height: Math.round(nH * scale), boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: '#fff', flexShrink: 0 }}
    >
      <iframe
        ref={ref}
        title="preview"
        style={{ width: nW, height: nH, border: 'none', transformOrigin: '0 0', transform: `scale(${scale})`, pointerEvents: 'none', display: 'block' }}
      />
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5 flex-shrink-0"
        title={label}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
    </div>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${checked ? 'bg-primary' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}