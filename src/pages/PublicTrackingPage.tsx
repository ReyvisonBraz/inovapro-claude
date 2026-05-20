import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

type TrackingData = {
  id: number;
  status: string;
  equipmentType: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  equipmentColor: string | null;
  equipmentSerial: string | null;
  reportedProblem: string | null;
  entryDate: string | null;
  analysisPrediction: string | null;
  arrivalPhotos: (string | { base64: string; timestamp: string })[];
  totalAmount: number | null;
  serviceFee: number | null;
  shopWhatsapp: string | null;
  shopName: string;
};

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Análise': '#f59e0b',
  'Em Análise': '#3b82f6',
  'Em Manutenção': '#8b5cf6',
  'Em Reparo': '#8b5cf6',
  'Aguardando Peças': '#f97316',
  'Aguardando Aprovação': '#ef4444',
  'Aguardando Autorização': '#ef4444',
  'Testando': '#06b6d4',
  'Pronto': '#10b981',
  'Concluído': '#10b981',
  'Entregue': '#059669',
  'Cancelado': '#6b7280',
};

export const PublicTrackingPage: React.FC = () => {
  const [data, setData] = React.useState<TrackingData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [manualId, setManualId] = React.useState('');

  const osId = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('osId');
  }, []);

  const fetchOS = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${API_BASE}/public/os/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Ordem de serviço não encontrada');
        throw new Error('Erro ao buscar informações');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (osId) fetchOS(osId);
    else { setLoading(false); setError('Nenhuma ordem informada'); }
  }, [osId, fetchOS]);

  const statusColor = data ? STATUS_COLORS[data.status] || '#3b82f6' : '#3b82f6';

  if (!osId) {
    return (
      <SearchForm
        manualId={manualId}
        setManualId={setManualId}
        onSubmit={() => fetchOS(manualId)}
        error={error}
      />
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={styles.spinner}>🔄</div>
            <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>Buscando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <SearchForm
        manualId={manualId}
        setManualId={setManualId}
        onSubmit={() => fetchOS(manualId)}
        error={error || 'Ordem não encontrada'}
      />
    );
  }

  const isComplete = data.status === 'Concluído' || data.status === 'Pronto';
  const photos = data.arrivalPhotos || [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>INOVA PRO</div>
          <div style={styles.osNumber}>
            OS #{data.id.toString().padStart(4, '0')}
          </div>
        </div>

        <div style={styles.statusSection}>
          <div style={styles.statusLabel}>Status Atual</div>
          <div style={{ ...styles.statusBadge, backgroundColor: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
            {data.status}
          </div>
        </div>

        {isComplete && (
          <div style={styles.readyBanner}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <strong>Seu equipamento está pronto!</strong>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Já pode retirar na assistência.</div>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Equipamento</div>
          <div style={styles.infoGrid}>
            {data.equipmentType && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Tipo</span>
                <span style={styles.infoValue}>{data.equipmentType}</span>
              </div>
            )}
            {data.equipmentBrand && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Marca</span>
                <span style={styles.infoValue}>{data.equipmentBrand}</span>
              </div>
            )}
            {data.equipmentModel && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Modelo</span>
                <span style={styles.infoValue}>{data.equipmentModel}</span>
              </div>
            )}
            {data.equipmentColor && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Cor</span>
                <span style={styles.infoValue}>{data.equipmentColor}</span>
              </div>
            )}
            {data.equipmentSerial && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Nº Série</span>
                <span style={styles.infoValue}>{data.equipmentSerial}</span>
              </div>
            )}
          </div>
        </div>

        {data.reportedProblem && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Problema Relatado</div>
            <div style={styles.problemBox}>{data.reportedProblem}</div>
          </div>
        )}

        <div style={styles.datesRow}>
          {data.entryDate && (
            <div style={styles.dateCard}>
              <span style={styles.dateIcon}>📅</span>
              <span style={styles.dateLabel}>Entrada</span>
              <span style={styles.dateValue}>{format(parseISO(data.entryDate), 'dd/MM/yyyy')}</span>
            </div>
          )}
          {data.analysisPrediction && (
            <div style={{ ...styles.dateCard, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <span style={styles.dateIcon}>🕐</span>
              <span style={{ ...styles.dateLabel, color: '#3b82f6' }}>Previsão</span>
              <span style={{ ...styles.dateValue, color: '#1e40af' }}>{format(parseISO(data.analysisPrediction), 'dd/MM/yyyy')}</span>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Foto do Equipamento</div>
            <div style={styles.photoGrid}>
              {photos.map((photo, idx) => {
                const src = typeof photo === 'string' ? photo : photo.base64;
                return <img key={idx} src={src} alt={`Foto ${idx + 1}`} style={styles.photo} />;
              })}
            </div>
          </div>
        )}

        <div style={styles.actions}>
          {(() => {
            const osNum = `#OS-${data.id.toString().padStart(4, '0')}`;
            const equip = [data.equipmentType, data.equipmentBrand, data.equipmentModel].filter(Boolean).join(' ') || 'Equipamento';
            const entryStr = data.entryDate ? format(parseISO(data.entryDate), 'dd/MM/yyyy') : null;
            const predStr = data.analysisPrediction ? format(parseISO(data.analysisPrediction), 'dd/MM/yyyy') : null;
            const msg = [
              `Olá, ${data.shopName}! 👋`,
              ``,
              `Gostaria de informações sobre minha Ordem de Serviço:`,
              `📋 *OS:* ${osNum}`,
              `📱 *Equipamento:* ${equip}`,
              entryStr ? `📅 *Data de entrada:* ${entryStr}` : null,
              predStr ? `🕐 *Previsão de entrega:* ${predStr}` : null,
              `📌 *Status atual:* ${data.status}`,
            ].filter(Boolean).join('\n');
            const phone = data.shopWhatsapp ? data.shopWhatsapp.replace(/\D/g, '') : '';
            const href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.whatsappBtn}
              >
                <span style={{ fontSize: 18 }}>💬</span>
                Fale Conosco no WhatsApp
              </a>
            );
          })()}
        </div>

        <div style={styles.footer}>
          INOVA PRO — Assistência Técnica Especializada
        </div>
      </div>
    </div>
  );
};

