import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft, Edit, Smartphone, Calendar, Clock, User,
  CheckCircle2, AlertTriangle, Image, X, ChevronLeft,
  ChevronRight, Save, Wrench, ClipboardList, Phone,
} from 'lucide-react';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

type OSData = {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: string;
  equipmentType: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  reportedProblem: string | null;
  technicalAnalysis: string | null;
  servicesPerformed: string | null;
  entryDate: string | null;
  analysisPrediction: string | null;
  createdAt: string;
  priority: string | null;
  arrivalPhotoUrls: string | null;
  arrivalPhotoBase64: string | null;
};

type StatusOption = { id: number; name: string; color: string };

function parsePhotos(raw: string | null | undefined): string[] {
  try {
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map((p: string | { base64: string }) =>
      typeof p === 'string' ? p : p.base64
    );
  } catch { return []; }
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
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
    <div
      className="fixed inset-0 z-[999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-xs font-bold text-slate-400">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* image */}
      <div
        className="flex-1 flex items-center justify-center px-4 min-h-0"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={photos[index]}
          alt={`Foto ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-xl"
          style={{ userSelect: 'none' }}
        />
      </div>

      {/* nav arrows */}
      {photos.length > 1 && (
        <div
          className="flex items-center justify-center gap-4 py-4 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onChange(index - 1)}
            disabled={index === 0}
            className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => onChange(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === index ? "bg-primary w-5" : "bg-white/30"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => onChange(index + 1)}
            disabled={index === photos.length - 1}
            className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Quick-save field ─────────────────────────────────────────────────────────
function QuickSaveField({
  icon,
  label,
  placeholder,
  value,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onSave: (v: string) => Promise<void>;
}) {
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
          {icon}
          {label}
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
          <>
            <Save size={13} />
            Salvar {label}
          </>
        )}
      </button>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export const TechOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setDirectOsId } = useAppStore();
  const { showToast } = useToast();

  const [order, setOrder] = React.useState<OSData | null>(null);
  const [statuses, setStatuses] = React.useState<StatusOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [lightbox, setLightbox] = React.useState<{ photos: string[]; index: number } | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [osRes, statusRes] = await Promise.all([
          api.get(`/service-orders/${id}`),
          api.get('/service-order-statuses'),
        ]);
        setOrder(osRes.data);
        setStatuses(statusRes.data || []);
      } catch {
        setError('Ordem de serviço não encontrada.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/service-orders/${order.id}`, { status: newStatus });
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      setSuccessMsg(`Status: "${newStatus}"`);
      showToast(`Status atualizado para "${newStatus}"`, 'success');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setSuccessMsg('Erro ao atualizar status.');
      showToast('Erro ao atualizar status', 'error');
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveField = async (field: string, value: string) => {
    if (!order) return;
    try {
      await api.put(`/service-orders/${order.id}`, { [field]: value });
      setOrder(prev => prev ? { ...prev, [field]: value } : prev);
      showToast('Salvo com sucesso!', 'success');
    } catch {
      showToast('Erro ao salvar', 'error');
    }
  };

  const handleOpenEdit = () => {
    if (!order) return;
    setDirectOsId(order.id);
    navigate('/ordens', { state: { directOsId: order.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-slate-400 text-sm font-medium animate-pulse">Carregando OS...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-rose-400 text-sm font-bold">{error || 'Ordem não encontrada'}</div>
        <button onClick={() => navigate('/ordens')} className="text-xs font-bold text-primary underline">
          Ir para Ordens de Serviço
        </button>
      </div>
    );
  }

  const currentStatus = statuses.find(s => s.name === order.status);
  const osNumber = `#OS-${order.id.toString().padStart(4, '0')}`;
  const isPastDeadline =
    order.analysisPrediction
    && new Date(order.analysisPrediction) < new Date()
    && order.status !== 'Concluído'
    && order.status !== 'Entregue';

  const photos = parsePhotos(order.arrivalPhotoUrls) || parsePhotos(order.arrivalPhotoBase64);

  return (
    <>
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onChange={i => setLightbox(prev => prev ? { ...prev, index: i } : null)}
        />
      )}

      <div className="min-h-screen bg-bg-dark text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Voltar</span>
          </button>
          <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shrink-0">
            {osNumber}
          </span>
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shrink-0"
          >
            <Edit size={14} />
            Editar
          </button>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

          {/* Client + Equipment */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white truncate">
                  {order.firstName} {order.lastName}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {order.priority === 'high' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertTriangle size={9} /> Alta Prioridade
                    </span>
                  )}
                  {order.phone && (
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-all"
                    >
                      <Phone size={10} />
                      {order.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {(order.equipmentType || order.equipmentBrand || order.equipmentModel) && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Smartphone size={14} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-slate-300 truncate">
                  {[order.equipmentType, order.equipmentBrand, order.equipmentModel].filter(Boolean).join(' — ')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {order.entryDate && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Calendar size={13} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Entrada</p>
                    <p className="text-xs font-bold text-blue-300">
                      {order.entryDate.split('-').reverse().join('/')}
                    </p>
                  </div>
                </div>
              )}
              {order.analysisPrediction && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isPastDeadline ? "bg-rose-500/5 border-rose-500/10" : "bg-slate-500/5 border-slate-500/10"
                )}>
                  <Clock size={13} className={isPastDeadline ? "text-rose-400 shrink-0" : "text-slate-400 shrink-0"} />
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Previsão</p>
                    <p className={cn("text-xs font-bold", isPastDeadline ? "text-rose-300" : "text-slate-300")}>
                      {format(parseISO(order.analysisPrediction), 'dd/MM/yy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div className="glass-card p-4 space-y-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Image size={10} className="text-primary/60" />
                Fotos de Entrada ({photos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox({ photos, index: idx })}
                    className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 relative group hover:border-primary/40 transition-all active:scale-95"
                  >
                    <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <Image size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 italic text-center">Toque em uma foto para ampliar</p>
            </div>
          )}

          {/* Reported Problem */}
          {order.reportedProblem && (
            <div className="glass-card p-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertTriangle size={10} className="text-primary/60" />
                Problema Relatado
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{order.reportedProblem}</p>
            </div>
          )}

          {/* Quick Analysis */}
          <QuickSaveField
            icon={<ClipboardList size={10} className="text-primary/60" />}
            label="Análise Técnica"
            placeholder="Descreva a análise técnica do equipamento..."
            value={order.technicalAnalysis || ''}
            onSave={v => handleSaveField('technicalAnalysis', v)}
          />

          {/* Quick Services */}
          <QuickSaveField
            icon={<Wrench size={10} className="text-primary/60" />}
            label="Serviços Realizados"
            placeholder="Liste os serviços realizados no equipamento..."
            value={order.servicesPerformed || ''}
            onSave={v => handleSaveField('servicesPerformed', v)}
          />

          {/* Status */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</p>
              {currentStatus && (
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${currentStatus.color}28`,
                    color: currentStatus.color,
                    borderColor: `${currentStatus.color}50`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {order.status}
                </span>
              )}
            </div>

            {successMsg && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold mb-3",
                successMsg.startsWith('Erro')
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              )}>
                <CheckCircle2 size={14} />
                {successMsg}
              </div>
            )}

            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Alterar para:</p>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.name)}
                  disabled={updatingStatus || order.status === s.name}
                  className={cn(
                    "flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold text-left transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
                    order.status === s.name ? "ring-2 ring-offset-1 ring-offset-transparent" : "hover:brightness-125"
                  )}
                  style={{
                    backgroundColor: `${s.color}18`,
                    color: s.color,
                    borderColor: `${s.color}40`,
                  }}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="leading-tight flex-1">{s.name}</span>
                  {order.status === s.name && <CheckCircle2 size={12} className="shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Edit full button */}
          <button
            onClick={handleOpenEdit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <Edit size={16} />
            Editar OS Completo
          </button>

          <div className="h-6" />
        </div>
      </div>
    </>
  );
};
