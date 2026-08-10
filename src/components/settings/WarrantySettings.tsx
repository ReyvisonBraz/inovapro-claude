import React from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import type { AppSettings } from '../../types';

interface WarrantySettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void | Promise<unknown>;
}

export const WarrantySettings: React.FC<WarrantySettingsProps> = ({ settings, onUpdateSettings }) => {
  const [months, setMonths] = React.useState(String(settings.warrantyDefaultMonths ?? 3));
  const [isSaving, setIsSaving] = React.useState(false);
  const numericMonths = Number(months);
  const isValid = Number.isInteger(numericMonths) && numericMonths >= 0;

  React.useEffect(() => {
    setMonths(String(settings.warrantyDefaultMonths ?? 3));
  }, [settings.warrantyDefaultMonths]);

  const save = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onUpdateSettings({ warrantyDefaultMonths: numericMonths }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">Configuração de Garantia</h4>
        <p className="text-xs text-slate-500 mt-2">Defina a validade aplicada automaticamente aos serviços e peças quando a OS for concluída.</p>
      </div>

      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={19} />
          </div>
          <div>
            <label htmlFor="warranty-default-months" className="text-sm font-black text-white">Meses de garantia padrão</label>
            <p className="text-xs text-slate-500 mt-1">Este período será usado nas próximas garantias geradas.</p>
          </div>
        </div>
        <input
          id="warranty-default-months"
          type="number"
          min="0"
          step="1"
          value={months}
          onChange={(event) => setMonths(event.target.value)}
          className="w-full h-12 bg-bg-dark/40 border border-white/10 rounded-xl px-4 text-sm font-bold text-slate-200 focus:ring-1 focus:ring-primary outline-none"
        />
        {!isValid && <p className="text-xs font-bold text-rose-400">Informe um número inteiro igual ou maior que zero.</p>}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={isSaving || !isValid}
        className="w-full h-12 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar configuração de garantia'}
      </button>
    </div>
  );
};
