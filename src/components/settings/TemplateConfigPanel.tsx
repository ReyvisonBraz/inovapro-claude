import React from 'react';
import { Save, Printer, RotateCcw, Info } from 'lucide-react';
import type { OSLayoutConfig } from '../../types';
import { LAYOUT_REGISTRY, type LayoutRegistryKey } from '../../lib/osTemplateConfig';

type LayoutRegistryEntry = typeof LAYOUT_REGISTRY[LayoutRegistryKey];
import { ColorField, ToggleRow } from './osTemplateComponents';

const FONT_OPTIONS = [
  { label: 'Segoe UI (padrão)', value: "'Segoe UI', Arial, sans-serif" },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
];

interface TemplateConfigPanelProps {
  currentConfig: OSLayoutConfig;
  registryEntry: LayoutRegistryEntry;
  isBlank: boolean;
  onUpdateLayout: (updates: Partial<OSLayoutConfig>) => void;
  onSave: () => void;
  onReset: () => void;
  onPrintSample: () => void;
}

export function TemplateConfigPanel({
  currentConfig,
  registryEntry,
  isBlank,
  onUpdateLayout,
  onSave,
  onReset,
  onPrintSample,
}: TemplateConfigPanelProps) {
  return (
    <div className="space-y-5">
      {!isBlank && currentConfig && (
        <>
          <div className="border-t border-white/5 pt-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cores</p>
            <ColorField label="Cor Principal (fundo dos cabeçalhos)" value={currentConfig.primaryColor} onChange={v => onUpdateLayout({ primaryColor: v })} />
            <ColorField label="Cor de Destaque (títulos das seções)" value={currentConfig.accentColor} onChange={v => onUpdateLayout({ accentColor: v })} />
          </div>

          <div className="border-t border-white/5 pt-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipografia</p>
            <select
              value={currentConfig.fontFamily}
              onChange={e => onUpdateLayout({ fontFamily: e.target.value })}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tamanho da Fonte</p>
                <span className="text-xs font-black text-primary">{(currentConfig.fontSize ?? registryEntry.fontSize).toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min={registryEntry.fontSizeMin}
                max={registryEntry.fontSizeMax}
                step={0.5}
                value={currentConfig.fontSize ?? registryEntry.fontSize}
                onChange={e => onUpdateLayout({ fontSize: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[9px] text-slate-600 font-bold mt-0.5">
                <span>{registryEntry.fontSizeMin}px</span>
                <span>{registryEntry.fontSizeMax}px</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Espaçamento</p>
              <div className="flex gap-1">
                {(['compact', 'normal', 'spacious'] as const).map(sp => (
                  <button
                    key={sp}
                    onClick={() => onUpdateLayout({ spacing: sp })}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all border ${
                      (currentConfig.spacing ?? 'normal') === sp
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {sp === 'compact' ? 'Compacto' : sp === 'normal' ? 'Normal' : 'Espaçoso'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Rodapé e Extras</p>
            <ToggleRow label="QR Code do Técnico" checked={currentConfig.showQrTech} onChange={v => onUpdateLayout({ showQrTech: v })} />
            <ToggleRow label="QR Code do Cliente" checked={currentConfig.showQrClient} onChange={v => onUpdateLayout({ showQrClient: v })} />
            <ToggleRow label="Aviso de Retirada (30d)" checked={currentConfig.showWarning} onChange={v => onUpdateLayout({ showWarning: v })} />
          </div>
        </>
      )}

      {isBlank && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center space-y-2">
          <Info size={20} className="text-slate-500 mx-auto" />
          <p className="text-sm font-bold text-slate-300">Ficha em Branco</p>
          <p className="text-xs text-slate-500">
            Este layout gera um formulário vazio para preenchimento manual — não possui seções configuráveis.
            O nome da empresa e o logo vêm das configurações gerais.
          </p>
        </div>
      )}

      <div className="border-t border-white/5 pt-5 flex flex-col gap-2">
        {!isBlank && (
          <button onClick={onSave} className="w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Save size={15} /> Salvar Template
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onPrintSample} className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
            <Printer size={13} /> Imprimir Exemplo
          </button>
          {!isBlank && (
            <button onClick={onReset} className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all" title="Restaurar configurações padrão">
              <RotateCcw size={13} /> Restaurar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}