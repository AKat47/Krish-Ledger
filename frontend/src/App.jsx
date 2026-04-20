import { useState } from 'react';
import { useFarmData } from './hooks/useFarmData';
import { TABS, S, getId } from './utils';
import { Modal, ActionBtn, Spinner, ErrorBanner } from './components/UI';
import { CropForm, ExpenseForm, LabourForm, MaterialForm, ManureForm, YieldForm } from './components/Forms';
import { Dashboard, Crops, Expenses, Labour, Materials, Manure, Yields, Analytics, useAnalytics } from './pages/Pages';

const MODAL_TITLES = {
  crop: 'Add Crop', expense: 'Add Expense', labour: 'Log Labour',
  material: 'Add Material', manure: 'Log Manure / Biofertilizer', yield: 'Record Yield',
};

export default function App() {
  const { data, loading, error, actions, reload } = useFarmData();
  const analytics = useAnalytics(data);

  const [tab,     setTab]   = useState('dashboard');
  const [modal,   setModal] = useState(null);   // modal type string or null
  const [saving,  setSaving] = useState(false);
  const [toast,   setToast] = useState(null);   // { msg, type }

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Generic save wrapper ─────────────────────────────────────────────────────
  const save = async (actionFn, successMsg) => {
    setSaving(true);
    try {
      await actionFn();
      setModal(null);
      showToast(successMsg);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Stage change for crops ───────────────────────────────────────────────────
  const handleStageChange = (id, stage) =>
    save(() => actions.updateCrop(id, { stage }), `Stage updated to ${stage}`);

  return (
    <div style={S.app}>
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <span style={{ fontSize: 26 }}>🌾</span>
          <div>
            <div style={S.logoTitle}>KrishiLedger</div>
            <div style={S.logoSub}>Farm Management</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px', gap: 1, overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id}
              style={{ ...S.navBtn, ...(tab === t.id ? S.navBtnOn : {}) }}
              onClick={() => setTab(t.id)}>
              <span style={{ fontSize: 15, width: 20 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid #1e293b', display: 'flex', gap: 16 }}>
          {[['Plots', data.plots.length], ['Crops', data.crops.length]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
              <strong style={{ fontSize: 13, color: '#94a3b8' }}>{v}</strong>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={S.header}>
          <div>
            <h1 style={S.pageTitle}>{TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}</h1>
            <div style={S.breadcrumb}>Season Overview · {data.plots.length} Plots · {data.plots.reduce((s,p)=>s+p.acres,0).toFixed(1)} Acres</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'crops'     && <ActionBtn onClick={() => setModal('crop')}     label="+ Add Crop"    />}
            {tab === 'expenses'  && <ActionBtn onClick={() => setModal('expense')}  label="+ Add Expense" />}
            {tab === 'labour'    && <ActionBtn onClick={() => setModal('labour')}   label="+ Log Work"    />}
            {tab === 'materials' && <ActionBtn onClick={() => setModal('material')} label="+ Add Item"    />}
            {tab === 'manure'    && <ActionBtn onClick={() => setModal('manure')}   label="+ Log Manure"  />}
            {tab === 'yields'    && <ActionBtn onClick={() => setModal('yield')}    label="+ Record Yield"/>}
          </div>
        </header>

        {/* Content */}
        <div style={S.content}>
          {loading && <Spinner />}
          {error   && <ErrorBanner message={error} onRetry={reload} />}
          {!loading && !error && (
            <>
              {tab === 'dashboard' && <Dashboard analytics={analytics} data={data} />}
              {tab === 'crops'     && <Crops     data={data} analytics={analytics} onStageChange={handleStageChange} onDelete={id => save(() => actions.deleteCrop(id),    'Crop deleted')}    />}
              {tab === 'expenses'  && <Expenses  data={data} onDelete={id => save(() => actions.deleteExpense(id),  'Expense deleted')} />}
              {tab === 'labour'    && <Labour    data={data} onDelete={id => save(() => actions.deleteLabour(id),   'Log deleted')}     />}
              {tab === 'materials' && <Materials data={data} onDelete={id => save(() => actions.deleteMaterial(id),'Item deleted')}     />}
              {tab === 'manure'    && <Manure    data={data} onDelete={id => save(() => actions.deleteManure(id),  'Log deleted')}     />}
              {tab === 'yields'    && <Yields    data={data} onDelete={id => save(() => actions.deleteYield(id),   'Yield deleted')}   />}
              {tab === 'analytics' && <Analytics analytics={analytics} data={data} />}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL ──────────────────────────────────────────────────────────── */}
      {modal && (
        <Modal title={MODAL_TITLES[modal]} onClose={() => !saving && setModal(null)}>
          {modal === 'crop'     && <CropForm     data={data} loading={saving} onSave={v => save(() => actions.addCrop(v),     'Crop added!')}     />}
          {modal === 'expense'  && <ExpenseForm  data={data} loading={saving} onSave={v => save(() => actions.addExpense(v),  'Expense saved!')}  />}
          {modal === 'labour'   && <LabourForm   data={data} loading={saving} onSave={v => save(() => actions.addLabour(v),   'Labour logged!')}  />}
          {modal === 'material' && <MaterialForm             loading={saving} onSave={v => save(() => actions.addMaterial(v), 'Item added!')}     />}
          {modal === 'manure'   && <ManureForm   data={data} loading={saving} onSave={v => save(() => actions.addManure(v),   'Manure logged!')}  />}
          {modal === 'yield'    && <YieldForm    data={data} loading={saving} onSave={v => save(() => actions.addYield(v),    'Yield recorded!')} />}
        </Modal>
      )}

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
          background: toast.type === 'error' ? '#7f1d1d' : '#14532d',
          color: toast.type === 'error' ? '#fca5a5' : '#4ade80',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}44`,
          boxShadow: '0 8px 32px #00000066',
          animation: 'slideIn 0.25s ease',
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
          <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity:0; } to { transform: none; opacity:1; } }`}</style>
        </div>
      )}
    </div>
  );
}
