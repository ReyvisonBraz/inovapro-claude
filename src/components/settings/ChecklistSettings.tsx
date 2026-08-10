import React from 'react';
import { Check, Plus, Save, Trash2, X } from 'lucide-react';
import type { AppSettings, ChecklistTemplate } from '../../types';

interface ChecklistSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void | Promise<unknown>;
}

type TemplateSide = keyof ChecklistTemplate;

const EMPTY_TEMPLATE: ChecklistTemplate = { entrada: [], saida: [] };

const cloneTemplate = (template?: ChecklistTemplate): ChecklistTemplate => ({
  entrada: (template?.entrada ?? []).map((item) => ({ ...item })),
  saida: (template?.saida ?? []).map((item) => ({ ...item })),
});

export const ChecklistSettings: React.FC<ChecklistSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [template, setTemplate] = React.useState<ChecklistTemplate>(() => cloneTemplate(settings.checklistTemplate));
  const [statuses, setStatuses] = React.useState<string[]>(() => settings.deductStockStatuses ?? ['Concluído', 'Entregue', 'Pronto']);
  const [newStatus, setNewStatus] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setTemplate(cloneTemplate(settings.checklistTemplate ?? EMPTY_TEMPLATE));
    setStatuses(settings.deductStockStatuses ?? ['Concluído', 'Entregue', 'Pronto']);
  }, [settings.checklistTemplate, settings.deductStockStatuses]);

  const addItem = (side: TemplateSide) => {
    setTemplate((current) => ({
      ...current,
      [side]: [...current[side], { label: '', defaultValue: false }],
    }));
  };

  const updateItem = (
    side: TemplateSide,
    index: number,
    update: Partial<ChecklistTemplate[TemplateSide][number]>,
  ) => {
    setTemplate((current) => ({
      ...current,
      [side]: current[side].map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item),
    }));
  };

  const removeItem = (side: TemplateSide, index: number) => {
    setTemplate((current) => ({
      ...current,
      [side]: current[side].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addStatus = () => {
    const status = newStatus.trim();
    if (!status || statuses.includes(status)) return;
    setStatuses((current) => [...current, status]);
    setNewStatus('');
  };

  const save = async () => {
    const normalizedTemplate: ChecklistTemplate = {
      entrada: template.entrada
        .map((item) => ({ ...item, label: item.label.trim() }))
        .filter((item) => item.label),
      saida: template.saida
        .map((item) => ({ ...item, label: item.label.trim() }))
        .filter((item) => item.label),
    };
    const normalizedStatuses = [...new Set(statuses.map((status) => status.trim()).filter(Boolean))];

    setIsSaving(true);
    try {
      await Promise.resolve(onUpdateSettings({
        checklistTemplate: normalizedTemplate,
        deductStockStatuses: normalizedStatuses,
      }));
      setTemplate(normalizedTemplate);
      setStatuses(normalizedStatuses);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTemplateEditor = (side: TemplateSide, title: string, description: string) => (
    <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h5 className="text-sm font-black text-white">{title}</h5>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => addItem(side)}
          className="h-10 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-2 hover:bg-primary/20 transition-all"
        >
          <Plus size={15} /> Item
        </button>
      </div>

      <div className="space-y-3">
        {template[side].length === 0 && (
          <div className="py-6 text-center text-xs text-slate-600 border border-dashed border-white/10 rounded-xl">
            Nenhum item configurado.
          </div>
        )}
        {template[side].map((item, index) => (
          <div key={`${side}-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center">
            <input
              value={item.label}
              onChange={(event) => updateItem(side, index, { label: event.target.value })}
              placeholder="Ex: Tela sem avarias"
              className="w-full h-11 bg-bg-dark/40 border border-white/10 rounded-xl px-4 text-sm font-bold text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary outline-none"
            />
            <label className="h-11 px-3 flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={item.defaultValue ?? false}
                onChange={(event) => updateItem(side, index, { defaultValue: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-bg-dark"
              />
              <Check size={14} className="text-emerald-400" /> Marcado
            </label>
            <button
              type="button"
              onClick={() => removeItem(side, index)}
              className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              aria-label={`Remover ${item.label || 'item'}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">Checklist da Ordem de Serviço</h4>
        <p className="text-xs text-slate-500 mt-2">Defina os itens apresentados na entrada e na saída do equipamento.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {renderTemplateEditor('entrada', 'Checklist de entrada', 'Usado enquanto a OS estiver em um status não conclusivo.')}
        {renderTemplateEditor('saida', 'Checklist de saída', 'Usado quando a OS estiver em um dos status conclusivos.')}
      </div>

      <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/5">
        <div>
          <h5 className="text-sm font-black text-white">Status conclusivos</h5>
          <p className="text-xs text-slate-500 mt-1">Estes status ativam o checklist de saída e a baixa de estoque.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <span key={status} className="h-9 pl-3 pr-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
              {status}
              <button
                type="button"
                onClick={() => setStatuses((current) => current.filter((item) => item !== status))}
                className="p-1 rounded-lg hover:bg-white/10"
                aria-label={`Remover status ${status}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addStatus();
              }
            }}
            placeholder="Ex: Finalizado"
            className="flex-1 h-11 bg-bg-dark/40 border border-white/10 rounded-xl px-4 text-sm font-bold text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            type="button"
            onClick={addStatus}
            className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Plus size={15} /> Adicionar status
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="w-full h-12 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar checklist e status'}
      </button>
    </div>
  );
};
