import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import {
  SEASONS, EXP_CATS, EXP_CAT_COLORS, INPUT_TYPES, INPUT_MARKET_RATE,
  INCOME_SOURCES, STAGES, TABS, C, fmt, getId, fmtDate, thisMonthKey, monthKey,
} from './constants';

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
  const s = document.createElement('style'); s.id = 'fl-global'; s.textContent = GLOBAL;
  document.head.appendChild(s);
}

const PAGE = 20;
const serif = { fontFamily: "'Libre Baskerville', serif" };
const sans  = { fontFamily: "'DM Sans', sans-serif" };
const inp   = { width:'100%', border:`0.5px solid rgba(44,44,42,0.22)`, borderRadius:8, padding:'9px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:14, background:'#F7F5F0', color:'#2C2C2A', outline:'none', WebkitAppearance:'none', boxSizing:'border-box' };
const fsel  = { border:`0.5px solid rgba(44,44,42,0.18)`, borderRadius:8, padding:'7px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:12, background:'#fff', color:'#5F5E5A', cursor:'pointer', outline:'none', WebkitAppearance:'none' };

function today() { return new Date().toISOString().split('T')[0]; }

function buildMonths(list) {
  const seen = new Set(), months = [];
  [...list].sort((a,b) => new Date(b.date)-new Date(a.date)).forEach(e => {
    const k = monthKey(e.date);
    if (k && !seen.has(k)) { seen.add(k); months.push({ key:k, label: new Date(e.date).toLocaleDateString('en-IN',{month:'long',year:'numeric'}) }); }
  });
  return months;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const db = useData();
  const [tab,      setTab]      = useState('dashboard');
  const [editItem, setEditItem] = useState(null);  // { type, data }
  const [addType,  setAddType]  = useState(null);  // 'expense'|'income'|'input'|'crop'
  const [toast,    setToast]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2800); };

  const run = async (fn, msg) => {
    setSaving(true);
    try { await fn(); showToast(msg); }
    catch(e) { showToast(e.message); }
    finally { setSaving(false); }
  };

  const cropName = (id) => db.crops.find(c => getId(c) === (id?._id || id))?.name || '—';

  // ─── TAB CONTENT ──────────────────────────────────────────────────────────
  const content = () => {
    if (db.loading) return <Center>Loading…</Center>;
    if (db.error)   return <ErrState msg={db.error} onRetry={db.reload} />;
    switch (tab) {
      case 'dashboard': return <Dashboard db={db} cropName={cropName} />;
      case 'expenses':  return <ListTab collection={db.expenses} type="expense"  db={db} cropName={cropName} onTap={setEditItem} />;
      case 'income':    return <ListTab collection={db.income}   type="income"   db={db} cropName={cropName} onTap={setEditItem} />;
      case 'inputs':    return <InputsTab db={db} cropName={cropName} onTap={setEditItem} />;
      case 'crops':     return <CropsTab db={db} saving={saving} run={run} />;
      default:          return null;
    }
  };

  const addLabel = { expense:'+ Add Expense', income:'+ Add Income', input:'+ Log Input', crop:'+ Add Crop' };
  const tabAddType = { expenses:'expense', income:'income', inputs:'input', crops:'crop' };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.bg, minHeight:'100vh', maxWidth:480, margin:'0 auto', paddingBottom:80 }}>

      {/* ── HEADER ── */}
      <div style={{ background:C.green800, padding:'16px 16px 0', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ ...serif, color:C.green50, fontSize:18, letterSpacing:'-0.01em' }}>
            Farm <span style={{ color:C.green200, fontStyle:'italic' }}>Ledger</span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ background:C.green700, color:C.green100, fontSize:11, fontWeight:500, padding:'3px 9px', borderRadius:20 }}>
              {fmt(db.expenses.reduce((s,e)=>s+Number(e.amount),0))} spent
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:0, overflowX:'auto', scrollbarWidth:'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:'0 0 auto', background: tab===t.id ? C.bg : 'none', border:'none',
              color: tab===t.id ? C.green800 : C.green200,
              fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight: tab===t.id ? 600 : 400,
              padding:'8px 14px 10px', cursor:'pointer', borderRadius:'6px 6px 0 0',
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            }}>
              <span style={{ fontSize:15 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:'14px 14px 0' }}>
        {content()}
      </div>

      {/* ── BOTTOM FAB ── */}
      {tabAddType[tab] && !db.loading && (
        <button
          onClick={() => setAddType(tabAddType[tab])}
          style={{ position:'fixed', bottom:20, right:20, zIndex:90, background:C.green700, color:'#fff', border:'none', borderRadius:999, padding:'14px 20px', ...sans, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 20px rgba(59,109,17,0.4)', display:'flex', alignItems:'center', gap:6 }}>
          {addLabel[tabAddType[tab]]}
        </button>
      )}

      {/* ── ADD SHEET ── */}
      {addType && (
        <Sheet title={addLabel[addType]} onClose={() => setAddType(null)}>
          {addType === 'expense' && (
            <ExpenseForm crops={db.crops} saving={saving}
              onSave={v => run(async () => { await db.addExpense(v); setAddType(null); }, 'Expense added')} />
          )}
          {addType === 'income' && (
            <IncomeForm crops={db.crops} saving={saving}
              onSave={v => run(async () => { await db.addIncome(v); setAddType(null); }, 'Income recorded')} />
          )}
          {addType === 'input' && (
            <InputForm crops={db.crops} saving={saving}
              onSave={v => run(async () => { await db.addInput(v); setAddType(null); }, 'Input logged')} />
          )}
          {addType === 'crop' && (
            <CropForm saving={saving}
              onSave={v => run(async () => { await db.addCrop(v); setAddType(null); }, 'Crop added')} />
          )}
        </Sheet>
      )}

      {/* ── EDIT SHEET ── */}
      {editItem && (
        <EditSheet
          item={editItem}
          crops={db.crops}
          saving={saving}
          onUpdate={(id, v) => run(async () => {
            if (editItem.type==='expense') await db.updateExpense(id, v);
            if (editItem.type==='income')  await db.updateIncome(id, v);
            if (editItem.type==='input')   await db.updateInput(id, v);
            setEditItem(null);
          }, 'Updated')}
          onDelete={(id) => run(async () => {
            if (editItem.type==='expense') await db.deleteExpense(id);
            if (editItem.type==='income')  await db.deleteIncome(id);
            if (editItem.type==='input')   await db.deleteInput(id);
            setEditItem(null);
          }, 'Removed')}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:C.gray900, color:'#fff', padding:'10px 18px', borderRadius:20, fontSize:13, fontWeight:500, zIndex:400, whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ db, cropName }) {
  const mk   = thisMonthKey();
  const mExp = db.expenses.filter(e => monthKey(e.date) === mk);
  const mInc = db.income.filter(i   => monthKey(i.date) === mk);
  const mInp = db.inputs.filter(i   => monthKey(i.date) === mk);

  const totalExpense   = db.expenses.reduce((s,e) => s+Number(e.amount), 0);
  const totalIncome    = db.income.reduce((s,i)   => s+Number(i.amount), 0);
  const totalSavings   = db.inputs.reduce((s,i)   => s+Number(i.marketValue||0)-Number(i.costMade||0), 0);
  const mExpAmt        = mExp.reduce((s,e) => s+Number(e.amount), 0);
  const mIncAmt        = mInc.reduce((s,i) => s+Number(i.amount), 0);
  const mSavings       = mInp.reduce((s,i) => s+Number(i.marketValue||0)-Number(i.costMade||0), 0);
  const mInputCost     = mInp.reduce((s,i) => s+Number(i.costMade||0), 0);
  const mInputMktVal   = mInp.reduce((s,i) => s+Number(i.marketValue||0), 0);
  const netProfit      = totalIncome - totalExpense + totalSavings;

  // By crop breakdown
  const cropBreakdown = db.crops.map(c => {
    const id  = getId(c);
    const exp = db.expenses.filter(e => (e.cropId?._id||e.cropId)===id).reduce((s,e)=>s+Number(e.amount),0);
    const inc = db.income.filter(i   => (i.cropId?._id||i.cropId)===id).reduce((s,i)=>s+Number(i.amount),0);
    const sav = db.inputs.filter(i   => (i.cropId?._id||i.cropId)===id).reduce((s,i)=>s+Number(i.marketValue||0)-Number(i.costMade||0),0);
    return { crop:c, exp, inc, sav, net: inc - exp + sav };
  }).filter(x => x.exp > 0 || x.inc > 0);

  // Inputs by type this month
  const inputByType = {};
  mInp.forEach(i => { if (!inputByType[i.type]) inputByType[i.type]=0; inputByType[i.type]++; });

  const mn = new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});

  return (
    <div>
      {/* Overall KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        <KPICard label="Total Spent"    value={fmt(totalExpense)} color={C.coral400} bg={C.coral50}  />
        <KPICard label="Total Income"   value={fmt(totalIncome)}  color={C.teal400}  bg={C.teal50}   />
        <KPICard label="Input Savings"  value={fmt(totalSavings)} color={C.green600} bg={C.green50}  />
        <KPICard label="Net Balance"    value={fmt(netProfit)}    color={netProfit>=0?C.teal400:C.coral400} bg={netProfit>=0?C.teal50:C.coral50} />
      </div>

      {/* This month panel */}
      <div style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:14 }}>
        <div style={{ ...serif, fontSize:13, color:C.green800, marginBottom:12 }}>{mn}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
          <MiniStat label="Spent"   value={fmt(mExpAmt)}  color={C.coral400} />
          <MiniStat label="Earned"  value={fmt(mIncAmt)}  color={C.teal400}  />
          <MiniStat label="Saved"   value={fmt(mSavings)} color={C.green600} />
        </div>
        {mInp.length > 0 && (
          <div style={{ background:C.green50, borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.green700, marginBottom:6 }}>🌿 Organic Inputs This Month</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              {Object.entries(inputByType).map(([type,count]) => (
                <span key={type} style={{ fontSize:11, background:C.green100, color:C.green800, padding:'2px 8px', borderRadius:999 }}>
                  {type} × {count}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:16, fontSize:12, color:C.green700 }}>
              <span>Cost: <strong>{fmt(mInputCost)}</strong></span>
              <span>Market Value: <strong>{fmt(mInputMktVal)}</strong></span>
              <span>Savings: <strong>{fmt(mSavings)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* By crop */}
      {cropBreakdown.length > 0 && (
        <div style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:14 }}>
          <div style={{ ...serif, fontSize:13, color:C.muted, marginBottom:12 }}>By Crop</div>
          {cropBreakdown.map(({ crop, exp, inc, sav, net }) => (
            <div key={getId(crop)} style={{ paddingBottom:10, marginBottom:10, borderBottom:`0.5px solid ${C.gray50}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontWeight:600, fontSize:14, color:C.text }}>{crop.name}</span>
                <span style={{ fontSize:13, fontWeight:600, color: net>=0?C.teal400:C.coral400 }}>{fmt(net)}</span>
              </div>
              <div style={{ display:'flex', gap:12, fontSize:11, color:C.muted }}>
                <span>Spent: <strong style={{color:C.coral400}}>{fmt(exp)}</strong></span>
                <span>Income: <strong style={{color:C.teal400}}>{fmt(inc)}</strong></span>
                {sav>0 && <span>Saved: <strong style={{color:C.green600}}>{fmt(sav)}</strong></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expense breakdown by category */}
      {db.expenses.length > 0 && <ExpBreakdown expenses={db.expenses} />}

      {/* Inputs used per crop */}
      {db.inputs.length > 0 && (
        <div style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:14 }}>
          <div style={{ ...serif, fontSize:13, color:C.muted, marginBottom:12 }}>Organic Inputs by Crop</div>
          {db.crops.filter(c => db.inputs.some(i => (i.cropId?._id||i.cropId)===getId(c))).map(c => {
            const cropInputs = db.inputs.filter(i => (i.cropId?._id||i.cropId)===getId(c));
            return (
              <div key={getId(c)} style={{ marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>{c.name}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {cropInputs.map(i => (
                    <span key={getId(i)} style={{ fontSize:11, background:C.green50, color:C.green700, border:`0.5px solid ${C.green100}`, padding:'2px 8px', borderRadius:999 }}>
                      {i.type} — {i.quantity} {i.marketValue>0?`(saved ${fmt(i.marketValue)})`:''} 
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExpBreakdown({ expenses }) {
  const totals = {};
  EXP_CATS.forEach(c => totals[c] = 0);
  expenses.forEach(e => { if (totals[e.category]!==undefined) totals[e.category]+=Number(e.amount); });
  const rows = EXP_CATS.filter(c => totals[c]>0).sort((a,b)=>totals[b]-totals[a]);
  const max  = Math.max(...rows.map(c=>totals[c]),1);
  return (
    <div style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:14 }}>
      <div style={{ ...serif, fontSize:13, color:C.muted, marginBottom:12 }}>Expense Breakdown</div>
      {rows.map(c => (
        <div key={c} style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:12, color:C.gray700 }}>{c}</span>
            <span style={{ fontSize:12, fontWeight:500, color:EXP_CAT_COLORS[c] }}>{fmt(totals[c])}</span>
          </div>
          <div style={{ height:5, background:C.gray50, borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:3, background:EXP_CAT_COLORS[c], width:`${Math.round(totals[c]/max*100)}%`, transition:'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LIST TAB (Expenses / Income) ──────────────────────────────────────────────
function ListTab({ collection, type, db, cropName, onTap }) {
  const [month, setMonth]   = useState('');
  const [catF,  setCatF]    = useState('');
  const [page,  setPage]    = useState(1);

  const byMonth = month ? collection.filter(e => monthKey(e.date)===month) : collection;
  const byCat   = catF  ? byMonth.filter(e => (e.category||e.source)===catF) : byMonth;
  const sorted  = [...byCat].sort((a,b) => new Date(b.date)-new Date(a.date));
  const visible = sorted.slice(0, page*PAGE);
  const months  = buildMonths(collection);
  const total   = byMonth.reduce((s,e)=>s+Number(e.amount),0);

  const cats = type==='expense' ? EXP_CATS : INCOME_SOURCES;
  const colors = type==='expense' ? EXP_CAT_COLORS : {};

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        <StatCard label="Total"    value={fmt(total)}           accent={type==='income'} />
        <StatCard label="Entries"  value={byMonth.length} />
        <StatCard label="Showing"  value={`${visible.length}/${sorted.length}`} />
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <select style={{ ...fsel, flex:1 }} value={month} onChange={e => { setMonth(e.target.value); setPage(1); }}>
          <option value="">All months</option>
          {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <select style={{ ...fsel, flex:1 }} value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }}>
          <option value="">All {type==='expense'?'categories':'sources'}</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {sorted.length === 0
        ? <Center>No {type} entries yet.</Center>
        : <>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
              {visible.map(e => (
                <Card key={getId(e)} onClick={() => onTap({ type, data:e })}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: colors[e.category||e.source]||C.teal400, flexShrink:0, marginTop:5 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:2 }}>{e.desc||e.source||'—'}</div>
                    <div style={{ display:'flex', gap:8, fontSize:11, color:C.muted, flexWrap:'wrap' }}>
                      <span>{fmtDate(e.date)}</span>
                      <Tag>{e.category||e.source}</Tag>
                      {cropName(e.cropId)!=='—' && <span style={{ color:C.green600 }}>{cropName(e.cropId)}</span>}
                      {e.qty  && <span>{e.qty}</span>}
                      {e.notes && <span style={{ opacity:0.7 }}>{e.notes}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color: type==='income'?C.teal400:C.text, flexShrink:0 }}>{fmt(e.amount)}</div>
                </Card>
              ))}
            </div>
            {visible.length < sorted.length
              ? <LoadMore remaining={sorted.length-visible.length} onLoad={() => setPage(p=>p+1)} />
              : sorted.length > PAGE && <AllShown count={sorted.length} />
            }
          </>
      }
    </div>
  );
}

// ── INPUTS TAB ────────────────────────────────────────────────────────────────
function InputsTab({ db, cropName, onTap }) {
  const [page, setPage] = useState(1);
  const sorted  = [...db.inputs].sort((a,b) => new Date(b.date)-new Date(a.date));
  const visible = sorted.slice(0, page*PAGE);
  const totalSaved = db.inputs.reduce((s,i)=>s+Number(i.marketValue||0)-Number(i.costMade||0), 0);
  const totalCost  = db.inputs.reduce((s,i)=>s+Number(i.costMade||0), 0);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <StatCard label="Total Cost"    value={fmt(totalCost)}  />
        <StatCard label="Total Savings" value={fmt(totalSaved)} accent />
        <StatCard label="Batches"       value={db.inputs.length} />
        <StatCard label="Showing"       value={`${visible.length}/${sorted.length}`} />
      </div>

      {sorted.length === 0
        ? <Center>No inputs logged yet.{'\n'}Log organic inputs you prepare on-farm.</Center>
        : <>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
              {visible.map(i => {
                const saved = Number(i.marketValue||0) - Number(i.costMade||0);
                return (
                  <Card key={getId(i)} onClick={() => onTap({ type:'input', data:i })}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:C.green600, flexShrink:0, marginTop:5 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:2 }}>{i.type}</div>
                      <div style={{ display:'flex', gap:8, fontSize:11, color:C.muted, flexWrap:'wrap' }}>
                        <span>{fmtDate(i.date)}</span>
                        <Tag>{i.quantity}</Tag>
                        {cropName(i.cropId)!=='—' && <span style={{ color:C.green600 }}>{cropName(i.cropId)}</span>}
                        {saved>0 && <span style={{ color:C.green600, fontWeight:500 }}>saved {fmt(saved)}</span>}
                        {i.notes && <span style={{ opacity:0.7 }}>{i.notes}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {i.costMade > 0 && <div style={{ fontSize:12, color:C.coral400 }}>{fmt(i.costMade)}</div>}
                      {i.marketValue > 0 && <div style={{ fontSize:11, color:C.green600 }}>≈{fmt(i.marketValue)}</div>}
                    </div>
                  </Card>
                );
              })}
            </div>
            {visible.length < sorted.length
              ? <LoadMore remaining={sorted.length-visible.length} onLoad={() => setPage(p=>p+1)} />
              : sorted.length > PAGE && <AllShown count={sorted.length} />
            }
          </>
      }
    </div>
  );
}

// ── CROPS TAB ─────────────────────────────────────────────────────────────────
function CropsTab({ db, saving, run }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {db.crops.length === 0 && <Center>No crops yet. Tap the button below to add one.</Center>}
      {db.crops.map(c => {
        const id  = getId(c);
        const exp = db.expenses.filter(e=>(e.cropId?._id||e.cropId)===id).reduce((s,e)=>s+Number(e.amount),0);
        const inc = db.income.filter(i  =>(i.cropId?._id||i.cropId)===id).reduce((s,i)=>s+Number(i.amount),0);
        const si  = STAGES.indexOf(c.stage);
        return (
          <div key={id} style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{c.name}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{c.season}{c.sowDate?` · Sown: ${fmtDate(c.sowDate)}`:''}</div>
                {/* Stage progress */}
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center', margin:'10px 0 6px', padding:'0 2px' }}>
                  <div style={{ position:'absolute', left:2, right:2, height:3, background:C.gray50, borderRadius:2 }} />
                  <div style={{ position:'absolute', left:2, height:3, borderRadius:2, background:C.green600, width:`${(si/(STAGES.length-1))*100}%`, transition:'width 0.4s' }} />
                  {STAGES.map((_,i) => (
                    <div key={i} style={{ width:10, height:10, borderRadius:'50%', zIndex:2, background:i<=si?C.green600:C.gray50, border:`2px solid ${i<=si?C.green600:C.gray100}` }} />
                  ))}
                </div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                  {STAGES.map((s,i) => (
                    <button key={s} onClick={() => run(()=>db.updateCrop(id,{stage:s}), `Stage → ${s}`)}
                      style={{ fontSize:9, padding:'2px 7px', borderRadius:999, border:`1px solid ${i===si?C.green600:C.gray100}`, background:i===si?C.green700:'transparent', color:i===si?'#fff':C.gray400, cursor:'pointer', ...sans }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                <div style={{ fontSize:12, color:C.coral400 }}>Spent: {fmt(exp)}</div>
                <div style={{ fontSize:12, color:C.teal400, marginTop:2 }}>Income: {fmt(inc)}</div>
                <button onClick={() => run(()=>db.deleteCrop(id), 'Crop removed')}
                  style={{ marginTop:8, fontSize:11, color:C.coral400, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── EDIT SHEET ────────────────────────────────────────────────────────────────
function EditSheet({ item, crops, saving, onUpdate, onDelete, onClose }) {
  const { type, data } = item;
  const [v, setV]       = useState({ ...data, cropId: data.cropId?._id||data.cropId||'' });
  const [confirm, setConfirm] = useState(false);
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));

  return (
    <Sheet title={`Edit ${type.charAt(0).toUpperCase()+type.slice(1)}`} onClose={onClose}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Amount (₹)">
          <input style={inp} type="number" inputMode="numeric" value={v.amount||''} onChange={e=>set('amount',e.target.value)} />
        </FF>
        <FF label="Date">
          <input style={inp} type="date" value={v.date||''} onChange={e=>set('date',e.target.value)} />
        </FF>
      </div>

      {type==='expense' && <>
        <FF label="Description" mb={10}>
          <input style={inp} value={v.desc||''} onChange={e=>set('desc',e.target.value)} />
        </FF>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <FF label="Category">
            <select style={inp} value={v.category||''} onChange={e=>set('category',e.target.value)}>
              {EXP_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </FF>
          <FF label="Crop">
            <select style={inp} value={v.cropId||''} onChange={e=>set('cropId',e.target.value)}>
              <option value="">— None —</option>
              {crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}
            </select>
          </FF>
        </div>
      </>}

      {type==='income' && <>
        <FF label="Source" mb={10}>
          <select style={inp} value={v.source||''} onChange={e=>set('source',e.target.value)}>
            {INCOME_SOURCES.map(s=><option key={s}>{s}</option>)}
          </select>
        </FF>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <FF label="Quantity"><input style={inp} value={v.qty||''} onChange={e=>set('qty',e.target.value)} placeholder="e.g. 10 bags" /></FF>
          <FF label="Crop">
            <select style={inp} value={v.cropId||''} onChange={e=>set('cropId',e.target.value)}>
              <option value="">— None —</option>
              {crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}
            </select>
          </FF>
        </div>
      </>}

      {type==='input' && <>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <FF label="Type">
            <select style={inp} value={v.type||''} onChange={e=>set('type',e.target.value)}>
              {INPUT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </FF>
          <FF label="Quantity"><input style={inp} value={v.quantity||''} onChange={e=>set('quantity',e.target.value)} /></FF>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <FF label="Cost Made (₹)"><input style={inp} type="number" value={v.costMade||''} onChange={e=>set('costMade',e.target.value)} /></FF>
          <FF label="Market Value (₹)"><input style={inp} type="number" value={v.marketValue||''} onChange={e=>set('marketValue',e.target.value)} /></FF>
        </div>
        <FF label="Crop" mb={10}>
          <select style={inp} value={v.cropId||''} onChange={e=>set('cropId',e.target.value)}>
            <option value="">— None —</option>
            {crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}
          </select>
        </FF>
      </>}

      <FF label="Notes" mb={18}>
        <input style={inp} value={v.notes||''} placeholder="Optional notes…" onChange={e=>set('notes',e.target.value)} />
      </FF>

      <button onClick={() => onUpdate(getId(data), { ...v, amount:Number(v.amount||0), costMade:Number(v.costMade||0), marketValue:Number(v.marketValue||0), cropId:v.cropId||null })}
        disabled={saving}
        style={{ width:'100%', background:C.green700, color:'#fff', border:'none', borderRadius:10, padding:13, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', marginBottom:10, opacity:saving?0.6:1 }}>
        {saving?'Saving…':'Save Changes'}
      </button>

      {!confirm
        ? <button onClick={()=>setConfirm(true)} style={{ width:'100%', background:'none', border:`0.5px solid ${C.coral400}44`, borderRadius:10, padding:13, ...sans, fontSize:14, color:C.coral400, cursor:'pointer' }}>Delete Entry</button>
        : <div style={{ background:C.coral50, border:`0.5px solid ${C.coral400}66`, borderRadius:10, padding:14 }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:12, textAlign:'center' }}>Are you sure? This cannot be undone.</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setConfirm(false)} style={{ flex:1, background:'none', border:`0.5px solid ${C.borderSt}`, borderRadius:8, padding:11, ...sans, fontSize:14, cursor:'pointer', color:C.muted }}>Cancel</button>
              <button onClick={()=>onDelete(getId(data))} disabled={saving} style={{ flex:1, background:C.coral400, color:'#fff', border:'none', borderRadius:8, padding:11, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>{saving?'Deleting…':'Yes, delete'}</button>
            </div>
          </div>
      }
    </Sheet>
  );
}

// ── ADD FORMS ─────────────────────────────────────────────────────────────────
function ExpenseForm({ crops, saving, onSave }) {
  const [v, setV] = useState({ amount:'', desc:'', date:today(), category:EXP_CATS[0], notes:'', cropId:'' });
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Amount (₹)"><input style={inp} type="number" inputMode="numeric" placeholder="0" value={v.amount} onChange={e=>set('amount',e.target.value)} autoFocus /></FF>
        <FF label="Date"><input style={inp} type="date" value={v.date} onChange={e=>set('date',e.target.value)} /></FF>
      </div>
      <FF label="Description" mb={10}><input style={inp} placeholder="What was this for?" value={v.desc} onChange={e=>set('desc',e.target.value)} /></FF>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Category"><select style={inp} value={v.category} onChange={e=>set('category',e.target.value)}>{EXP_CATS.map(c=><option key={c}>{c}</option>)}</select></FF>
        <FF label="Crop"><select style={inp} value={v.cropId} onChange={e=>set('cropId',e.target.value)}><option value="">— None —</option>{crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}</select></FF>
      </div>
      <FF label="Notes (optional)" mb={16}><input style={inp} placeholder="…" value={v.notes} onChange={e=>set('notes',e.target.value)} /></FF>
      <button onClick={() => { if(!v.amount||!v.desc.trim()) return; onSave({...v,amount:Number(v.amount),cropId:v.cropId||null}); }} disabled={saving}
        style={{ width:'100%', background:C.green700, color:'#fff', border:'none', borderRadius:10, padding:13, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>
        {saving?'Saving…':'Save Expense'}
      </button>
    </div>
  );
}

function IncomeForm({ crops, saving, onSave }) {
  const [v, setV] = useState({ amount:'', source:INCOME_SOURCES[0], date:today(), qty:'', notes:'', cropId:'' });
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Amount (₹)"><input style={inp} type="number" inputMode="numeric" placeholder="0" value={v.amount} onChange={e=>set('amount',e.target.value)} autoFocus /></FF>
        <FF label="Date"><input style={inp} type="date" value={v.date} onChange={e=>set('date',e.target.value)} /></FF>
      </div>
      <FF label="Source" mb={10}><select style={inp} value={v.source} onChange={e=>set('source',e.target.value)}>{INCOME_SOURCES.map(s=><option key={s}>{s}</option>)}</select></FF>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Quantity / Detail"><input style={inp} placeholder="e.g. 10 bags" value={v.qty} onChange={e=>set('qty',e.target.value)} /></FF>
        <FF label="Crop"><select style={inp} value={v.cropId} onChange={e=>set('cropId',e.target.value)}><option value="">— None —</option>{crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}</select></FF>
      </div>
      <FF label="Notes (optional)" mb={16}><input style={inp} placeholder="…" value={v.notes} onChange={e=>set('notes',e.target.value)} /></FF>
      <button onClick={() => { if(!v.amount) return; onSave({...v,amount:Number(v.amount),cropId:v.cropId||null}); }} disabled={saving}
        style={{ width:'100%', background:C.teal400, color:'#fff', border:'none', borderRadius:10, padding:13, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>
        {saving?'Saving…':'Record Income'}
      </button>
    </div>
  );
}

function InputForm({ crops, saving, onSave }) {
  const [v, setV] = useState({ type:INPUT_TYPES[0], quantity:'', date:today(), costMade:'', marketValue:'', notes:'', cropId:'' });
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  const autoVal = INPUT_MARKET_RATE[v.type] || 0;
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Input Type"><select style={inp} value={v.type} onChange={e=>set('type',e.target.value)} autoFocus>{INPUT_TYPES.map(t=><option key={t}>{t}</option>)}</select></FF>
        <FF label="Quantity"><input style={inp} placeholder="e.g. 10 litres" value={v.quantity} onChange={e=>set('quantity',e.target.value)} /></FF>
      </div>
      <FF label="Date" mb={10}><input style={inp} type="date" value={v.date} onChange={e=>set('date',e.target.value)} /></FF>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <FF label="Cost to Make (₹)"><input style={inp} type="number" inputMode="numeric" placeholder="0" value={v.costMade} onChange={e=>set('costMade',e.target.value)} /></FF>
        <FF label="Market Value (₹)">
          <input style={inp} type="number" inputMode="numeric" placeholder={autoVal>0?`≈${autoVal}/unit`:'0'} value={v.marketValue} onChange={e=>set('marketValue',e.target.value)} />
        </FF>
      </div>
      {autoVal > 0 && (
        <div style={{ fontSize:11, color:C.green700, background:C.green50, borderRadius:7, padding:'6px 10px', marginBottom:10 }}>
          💡 Market rate for {v.type} ≈ ₹{autoVal}/unit
        </div>
      )}
      <FF label="Crop" mb={10}><select style={inp} value={v.cropId} onChange={e=>set('cropId',e.target.value)}><option value="">— None —</option>{crops.map(c=><option key={getId(c)} value={getId(c)}>{c.name}</option>)}</select></FF>
      <FF label="Notes (optional)" mb={16}><input style={inp} placeholder="Ingredients, method…" value={v.notes} onChange={e=>set('notes',e.target.value)} /></FF>
      <button onClick={() => { if(!v.quantity) return; onSave({...v,costMade:Number(v.costMade||0),marketValue:Number(v.marketValue||0),cropId:v.cropId||null}); }} disabled={saving}
        style={{ width:'100%', background:C.green700, color:'#fff', border:'none', borderRadius:10, padding:13, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>
        {saving?'Saving…':'Log Input'}
      </button>
    </div>
  );
}

function CropForm({ saving, onSave }) {
  const [v, setV] = useState({ name:'', season:SEASONS[0], stage:'Sowing', sowDate:'' });
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  return (
    <div>
      <FF label="Crop Name" mb={10}><input style={inp} placeholder="e.g. Paddy" value={v.name} onChange={e=>set('name',e.target.value)} autoFocus /></FF>
      <FF label="Season" mb={10}><select style={inp} value={v.season} onChange={e=>set('season',e.target.value)}>{SEASONS.map(s=><option key={s}>{s}</option>)}</select></FF>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        <FF label="Stage"><select style={inp} value={v.stage} onChange={e=>set('stage',e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></FF>
        <FF label="Sow Date"><input style={inp} type="date" value={v.sowDate} onChange={e=>set('sowDate',e.target.value)} /></FF>
      </div>
      <button onClick={() => { if(!v.name.trim()) return; onSave(v); }} disabled={saving}
        style={{ width:'100%', background:C.green700, color:'#fff', border:'none', borderRadius:10, padding:13, ...sans, fontSize:14, fontWeight:500, cursor:'pointer', opacity:saving?0.6:1 }}>
        {saving?'Saving…':'Add Crop'}
      </button>
    </div>
  );
}

// ── SMALL SHARED COMPONENTS ───────────────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#00000055', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.bg, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'92vh', overflowY:'auto', padding:'20px 16px 36px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ ...serif, fontSize:15, color:C.green800 }}>{title}</div>
          <button onClick={onClose} style={{ background:C.gray50, border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:16, color:C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ onClick, children }) {
  return (
    <div onClick={onClick} style={{ background:'#fff', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'11px 12px', display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', transition:'background 0.1s' }}
      onMouseEnter={e=>e.currentTarget.style.background='#f5f3ee'}
      onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background:'#fff', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'10px 12px' }}>
      <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:15, fontWeight:500, color: accent?C.teal400:C.text }}>{value}</div>
    </div>
  );
}

function KPICard({ label, value, color, bg }) {
  return (
    <div style={{ background:bg, border:`0.5px solid ${color}33`, borderRadius:12, padding:'12px 14px' }}>
      <div style={{ fontSize:10, color:color, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4, opacity:0.8 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:600, color }}>{value}</div>
    </div>
  );
}

function FF({ label, children, mb=0 }) {
  return (
    <div style={{ marginBottom:mb }}>
      <label style={{ display:'block', fontSize:11, fontWeight:500, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function Tag({ children }) {
  return <span style={{ background:C.gray50, padding:'1px 6px', borderRadius:4 }}>{children}</span>;
}

function Center({ children }) {
  return <div style={{ textAlign:'center', padding:'40px 20px', color:C.muted, fontSize:14, whiteSpace:'pre-line' }}>{children}</div>;
}

function LoadMore({ remaining, onLoad }) {
  return (
    <button onClick={onLoad} style={{ width:'100%', background:'none', border:`0.5px solid ${C.borderSt}`, borderRadius:10, padding:'11px', ...sans, fontSize:13, color:C.muted, cursor:'pointer', marginBottom:20 }}>
      Load more · {remaining} remaining
    </button>
  );
}

function AllShown({ count }) {
  return <div style={{ textAlign:'center', fontSize:11, color:C.gray200, marginBottom:20 }}>All {count} entries shown</div>;
}

function ErrState({ msg, onRetry }) {
  return (
    <div style={{ background:C.coral50, border:`0.5px solid ${C.coral400}`, borderRadius:10, padding:14, marginBottom:14 }}>
      <div style={{ color:C.coral400, fontWeight:600, fontSize:13, marginBottom:4 }}>Failed to load</div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>{msg}</div>
      <button onClick={onRetry} style={{ background:C.coral400, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer' }}>Retry</button>
    </div>
  );
}
