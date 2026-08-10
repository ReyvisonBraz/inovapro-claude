import React from 'react';
import { format, parseISO } from 'date-fns';
import type { TrackingData } from './tracking/trackingTypes';
import { STATUS_COLORS } from './tracking/trackingTypes';
import { styles } from './tracking/trackingStyles';
import { SearchForm } from './tracking/SearchForm';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const PublicTrackingPage: React.FC = () => {
  const [data, setData] = React.useState<TrackingData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [manualId, setManualId] = React.useState('');

  const token = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('t');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (token) fetchOS(token);
    else { setLoading(false); setError('Nenhuma ordem informada'); }
  }, [token, fetchOS]);

  const statusColor = data ? STATUS_COLORS[data.status] || '#3b82f6' : '#3b82f6';

  if (!token) {
    return <SearchForm manualId={manualId} setManualId={setManualId} onSubmit={() => fetchOS(manualId)} error={error} />;
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
    return <SearchForm manualId={manualId} setManualId={setManualId} onSubmit={() => fetchOS(manualId)} error={error || 'Ordem não encontrada'} />;
  }

  const isComplete = data.status === 'Concluído' || data.status === 'Pronto';
  const photos = data.arrivalPhotos || [];
  const checklists = [
    { title: 'Checklist de Entrada', items: data.checklistIn ?? [] },
    { title: 'Checklist de Saída', items: data.checklistOut ?? [] },
  ].filter((checklist) => checklist.items.length > 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>INOVA PRO</div>
          <div style={styles.osNumber}>OS #{data.id.toString().padStart(4, '0')}</div>
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
            {data.equipmentType && <div style={styles.infoItem}><span style={styles.infoLabel}>Tipo</span><span style={styles.infoValue}>{data.equipmentType}</span></div>}
            {data.equipmentBrand && <div style={styles.infoItem}><span style={styles.infoLabel}>Marca</span><span style={styles.infoValue}>{data.equipmentBrand}</span></div>}
            {data.equipmentModel && <div style={styles.infoItem}><span style={styles.infoLabel}>Modelo</span><span style={styles.infoValue}>{data.equipmentModel}</span></div>}
            {data.equipmentColor && <div style={styles.infoItem}><span style={styles.infoLabel}>Cor</span><span style={styles.infoValue}>{data.equipmentColor}</span></div>}
            {data.equipmentSerial && <div style={styles.infoItem}><span style={styles.infoLabel}>Nº Série</span><span style={styles.infoValue}>{data.equipmentSerial}</span></div>}
          </div>
        </div>

        {data.reportedProblem && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Problema Relatado</div>
            <div style={styles.problemBox}>{data.reportedProblem}</div>
          </div>
        )}

        {checklists.map((checklist) => (
          <div key={checklist.title} style={styles.section}>
            <div style={styles.sectionTitle}>{checklist.title}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {checklist.items.map((item, index) => {
                const value = item.value?.trim()
                  ? item.value.trim()
                  : typeof item.done === 'boolean'
                    ? (item.done ? 'Sim' : 'Não')
                    : '—';
                return (
                  <div key={`${item.label}-${index}`} style={{ ...styles.infoItem, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: item.done ? '#10b981' : '#94a3b8', fontWeight: 900 }}>{item.done ? '✓' : '□'}</span>
                    <span style={{ ...styles.infoValue, flex: 1 }}>{item.label}</span>
                    <span style={{ ...styles.infoLabel, color: '#334155' }}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
              `Olá, ${data.shopName}! 👋`, ``,
              `Gostaria de informações sobre minha Ordem de Serviço:`,
              `📋 *OS:* ${osNum}`, `📱 *Equipamento:* ${equip}`,
              entryStr ? `📅 *Data de entrada:* ${entryStr}` : null,
              predStr ? `🕐 *Previsão de entrega:* ${predStr}` : null,
              `📌 *Status atual:* ${data.status}`,
            ].filter(Boolean).join('\n');
            const phone = data.shopWhatsapp ? data.shopWhatsapp.replace(/\D/g, '') : '';
            return (
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" style={styles.whatsappBtn}>
                <span style={{ fontSize: 18 }}>💬</span> Fale Conosco no WhatsApp
              </a>
            );
          })()}
        </div>

        <div style={styles.footer}>INOVA PRO — Assistência Técnica Especializada</div>
      </div>
    </div>
  );
};