function SearchForm({ manualId, setManualId, onSubmit, error }: {
  manualId: string;
  setManualId: (v: string) => void;
  onSubmit: () => void;
  error: string | null;
}) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.header, borderBottom: 'none' }}>
          <div style={styles.logo}>INOVA PRO</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Acompanhe sua Ordem
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            Digite o número da OS que está no seu comprovante
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={manualId}
            onChange={e => setManualId(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit(); }}
            placeholder="Nº da OS"
            style={styles.input}
          />
          <button onClick={onSubmit} style={styles.searchBtn}>
            Buscar
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <div style={styles.footer}>
          INOVA PRO — Assistência Técnica Especializada
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#ffffff',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative' as const,
  },
  header: {
    textAlign: 'center' as const,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontSize: 11,
    fontWeight: 800,
    color: '#3b82f6',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
  osNumber: {
    fontSize: 22,
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '-0.5px',
    marginTop: 2,
  },
  statusSection: {
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#94a3b8',
    marginBottom: 8,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 24px',
    borderRadius: 40,
    fontSize: 16,
    fontWeight: 800,
  },
  readyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 12,
    padding: '12px 16px',
    marginBottom: 20,
    fontSize: 13,
    color: '#065f46',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#94a3b8',
    marginBottom: 8,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  infoItem: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '8px 12px',
    border: '1px solid #f1f5f9',
  },
  infoLabel: {
    display: 'block',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    letterSpacing: '0.08em',
    marginBottom: 2,
  },
  infoValue: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
  },
  problemBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderLeft: '3px solid #ef4444',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  datesRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
  },
  dateCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '12px 10px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    textAlign: 'center' as const,
  },
  dateIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  dateLabel: {
    display: 'block',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: '#16a34a',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  dateValue: {
    display: 'block',
    fontSize: 15,
    fontWeight: 800,
    color: '#14532d',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  photo: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    aspectRatio: '1',
    objectFit: 'cover' as const,
  },
  actions: {
    marginTop: 20,
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px 20px',
    background: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center' as const,
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: '0.08em',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
    outline: 'none',
  },
  searchBtn: {
    padding: '12px 24px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  errorBox: {
    marginTop: 12,
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'center' as const,
  },
  spinner: {
    fontSize: 32,
    textAlign: 'center' as const,
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  },
};

// Inject spinner keyframes once
if (typeof document !== 'undefined') {
  const existing = document.getElementById('pkeyframes');
  if (!existing) {
    const s = document.createElement('style');
    s.id = 'pkeyframes';
    s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
  }
}
