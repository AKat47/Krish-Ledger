import { useState, useEffect } from 'react';
import { useFarmData } from './hooks/useFarmData';
import { TABS, S, getId, GLOBAL_CSS } from './utils';
import { Modal, ActionBtn, Spinner, ErrorBanner } from './components/UI';
import { CropForm, ExpenseForm, LabourForm, MaterialForm, ManureForm, YieldForm } from './components/Forms';
import { Dashboard, Crops, Expenses, Labour, Materials, Manure, Yields, Analytics, useAnalytics } from './pages/Pages';

const MODAL_TITLES = {
  crop: 'Add Crop', expense: 'Add Expense', labour: 'Log Labour',
  material: 'Add Material', manure: 'Log Manure / Biofertilizer', yield: 'Record Yield',
};

const ADD_BTN = {
  crops: { label: '+ Add Crop',     modal: 'crop'     },
  expenses: { label: '+ Expense',   modal: 'expense'  },
  labour:   { label: '+ Log Work',  modal: 'labour'   },
  materials:{ label: '+ Add Item',  modal: 'material' },
  manure:   { label: '+ Log',       modal: 'manure'   },
  yields:   { label: '+ Yield',     modal: 'yield'    },
};

export default function App() {
  const { data, loading, error, actions, reload } = useFarmData();
  const analytics = useAnalytics(data);

  const [tab,    setTab]   = useState('dashboard');
  const [modal,  setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  // Inject global CSS once
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleStageChange = (id, stage) =>
    save(() => actions.updateCrop(id, { stage }), `Stage → ${stage}`);

  const addBtn = ADD_BTN[tab];

  return (
    <div style={S.app}>
      {/* ── SIDEBAR (desktop) ──────────────────────────────────────────────── */}
      <aside className="fl-sidebar" style={S.sidebar}>
        <div style={S.logo}>
          <span style={{ fontSize: 26 }}>🌾</span>
          <div>
            <div style={S.logoTitle}>Farm Ledger</div>
            <div style={S.logoSub}>Farm Management</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px', gap: 1 }}>
          {TABS.map(t => (
            <button key={t.id}
              style={{ ...S.navBtn, ...(tab === t.id ? S.navBtnOn : {}) }}
              onClick={() => setTab(t.id)}>
              <span style={{ fontSize: 15, width: 20 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid #1e293b', display: 'flex', gap: 20 }}>
          {[['Plots', data.plots.length], ['Crops', data.crops.length]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
              <strong style={{ fontSize: 13, color: '#94a3b8' }}>{v}</strong>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <div className="fl-main" style={S.main}>

        {/* Header */}
        <header className="fl-header" style={S.header}>
          <div>
            <h1 className="fl-page-title" style={S.pageTitle}>
              {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
            </h1>
            <div style={S.breadcrumb}>
              Farm Ledger · {data.plots.length} Plots · {data.crops.length} Crops
            </div>
          </div>
          {addBtn && (
            <ActionBtn
              onClick={() => setModal(addBtn.modal)}
              label={addBtn.label}
            />
          )}
        </header>

        {/* Content */}
        <div className="fl-content" style={S.content}>
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

      {/* ── BOTTOM NAV (mobile) ────────────────────────────────────────────── */}
      <nav className="fl-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#0a1628', borderTop: '1px solid #1e293b',
        display: 'none', // shown by CSS on mobile
        justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 4px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            border: 'none', background: 'transparent', cursor: 'pointer',
            padding: '4px 8px', borderRadius: 10,
            color: tab === t.id ? '#4ade80' : '#475569',
            minWidth: 0, flex: 1,
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 500, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 44 }}>
              {t.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </nav>

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

      {/* ── FAB (mobile add button) ────────────────────────────────────────── */}
      {addBtn && (
        <button
          className="fl-hide-mob" // hidden on desktop (header btn used instead)
          onClick={() => setModal(addBtn.modal)}
          style={{ display: 'none' }} // CSS overrides for mobile only
        />
      )}

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 300,
          padding: '11px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13,
          background: toast.type === 'error' ? '#7f1d1d' : '#14532d',
          color: toast.type === 'error' ? '#fca5a5' : '#4ade80',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}55`,
          boxShadow: '0 8px 32px #00000066',
          animation: 'flSlideIn 0.25s ease',
          maxWidth: 'calc(100vw - 32px)',
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
          <style>{`@keyframes flSlideIn { from { transform:translateY(16px);opacity:0 } to { transform:none;opacity:1 } }`}</style>
        </div>
      )}
    </div>
  );
}
