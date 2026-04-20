import { S } from '../utils';

export function KPI({ label, value, accent, icon }) {
  return (
    <div style={{ ...S.kpiCard, borderColor: accent + '44' }}>
      <div style={S.kpiIcon}>{icon}</div>
      <div style={S.kpiLabel}>{label}</div>
      <div style={{ ...S.kpiVal, color: accent }}>{value}</div>
    </div>
  );
}

export function Card({ title, children }) {
  return (
    <div style={S.card}>
      {title && <div style={S.cardTitle}>{title}</div>}
      {children}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={S.modalHead}>
          <span style={S.modalTitle}>{title}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {children}
    </div>
  );
}

export function ActionBtn({ onClick, label }) {
  return <button onClick={onClick} style={S.actionBtn}>{label}</button>;
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #1e293b', borderTop: '3px solid #4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: '#64748b', fontSize: 13 }}>Loading farm data…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ background: '#1c0a0a', border: '1px solid #ef4444', borderRadius: 12, padding: 20, margin: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>⚠️ Failed to load data</div>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>{message}</div>
      </div>
      {onRetry && <button onClick={onRetry} style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Retry</button>}
    </div>
  );
}

export function Badge({ label, color }) {
  return (
    <span style={{ ...S.badge, background: color + '22', color, border: `1px solid ${color}44` }}>{label}</span>
  );
}

export function TwoCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>{children}</div>;
}
