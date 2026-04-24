import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { SEASONS, CATS, CAT_COLORS, STAGES, C, fmt, getId, fmtDate } from './constants';

const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #2C2C2A; }
  select option { background: #fff; color: #2C2C2A; }
  input[type=date] { color-scheme: light; }
  ::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;
if (!document.getElementById('fl-global')) {
  const s = document.createElement('style');
  s.id = 'fl-global'; s.textContent = GLOBAL;
  document.head.appendChild(s);
}

const PAGE_SIZE = 20;

// Build month options from a list of expenses
function buildMonthOptions(expenses) {
  const seen = new Set();
  const months = [];
  // sort newest first so dropdown order is recent → older
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!seen.has(key)) {
      seen.add(key);
      months.push({
        key,
        label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      });
    }
  });
  return months;
}

export default function App() {
  const { crops, expenses, loading, error, reload,
          addExpense, deleteExpense, addCrop, updateCrop, deleteCrop } = useData();

  const [activeCrop,   setActiveCrop]   = useState(null);
  const [catFilter,    setCatFilter]    = useState('');
  const [monthFilter,  setMonthFilter]  = useState('');   // 'YYYY-MM' or ''
  const [showForm,     setShowForm]     = useState(false);
  const [showCropForm, setShowCropForm] = useState(false);
  const [showCropMgr,  setShowCropMgr]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState('');
  const [saving,       setSaving]       = useState(false);
  const [page,         setPage]         = useState(1);    // lazy load page counter

  const [form,     setForm]     = useState({ amount: '', desc: '', date: today(), category: CATS[0], notes: '', cropId: '' });
  const [cropForm, setCropForm] = useState({ name: '', season: SEASONS[0], stage: 'Sowing', sowDate: '' });

  function today() { return new Date().toISOString().split('T')[0]; }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  // ── Filtering pipeline ────────────────────────────────────────────────────
  const byCrop = useMemo(() =>
    activeCrop
      ? expenses.filter(e => (e.cropId?._id || e.cropId) === activeCrop)
      : expenses,
  [expenses, activeCrop]);

  const byMonth = useMemo(() =>
    monthFilter
      ? byCrop.filter(e => {
          if (!e.date) return false;
          const d = new Date(e.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return key === monthFilter;
        })
      : byCrop,
  [byCrop, monthFilter]);

  const byCat = useMemo(() =>
    catFilter ? byMonth.filter(e => e.category === catFilter) : byMonth,
  [byMonth, catFilter]);

  const sortedAll = useMemo(() =>
    [...byCat].sort((a, b) => new Date(b.date) - new Date(a.date)),
  [byCat]);

  // Lazy-loaded slice
  const visibleEntries = sortedAll.slice(0, page * PAGE_SIZE);
  const hasMore        = visibleEntries.length < sortedAll.length;

  // Reset page when filters change
  const resetPage = () => setPage(1);

  // ── Stats (on filtered set byMonth+byCrop, not byCat so they stay consistent) ──
  const totalForView = byMonth.reduce((s, e) => s + Number(e.amount), 0);
  const grandTotal   = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const entryCount   = byMonth.length;

  // ── Category breakdown (on byCrop+byMonth only, not catFilter) ──────────────
  const catTotals = useMemo(() => {
    const t = {};
    CATS.forEach(c => t[c] = 0);
    byMonth.forEach(e => { if (t[e.category] !== undefined) t[e.category] += Number(e.amount); });
    return t;
  }, [byMonth]);
  const maxCat  = Math.max(...Object.values(catTotals), 1);
  const catRows = CATS.filter(c => catTotals[c] > 0).sort((a, b) => catTotals[b] - catTotals[a]);

  // ── Month options ─────────────────────────────────────────────────────────
  const monthOptions = useMemo(() => buildMonthOptions(byCrop), [byCrop]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveExpense = async () => {
    if (!form.amount || Number(form.amount) <= 0) { showToast('Enter a valid amount'); return; }
    if (!form.desc.trim()) { showToast('Add a description'); return; }
    if (!form.date) { showToast('Pick a date'); return; }
    setSaving(true);
    try {
      await addExpense({ ...form, amount: Number(form.amount), cropId: form.cropId || null });
      setForm({ amount: '', desc: '', date: today(), category: CATS[0], notes: '', cropId: activeCrop || '' });
      setShowForm(false);
      resetPage();
      showToast(`${fmt(form.amount)} added`);
    } catch (err) { showToast(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveCrop = async () => {
    if (!cropForm.name.trim()) { showToast('Enter crop name'); return; }
    setSaving(true);
    try {
      await addCrop(cropForm);
      setCropForm({ name: '', season: SEASONS[0], stage: 'Sowing', sowDate: '' });
      setShowCropForm(false);
      showToast('Crop added');
    } catch (err) { showToast(err.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'expense') await deleteExpense(deleteTarget.id);
      if (deleteTarget.type === 'crop')    await deleteCrop(deleteTarget.id);
      showToast('Removed');
    } catch (err) { showToast(err.message); }
    setDeleteTarget(null);
  };

  const cropName = (id) => crops.find(c => getId(c) === id)?.name || '—';

  const switchCrop = (id) => {
    setActiveCrop(id);
    setCatFilter('');
    setMonthFilter('');
    resetPage();
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.green800, padding: '18px 16px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ ...serif, color: C.green50, fontSize: 19, letterSpacing: '-0.01em' }}>
            Farm <span style={{ color: C.green200, fontStyle: 'italic' }}>Ledger</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: C.green700, color: C.green100, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
              {fmt(grandTotal)}
            </span>
            <button onClick={() => setShowCropMgr(true)}
              style={{ background: 'transparent', border: `1px solid ${C.green600}`, color: C.green200, borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
              Crops
            </button>
          </div>
        </div>

        {/* Crop tabs */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <CropTab label="All" sub={grandTotal > 0 ? fmt(grandTotal) : ''} active={activeCrop === null} onClick={() => switchCrop(null)} />
          {crops.map(c => {
            const tot = expenses.filter(e => (e.cropId?._id || e.cropId) === getId(c)).reduce((s, e) => s + Number(e.amount), 0);
            return (
              <CropTab key={getId(c)} label={c.name} sub={tot > 0 ? fmt(tot) : ''} active={activeCrop === getId(c)} onClick={() => switchCrop(getId(c))} />
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '14px 14px 0' }}>
        {loading && <LoadingState />}
        {error   && <ErrorState msg={error} onRetry={reload} />}

        {!loading && !error && (<>

          {/* ── SUMMARY STRIP ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            <StatCard label="Total" value={fmt(totalForView)} accent />
            <StatCard label="Entries" value={entryCount} />
            <StatCard label="Showing" value={`${visibleEntries.length} / ${sortedAll.length}`} />
          </div>

          {/* ── BREAKDOWN (now at top) ── */}
          {catRows.length > 0 && (
            <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px', marginBottom: 14 }}>
              <div style={{ ...serif, fontSize: 13, color: C.muted, marginBottom: 12 }}>Breakdown</div>
              {catRows.map(c => (
                <div key={c} style={{ marginBottom: 10, cursor: 'pointer' }}
                  onClick={() => { setCatFilter(catFilter === c ? '' : c); resetPage(); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: catFilter === c ? CAT_COLORS[c] : C.gray700, fontWeight: catFilter === c ? 600 : 400 }}>{c}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: CAT_COLORS[c] }}>{fmt(catTotals[c])}</span>
                  </div>
                  <div style={{ height: 5, background: C.gray50, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: CAT_COLORS[c], width: `${Math.round(catTotals[c] / maxCat * 100)}%`, transition: 'width 0.4s', opacity: catFilter && catFilter !== c ? 0.35 : 1 }} />
                  </div>
                </div>
              ))}
              {catFilter && (
                <button onClick={() => { setCatFilter(''); resetPage(); }}
                  style={{ marginTop: 6, fontSize: 11, color: C.green700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  ✕ Clear filter
                </button>
              )}
            </div>
          )}

          {/* ── ADD EXPENSE BUTTON ── */}
          <button onClick={() => { setForm(f => ({ ...f, cropId: activeCrop || '', date: today() })); setShowForm(v => !v); }}
            style={{ width: '100%', background: C.green700, color: C.green50, border: 'none', borderRadius: 10, padding: '13px', ...sans, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {showForm ? '✕ Cancel' : '+ Add Expense'}
          </button>

          {/* ── ADD FORM ── */}
          {showForm && (
            <div style={{ background: C.surface, border: `0.5px solid ${C.borderSt}`, borderRadius: 12, padding: '14px', marginBottom: 14 }}>
              <div style={{ ...serif, fontSize: 14, color: C.green800, marginBottom: 14 }}>New Expense</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <FormField label="Amount (₹)">
                  <input style={inp} type="number" inputMode="numeric" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                </FormField>
                <FormField label="Date">
                  <input style={inp} type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Description" mb={10}>
                <input style={inp} placeholder="What was this for?" value={form.desc}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <FormField label="Category">
                  <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Crop">
                  <select style={inp} value={form.cropId} onChange={e => setForm(f => ({ ...f, cropId: e.target.value }))}>
                    <option value="">— None —</option>
                    {crops.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Notes (optional)" mb={14}>
                <input style={inp} placeholder="Any additional notes…" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </FormField>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveExpense} disabled={saving}
                  style={{ flex: 1, background: C.green700, color: '#fff', border: 'none', borderRadius: 8, padding: 11, ...sans, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: `0.5px solid ${C.borderSt}`, borderRadius: 8, padding: '11px 16px', ...sans, fontSize: 14, cursor: 'pointer', color: C.muted }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── FILTER BAR: month + category ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {/* Month dropdown */}
            <select
              value={monthFilter}
              onChange={e => { setMonthFilter(e.target.value); resetPage(); }}
              style={{ ...filterSelect, flex: 1 }}>
              <option value="">All months</option>
              {monthOptions.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>

            {/* Category dropdown */}
            <select
              value={catFilter}
              onChange={e => { setCatFilter(e.target.value); resetPage(); }}
              style={{ ...filterSelect, flex: 1 }}>
              <option value="">All categories</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Active filter pill */}
          {(monthFilter || catFilter) && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {monthFilter && (
                <Pill label={monthOptions.find(m => m.key === monthFilter)?.label || monthFilter}
                  onRemove={() => { setMonthFilter(''); resetPage(); }} />
              )}
              {catFilter && (
                <Pill label={catFilter} color={CAT_COLORS[catFilter]}
                  onRemove={() => { setCatFilter(''); resetPage(); }} />
              )}
            </div>
          )}

          {/* Section label */}
          <div style={{ ...serif, fontSize: 12, color: C.muted, marginBottom: 8 }}>
            {activeCrop ? cropName(activeCrop) : 'All crops'}
            {monthFilter ? ` · ${monthOptions.find(m => m.key === monthFilter)?.label}` : ''}
            {catFilter ? ` · ${catFilter}` : ''}
            {` · ${sortedAll.length} entries`}
          </div>

          {/* ── ENTRIES ── */}
          {sortedAll.length === 0 ? (
            <EmptyState cropName={activeCrop ? cropName(activeCrop) : 'your farm'} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {visibleEntries.map(e => (
                  <EntryCard
                    key={getId(e)}
                    entry={e}
                    showCrop={!activeCrop}
                    cropName={cropName(e.cropId?._id || e.cropId)}
                    onDelete={() => setDeleteTarget({ id: getId(e), type: 'expense', label: `"${e.desc}" — ${fmt(e.amount)}` })}
                  />
                ))}
              </div>

              {/* ── LOAD MORE ── */}
              {hasMore ? (
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{ width: '100%', background: 'none', border: `0.5px solid ${C.borderSt}`, borderRadius: 10, padding: '11px', ...sans, fontSize: 13, color: C.muted, cursor: 'pointer', marginBottom: 20 }}>
                  Load more · {sortedAll.length - visibleEntries.length} remaining
                </button>
              ) : (
                sortedAll.length > PAGE_SIZE && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: C.gray200, marginBottom: 20 }}>
                    All {sortedAll.length} entries shown
                  </div>
                )
              )}
            </>
          )}

        </>)}
      </div>

      {/* ── CROP MANAGER SHEET ── */}
      {showCropMgr && (
        <Sheet title="Manage Crops" onClose={() => { setShowCropMgr(false); setShowCropForm(false); }}>
          <button onClick={() => setShowCropForm(v => !v)}
            style={{ width: '100%', background: C.green700, color: '#fff', border: 'none', borderRadius: 8, padding: 11, ...sans, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 14 }}>
            {showCropForm ? '✕ Cancel' : '+ Add New Crop'}
          </button>

          {showCropForm && (
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <FormField label="Crop Name" mb={10}>
                <input style={inp} placeholder="e.g. Paddy" value={cropForm.name}
                  onChange={e => setCropForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </FormField>
              <FormField label="Season" mb={10}>
                <select style={inp} value={cropForm.season} onChange={e => setCropForm(f => ({ ...f, season: e.target.value }))}>
                  {SEASONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <FormField label="Stage">
                  <select style={inp} value={cropForm.stage} onChange={e => setCropForm(f => ({ ...f, stage: e.target.value }))}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Sow Date">
                  <input style={inp} type="date" value={cropForm.sowDate}
                    onChange={e => setCropForm(f => ({ ...f, sowDate: e.target.value }))} />
                </FormField>
              </div>
              <button onClick={handleSaveCrop} disabled={saving}
                style={{ width: '100%', background: C.green700, color: '#fff', border: 'none', borderRadius: 8, padding: 11, ...sans, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : 'Save Crop'}
              </button>
            </div>
          )}

          {crops.length === 0 && (
            <p style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No crops yet. Add one above.</p>
          )}
          {crops.map(c => {
            const stageIdx = STAGES.indexOf(c.stage);
            const tot = expenses.filter(e => (e.cropId?._id || e.cropId) === getId(c)).reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={getId(c)} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.season}{c.sowDate ? ` · Sown: ${fmtDate(c.sowDate)}` : ''}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {STAGES.map((s, i) => (
                        <button key={s} onClick={() => updateCrop(getId(c), { stage: s })}
                          style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, border: `1px solid ${i === stageIdx ? C.green600 : C.gray100}`, background: i === stageIdx ? C.green700 : 'transparent', color: i === stageIdx ? '#fff' : C.gray400, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.green700 }}>{tot > 0 ? fmt(tot) : '—'}</div>
                    <button onClick={() => setDeleteTarget({ id: getId(c), type: 'crop', label: c.name })}
                      style={{ marginTop: 6, fontSize: 11, color: '#D85A30', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </Sheet>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000055', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}
          onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div style={{ background: C.surface, borderRadius: '16px 16px 0 0', padding: '24px 20px', width: '100%', maxWidth: 480 }}>
            <div style={{ ...serif, fontSize: 15, color: C.text, marginBottom: 6 }}>Remove this entry?</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{deleteTarget.label}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, background: 'none', border: `0.5px solid ${C.borderSt}`, borderRadius: 8, padding: 12, ...sans, fontSize: 14, cursor: 'pointer', color: C.muted }}>
                Keep it
              </button>
              <button onClick={confirmDelete}
                style={{ flex: 1, background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, padding: 12, ...sans, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: C.gray900, color: '#fff', padding: '10px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, zIndex: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const serif = { fontFamily: "'Libre Baskerville', serif" };
const sans  = { fontFamily: "'DM Sans', sans-serif" };

const inp = {
  width: '100%', border: `0.5px solid rgba(44,44,42,0.22)`, borderRadius: 8,
  padding: '9px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  background: '#F7F5F0', color: '#2C2C2A', outline: 'none', WebkitAppearance: 'none',
  boxSizing: 'border-box',
};

const filterSelect = {
  border: `0.5px solid rgba(44,44,42,0.18)`, borderRadius: 8,
  padding: '8px 10px', fontFamily: "'DM Sans', sans-serif", fontSize: 12,
  background: '#fff', color: '#5F5E5A', cursor: 'pointer', outline: 'none',
  WebkitAppearance: 'none',
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function CropTab({ label, sub, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, background: active ? '#F7F5F0' : 'none', border: 'none',
      color: active ? C.green800 : C.green200, fontFamily: "'DM Sans', sans-serif",
      fontSize: 13, fontWeight: active ? 500 : 400, padding: '8px 14px 10px',
      cursor: 'pointer', borderRadius: '6px 6px 0 0', opacity: active ? 1 : 0.75,
    }}>
      {label}
      {sub && <span style={{ fontSize: 10, display: 'block', marginTop: 1, opacity: 0.7 }}>{sub}</span>}
    </button>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(44,44,42,0.12)', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: accent ? C.green700 : C.text }}>{value}</div>
    </div>
  );
}

function FormField({ label, children, mb = 0 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Pill({ label, color, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '3px 8px 3px 10px', borderRadius: 999, background: color ? color + '18' : C.green50, color: color || C.green700, border: `0.5px solid ${color || C.green400}44` }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
    </span>
  );
}

function EntryCard({ entry: e, showCrop, cropName, onDelete }) {
  return (
    <div style={{ background: '#fff', border: `0.5px solid rgba(44,44,42,0.12)`, borderRadius: 10, padding: '11px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[e.category] || C.gray400, flexShrink: 0, marginTop: 5 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 2 }}>{e.desc || '—'}</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: C.muted, flexWrap: 'wrap' }}>
          <span>{fmtDate(e.date)}</span>
          <span style={{ background: C.gray50, padding: '1px 6px', borderRadius: 4 }}>{e.category}</span>
          {showCrop && cropName !== '—' && <span style={{ color: C.green600 }}>{cropName}</span>}
          {e.notes && <span style={{ opacity: 0.7 }}>{e.notes}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{fmt(e.amount)}</div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: C.gray200, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
      </div>
    </div>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bg, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto', padding: '20px 16px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ ...serif, fontSize: 15, color: C.green800 }}>{title}</div>
          <button onClick={onClose} style={{ background: C.gray50, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ cropName }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🌾</div>
      <p style={{ fontSize: 14 }}>No entries yet for {cropName}.<br />Tap "+ Add Expense" to begin.</p>
    </div>
  );
}

function LoadingState() {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 14 }}>Loading…</div>;
}

function ErrorState({ msg, onRetry }) {
  return (
    <div style={{ background: '#FAECE7', border: '0.5px solid #D85A30', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
      <div style={{ color: '#D85A30', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Failed to load</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>{msg}</div>
      <button onClick={onRetry} style={{ background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>Retry</button>
    </div>
  );
}
