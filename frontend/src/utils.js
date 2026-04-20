// ── Constants ────────────────────────────────────────────────────────────────
export const STAGES      = ['Sowing', 'Growing', 'Flowering', 'Harvest', 'Done'];
export const SEASONS     = ['Kharif 2024', 'Rabi 2024', 'Zaid 2024', 'Kharif 2025', 'Kharif 2026'];
export const EXP_CATS    = ['Labour', 'Inputs', 'Irrigation', 'Misc'];
export const MAT_CATS    = ['Seeds', 'Fertilizer', 'Pesticide', 'Tools', 'Other'];
export const MANURE_TYPES= ['FYM', 'Vermicompost', 'Green Manure', 'Compost', 'Liquid Biofertilizer'];

export const TABS = [
  { id: 'dashboard', label: 'Dashboard',      icon: '📊' },
  { id: 'crops',     label: 'Crop Lifecycle', icon: '🌱' },
  { id: 'expenses',  label: 'Expenses',       icon: '💸' },
  { id: 'labour',    label: 'Labour Logs',    icon: '👷' },
  { id: 'materials', label: 'Materials',      icon: '📦' },
  { id: 'manure',    label: 'Manure & Bio',   icon: '🍃' },
  { id: 'yields',    label: 'Yield Tracking', icon: '🌾' },
  { id: 'analytics', label: 'Analytics',      icon: '📈' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmt    = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const getId  = (doc) => doc?._id || doc?.id;

export const stageColor = (s) => ({
  Sowing: '#f0a500', Growing: '#22c55e', Flowering: '#a855f7',
  Harvest: '#3b82f6', Done: '#94a3b8'
}[s] || '#94a3b8');

export const catColor = (c) => ({
  Labour: '#fb923c', Inputs: '#34d399', Irrigation: '#60a5fa', Misc: '#f472b6'
}[c] || '#e2e8f0');

// ── Shared Styles ─────────────────────────────────────────────────────────────
export const S = {
  // Layout
  app:        { display: 'flex', height: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: "'Segoe UI', sans-serif", fontSize: 14, overflow: 'hidden' },
  sidebar:    { width: 220, background: '#0a1628', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 },
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content:    { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  // Logo
  logo:       { display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px 20px', borderBottom: '1px solid #1e293b', marginBottom: 10 },
  logoTitle:  { fontWeight: 800, fontSize: 15, color: '#f0fdf4', letterSpacing: '-0.02em' },
  logoSub:    { fontSize: 9, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.12em' },
  // Nav
  navBtn:     { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', width: '100%', transition: 'all 0.15s', background: 'transparent', color: '#64748b', fontWeight: 500 },
  navBtnOn:   { background: '#14532d', color: '#4ade80', fontWeight: 700 },
  // Header
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1e293b', background: '#0a1628', flexShrink: 0 },
  pageTitle:  { margin: 0, fontSize: 18, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' },
  breadcrumb: { fontSize: 11, color: '#4ade80', marginTop: 2 },
  // Cards
  card:       { background: '#0a1628', border: '1px solid #1e293b', borderRadius: 16, padding: 18, marginBottom: 14 },
  cardTitle:  { fontWeight: 800, fontSize: 11, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 },
  // KPI
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 16 },
  kpiCard:    { background: '#0a1628', border: '1px solid #1e293b', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 },
  kpiIcon:    { fontSize: 20, marginBottom: 2 },
  kpiLabel:   { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  kpiVal:     { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' },
  // Table
  table:      { background: '#0a1628', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' },
  tHead:      { padding: '11px 15px', background: '#0f172a', fontSize: 10, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'grid', gap: 8 },
  tRow:       { padding: '11px 15px', borderBottom: '1px solid #0f172a', fontSize: 13, display: 'grid', gap: 8, alignItems: 'center' },
  // Misc
  badge:      { fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700 },
  barTrack:   { height: 7, background: '#1e293b', borderRadius: 4, overflow: 'hidden', display: 'flex' },
  barSeg:     { height: '100%', borderRadius: 4, transition: 'width 0.4s' },
  // Forms
  inp:        { width: '100%', padding: '9px 11px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  saveBtn:    { padding: '10px 20px', background: '#16a34a', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginTop: 6, width: '100%' },
  delBtn:     { padding: '6px 12px', background: 'transparent', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 11, fontWeight: 700 },
  actionBtn:  { padding: '8px 16px', background: '#16a34a', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
  // Modal
  overlay:    { position: 'fixed', inset: 0, background: '#00000090', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modalBox:   { background: '#0d1f35', border: '1px solid #1e293b', borderRadius: 20, padding: 28, width: 'min(440px,90vw)', maxHeight: '85vh', overflowY: 'auto' },
  modalHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontWeight: 800, fontSize: 16, color: '#f0fdf4' },
  closeBtn:   { background: '#1e293b', border: 'none', color: '#94a3b8', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14 },
};
