import React from 'react';
import { styles } from './trackingStyles';

interface SearchFormProps {
  manualId: string;
  setManualId: (v: string) => void;
  onSubmit: () => void;
  error: string | null;
}

export function SearchForm({ manualId, setManualId, onSubmit, error }: SearchFormProps) {
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