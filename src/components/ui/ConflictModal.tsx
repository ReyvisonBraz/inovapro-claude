import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ConflictField {
  label: string;
  local: unknown;
  remote: unknown;
  field: string;
}

interface ConflictModalProps {
  isOpen: boolean;
  entityName: string;
  fields: ConflictField[];
  onOverwrite: () => void;
  onMerge: (merged: Record<string, unknown>) => void;
  onDiscard: () => void;
}

export function ConflictModal({
  isOpen,
  entityName,
  fields,
  onOverwrite,
  onMerge,
  onDiscard,
}: ConflictModalProps) {
  const [selected, setSelected] = useState<Record<string, 'local' | 'remote'>>({});

  if (!isOpen) return null;

  const getSelection = (field: string) => selected[field] ?? 'remote';

  const toggle = (field: string) => {
    setSelected((prev) => ({
      ...prev,
      [field]: prev[field] === 'local' ? 'remote' : 'local',
    }));
  };

  const handleMerge = () => {
    const merged: Record<string, unknown> = {};
    for (const f of fields) {
      merged[f.field] = getSelection(f.field) === 'local' ? f.local : f.remote;
    }
    onMerge(merged);
  };

  const formatValue = (v: unknown) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string' && v.length > 80) return v.slice(0, 80) + '...';
    return String(v);
  };

  return (
    <div className="modal-overlay" onClick={onDiscard}>
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Conflito detectado</h2>
              <p className="text-xs text-muted-foreground">
                {entityName} foi modificado por outro usuário enquanto você editava.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Escolha qual versão manter para cada campo:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {fields.map((f) => {
              const choice = getSelection(f.field);
              return (
                <div
                  key={f.field}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {f.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggle(f.field)}
                      className={cn(
                        'text-left p-2 rounded-lg border text-xs transition-all',
                        choice === 'local'
                          ? 'border-primary/40 bg-primary/5 text-white'
                          : 'border-white/5 bg-white/[0.01] text-muted-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1 mb-1">
                        <ArrowLeft className="h-3 w-3" />
                        Sua versão
                      </span>
                      <p className="truncate">{formatValue(f.local)}</p>
                    </button>
                    <button
                      onClick={() => toggle(f.field)}
                      className={cn(
                        'text-left p-2 rounded-lg border text-xs transition-all',
                        choice === 'remote'
                          ? 'border-primary/40 bg-primary/5 text-white'
                          : 'border-white/5 bg-white/[0.01] text-muted-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1 mb-1">
                        <ArrowRight className="h-3 w-3" />
                        Versão salva
                      </span>
                      <p className="truncate">{formatValue(f.remote)}</p>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleMerge}
              className="btn-primary flex-1 text-xs"
            >
              Salvar seleção
            </button>
            <button
              onClick={onOverwrite}
              className="btn-secondary flex-1 text-xs"
            >
              Sobrescrever tudo
            </button>
            <button
              onClick={onDiscard}
              className="btn-ghost flex-1 text-xs text-rose-400 hover:text-rose-300"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
