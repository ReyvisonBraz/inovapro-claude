import React from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickSaveFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onSave: (v: string) => Promise<void>;
}

export function QuickSaveField({ icon, label, placeholder, value, onSave }: QuickSaveFieldProps) {
  const [text, setText] = React.useState(value);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const dirty = text !== value;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          {icon} {label}
        </p>
        {saved && (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={11} /> Salvo
          </span>
        )}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-medium resize-none outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
      />
      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className={cn(
          "w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
          dirty && !saving
            ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-md shadow-primary/20"
            : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/10"
        )}
      >
        {saving ? (
          <span className="animate-pulse">Salvando...</span>
        ) : (
          <><Save size={13} /> Salvar {label}</>
        )}
      </button>
    </div>
  );
}