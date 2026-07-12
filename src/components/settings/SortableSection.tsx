import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { OSSection } from '../../types';
import { TEMPLATE_CAPABLE_IDS, PLACEHOLDER_GROUPS } from '../../lib/osTemplateConfig';

interface SortableSectionProps {
  section: OSSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggle: () => void;
  onTemplateChange: (template: string) => void;
  onFontScaleChange: (scale: 'small' | 'normal' | 'large') => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsertPlaceholder: (key: string) => void;
}

export function SortableSection({
  section, isExpanded, onToggleExpand, onToggle,
  onTemplateChange, onFontScaleChange, textareaRef, onInsertPlaceholder,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const capable = TEMPLATE_CAPABLE_IDS.has(section.id);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5">
        <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" tabIndex={-1}>
          <GripVertical size={15} />
        </button>

        <span className={`flex-1 text-sm font-bold truncate ${section.visible ? 'text-slate-200' : 'text-slate-600 line-through'}`}>
          {section.label}
        </span>

        {capable && (
          <button onClick={onToggleExpand} className="text-slate-500 hover:text-slate-300 flex-shrink-0 transition-colors" title={isExpanded ? 'Fechar editor' : 'Editar template'}>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        <button
          onClick={onToggle}
          className={`flex-shrink-0 transition-colors ${section.visible ? 'text-primary hover:text-primary/70' : 'text-slate-600 hover:text-slate-400'}`}
          title={section.visible ? 'Ocultar seção' : 'Mostrar seção'}
        >
          {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-950/60 border-t border-white/5 p-3 space-y-3">
          {capable ? (
            <>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Tamanho do Texto</p>
                <div className="flex gap-1">
                  {(['small', 'normal', 'large'] as const).map(scale => (
                    <button
                      key={scale}
                      onClick={() => onFontScaleChange(scale)}
                      className={`flex-1 h-7 rounded-lg text-[10px] font-bold transition-all border ${
                        (section.fontScale ?? 'normal') === scale
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {scale === 'small' ? 'A↓ Pequeno' : scale === 'normal' ? 'A Normal' : 'A↑ Grande'}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={section.template}
                onChange={e => onTemplateChange(e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="Digite o conteúdo. Use {{placeholder}} para inserir campos."
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 resize-y focus:ring-1 focus:ring-primary outline-none leading-relaxed placeholder:text-slate-600"
              />

              <div className="space-y-2">
                {PLACEHOLDER_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map(item => (
                        <button
                          key={item.key}
                          onClick={() => onInsertPlaceholder(item.key)}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                          title={`Inserir {{${item.key}}}`}
                        >
                          {`{{${item.key}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 text-slate-500">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs">Esta seção é gerada automaticamente (tabela ou total) — controle apenas a visibilidade.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}