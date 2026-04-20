import { useMemo, useState } from 'react';
import { KPI, Card, Badge, TwoCol } from './UI';
import { fmt, getId, stageColor, catColor, STAGES, EXP_CATS, S } from '../utils';

// ── ANALYTICS HELPER ──────────────────────────────────────────────────────────
export function useAnalytics(data) {
  return useMemo(() => data.crops.map(crop => {
    const plot      = data.plots.find(p => getId(p) === (crop.plotId?._id || crop.plotId));
    const exps      = data.expenses.filter(e => (e.cropId?._id || e.cropId) === getId(crop));
    const ylds      = data.yields.filter(y => (y.cropId?._id || y.cropId) === getId(crop));
    const totalCost = exps.reduce((s, e) => s + e.amount, 0);
    const totalRev  = ylds.reduce((s, y) => s + y.quantity * y.salePrice, 0);
    const profit    = totalRev - totalCost;
    const acres     = plot?.acres || 1;
    const labour    = exps.filter(e => e.category === 'Labour').reduce((s, e) => s + e.amount, 0);
    const inputs    = exps.filter(e => e.category === 'Inputs').reduce((s, e) => s + e.amount, 0);
    const irrig     = exps.filter(e => e.category === 'Irrigation').reduce((s, e) => s + e.amount, 0);
    return {
      crop, plot, totalCost, totalRev, profit,
      profitPerAcre: profit / acres,
      labourPct:  totalCost ? Math.round(labour / totalCost * 100) : 0,
      inputsPct:  totalCost ? Math.round(inputs / totalCost * 100) : 0,
      irrigPct:   totalCost ? Math.round(irrig  / totalCost * 100) : 0,
      yldTotal:   ylds.reduce((s, y) => s + y.quantity, 0),
    };
  }), [data]);
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export function Dashboard({ analytics, data }) {
  const totalRev    = analytics.reduce((s, a) => s + a.totalRev,  0);
  const totalCost   = analytics.reduce((s, a) => s + a.totalCost, 0);
  const totalProfit = totalRev - totalCost;
  const active      = data.crops.filter(c => c.stage !== 'Done').length;

  return (
    <div>
      <div style={S.kpiGrid}>
        <KPI label="Total Revenue" value={fmt(totalRev)}    accent="#22c55e" icon="📈" />
        <KPI label="Total Cost"    value={fmt(totalCost)}   accent="#f97316" icon="💸" />
        <KPI label="Net Profit"    value={fmt(totalProfit)} accent={totalProfit >= 0 ? '#22c55e' : '#ef4444'} icon="💰" />
        <KPI label="Active Crops"  value={active}           accent="#a855f7" icon="🌱" />
      </div>

      <TwoCol>
        <Card title="Crop Performance">
          {analytics.map(a => (
            <div key={getId(a.crop)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f172a' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{a.crop.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{a.plot?.name} · {a.crop.season}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: a.profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 13 }}>{fmt(a.profit)}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Cost: {fmt(a.totalCost)}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Plot Overview">
          {data.plots.map(plot => {
            const plotCrops = data.crops.filter(c => (c.plotId?._id || c.plotId) === getId(plot));
            return (
              <div key={getId(plot)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f172a', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{plot.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{plot.acres} acres · {plotCrops.length} crop(s)</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {plotCrops.map(c => <Badge key={getId(c)} label={c.name} color={stageColor(c.stage)} />)}
                </div>
              </div>
            );
          })}
        </Card>
      </TwoCol>

      <Card title="Cost Breakdown by Crop">
        {analytics.filter(a => a.totalCost > 0).map(a => (
          <div key={getId(a.crop)} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{a.crop.name}</span>
              <span style={{ color: '#64748b', fontSize: 11 }}>Labour {a.labourPct}% · Inputs {a.inputsPct}% · Irrigation {a.irrigPct}%</span>
            </div>
            <div style={S.barTrack}>
              <div style={{ ...S.barSeg, width: `${a.labourPct}%`, background: '#fb923c' }} />
              <div style={{ ...S.barSeg, width: `${a.inputsPct}%`, background: '#34d399' }} />
              <div style={{ ...S.barSeg, width: `${a.irrigPct}%`,  background: '#60a5fa' }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {[['#fb923c','Labour'],['#34d399','Inputs'],['#60a5fa','Irrigation']].map(([col,lab]) => (
            <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: col }} />{lab}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── CROPS ─────────────────────────────────────────────────────────────────────
export function Crops({ data, analytics, onStageChange, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.crops.length === 0 && <Empty message="No crops yet. Click '+ Add Crop' to get started." />}
      {data.crops.map(crop => {
        const plot     = data.plots.find(p => getId(p) === (crop.plotId?._id || crop.plotId));
        const a        = analytics.find(a => getId(a.crop) === getId(crop));
        const stageIdx = STAGES.indexOf(crop.stage);
        return (
          <div key={getId(crop)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: '#f0fdf4' }}>{crop.name}</span>
                  <Badge label={crop.stage} color={stageColor(crop.stage)} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{plot?.name} · {crop.season} · Sown: {crop.sowDate || '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {STAGES.map((s, i) => (
                  <button key={s}
                    style={{ fontSize: 10, padding: '4px 9px', borderRadius: 999, cursor: 'pointer', fontWeight: 600, border: `1px solid ${i === stageIdx ? stageColor(s) : '#334155'}`, background: i === stageIdx ? stageColor(s) : 'transparent', color: i === stageIdx ? '#fff' : '#64748b' }}
                    onClick={() => onStageChange(getId(crop), s)}>{s}
                  </button>
                ))}
                <button style={S.delBtn} onClick={() => onDelete(getId(crop))}>Delete</button>
              </div>
            </div>

            {/* Progress */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 10px', padding: '0 4px' }}>
              <div style={{ position: 'absolute', left: 4, right: 4, height: 3, background: '#1e293b', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 4, height: 3, borderRadius: 2, background: stageColor(crop.stage), width: `${(stageIdx / (STAGES.length - 1)) * 100}%`, transition: 'width 0.4s' }} />
              {STAGES.map((s, i) => (
                <div key={s} style={{ width: 13, height: 13, borderRadius: '50%', zIndex: 2, background: i <= stageIdx ? stageColor(crop.stage) : '#1e293b', border: `2px solid ${i <= stageIdx ? stageColor(crop.stage) : '#334155'}` }} />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
              {[['Cost', fmt(a?.totalCost||0),'#fb923c'],['Revenue',fmt(a?.totalRev||0),'#22c55e'],['Profit',fmt(a?.profit||0),(a?.profit||0)>=0?'#22c55e':'#ef4444'],['Yield',`${a?.yldTotal||0} qtl`,'#60a5fa']].map(([label,val,col]) => (
                <div key={label} style={{ background: '#0f172a', borderRadius: 10, padding: '9px 11px' }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontWeight: 800, color: col, fontSize: 13, marginTop: 3 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────
export function Expenses({ data, onDelete }) {
  const [filter, setFilter] = useState('All');
  const cats     = ['All', ...EXP_CATS];
  const filtered = filter === 'All' ? data.expenses : data.expenses.filter(e => e.category === filter);
  const cols     = '100px 1fr 100px 1fr 100px 60px';
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${filter===c?'#166534':'#1e293b'}`, background: filter===c?'#14532d':'transparent', color: filter===c?'#4ade80':'#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{c}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <Empty message="No expenses recorded yet." /> : (
        <div style={S.table}>
          <div style={{ ...S.tHead, gridTemplateColumns: cols }}><span>Date</span><span>Crop</span><span>Category</span><span>Note</span><span style={{textAlign:'right'}}>Amount</span><span /></div>
          {filtered.map(e => {
            const crop = data.crops.find(c => getId(c) === (e.cropId?._id || e.cropId));
            return (
              <div key={getId(e)} style={{ ...S.tRow, gridTemplateColumns: cols }}>
                <span style={{ color: '#64748b' }}>{e.date}</span>
                <span style={{ fontWeight: 600 }}>{crop?.name || '—'}</span>
                <span><Badge label={e.category} color={catColor(e.category)} /></span>
                <span style={{ color: '#94a3b8' }}>{e.note}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#fb923c' }}>{fmt(e.amount)}</span>
                <span><button style={S.delBtn} onClick={() => onDelete(getId(e))}>✕</button></span>
              </div>
            );
          })}
          <div style={{ ...S.tRow, gridTemplateColumns: cols, borderTop: '2px solid #1e293b' }}>
            <span/><span/><span/><span style={{fontWeight:700,color:'#e2e8f0'}}>Total</span>
            <span style={{textAlign:'right',fontWeight:800,color:'#f97316',fontSize:15}}>{fmt(filtered.reduce((s,e)=>s+e.amount,0))}</span>
            <span/>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LABOUR ────────────────────────────────────────────────────────────────────
export function Labour({ data, onDelete }) {
  const total = data.labourLogs.reduce((s, l) => s + l.workers * l.wagePerDay, 0);
  const cols  = '100px 1fr 1fr 70px 100px 100px 60px';
  return (
    <div>
      <div style={S.kpiGrid}>
        <KPI label="Labour Cost"  value={fmt(total)} accent="#fb923c" icon="💰" />
        <KPI label="Work Entries" value={data.labourLogs.length} accent="#a855f7" icon="📋" />
        <KPI label="Worker-Days"  value={data.labourLogs.reduce((s,l)=>s+l.workers,0)} accent="#22c55e" icon="👷" />
      </div>
      {data.labourLogs.length === 0 ? <Empty message="No labour logs yet." /> : (
        <div style={S.table}>
          <div style={{ ...S.tHead, gridTemplateColumns: cols }}><span>Date</span><span>Crop</span><span>Task</span><span style={{textAlign:'center'}}>Workers</span><span>Wage/Day</span><span style={{textAlign:'right'}}>Total</span><span /></div>
          {data.labourLogs.map(l => {
            const crop = data.crops.find(c => getId(c) === (l.cropId?._id || l.cropId));
            return (
              <div key={getId(l)} style={{ ...S.tRow, gridTemplateColumns: cols }}>
                <span style={{ color: '#64748b' }}>{l.date}</span>
                <span style={{ fontWeight: 600 }}>{crop?.name}</span>
                <span style={{ color: '#94a3b8' }}>{l.task}</span>
                <span style={{ textAlign: 'center' }}>{l.workers}</span>
                <span style={{ color: '#94a3b8' }}>{fmt(l.wagePerDay)}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#fb923c' }}>{fmt(l.workers * l.wagePerDay)}</span>
                <span><button style={S.delBtn} onClick={() => onDelete(getId(l))}>✕</button></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MATERIALS ─────────────────────────────────────────────────────────────────
export function Materials({ data, onDelete }) {
  const cols = '1fr 100px 100px 110px 120px 60px';
  return (
    <div>
      {data.materials.length === 0 ? <Empty message="No materials in inventory yet." /> : (
        <div style={S.table}>
          <div style={{ ...S.tHead, gridTemplateColumns: cols }}><span>Item</span><span>Category</span><span>Qty</span><span style={{textAlign:'right'}}>Cost/Unit</span><span style={{textAlign:'right'}}>Total</span><span /></div>
          {data.materials.map(m => (
            <div key={getId(m)} style={{ ...S.tRow, gridTemplateColumns: cols }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span><span style={{ ...S.badge, background: '#1e293b', color: '#94a3b8' }}>{m.category}</span></span>
              <span>{m.qty} {m.unit}</span>
              <span style={{ textAlign: 'right', color: '#94a3b8' }}>{fmt(m.costPerUnit)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{fmt(m.qty * m.costPerUnit)}</span>
              <span><button style={S.delBtn} onClick={() => onDelete(getId(m))}>✕</button></span>
            </div>
          ))}
          <div style={{ ...S.tRow, gridTemplateColumns: cols, borderTop: '2px solid #1e293b' }}>
            <span/><span/><span/><span style={{fontWeight:700,color:'#e2e8f0'}}>Total Value</span>
            <span style={{textAlign:'right',fontWeight:800,color:'#34d399',fontSize:15}}>{fmt(data.materials.reduce((s,m)=>s+m.qty*m.costPerUnit,0))}</span>
            <span/>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MANURE ────────────────────────────────────────────────────────────────────
export function Manure({ data, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.manureLogs.length === 0 && <Empty message="No manure/biofertilizer logs yet." />}
      {data.manureLogs.map(m => {
        const plot = data.plots.find(p => getId(p) === (m.plotId?._id || m.plotId));
        return (
          <div key={getId(m)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>🍃 {m.type}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{plot?.name} · {m.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#14532d', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#4ade80', fontSize: 18 }}>{m.quantity}</div>
                  <div style={{ fontSize: 11, color: '#166534' }}>{m.unit}</div>
                </div>
                <button style={S.delBtn} onClick={() => onDelete(getId(m))}>✕</button>
              </div>
            </div>
            {m.notes && <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8', padding: '8px 12px', background: '#0f172a', borderRadius: 8, borderLeft: '3px solid #166534' }}>📝 {m.notes}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── YIELDS ────────────────────────────────────────────────────────────────────
export function Yields({ data, onDelete }) {
  const cols = '100px 1fr 110px 120px 110px 60px';
  return (
    <div>
      <div style={S.kpiGrid}>
        <KPI label="Total Revenue" value={fmt(data.yields.reduce((s,y)=>s+y.quantity*y.salePrice,0))} accent="#22c55e" icon="🌾" />
        <KPI label="Entries" value={data.yields.length} accent="#3b82f6" icon="📋" />
      </div>
      {data.yields.length === 0 ? <Empty message="No yields recorded yet." /> : (
        <div style={S.table}>
          <div style={{ ...S.tHead, gridTemplateColumns: cols }}><span>Date</span><span>Crop</span><span>Quantity</span><span>Sale Price</span><span style={{textAlign:'right'}}>Revenue</span><span /></div>
          {data.yields.map(y => {
            const crop = data.crops.find(c => getId(c) === (y.cropId?._id || y.cropId));
            return (
              <div key={getId(y)} style={{ ...S.tRow, gridTemplateColumns: cols }}>
                <span style={{ color: '#64748b' }}>{y.date}</span>
                <span style={{ fontWeight: 600 }}>{crop?.name}</span>
                <span>{y.quantity} {y.unit}</span>
                <span style={{ color: '#94a3b8' }}>{fmt(y.salePrice)}/{y.unit}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmt(y.quantity*y.salePrice)}</span>
                <span><button style={S.delBtn} onClick={() => onDelete(getId(y))}>✕</button></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export function Analytics({ analytics, data }) {
  const seasons = [...new Set(data.crops.map(c => c.season))];
  const maxPPA  = Math.max(...analytics.map(a => Math.abs(a.profitPerAcre)), 1);
  return (
    <div>
      <div style={S.kpiGrid}>
        {analytics.map(a => (
          <div key={getId(a.crop)} style={{ ...S.kpiCard, borderColor: (a.profit>=0?'#22c55e':'#ef4444')+'44' }}>
            <div style={S.kpiIcon}>🌿</div>
            <div style={S.kpiLabel}>{a.crop.name}</div>
            <div style={{ ...S.kpiVal, color: a.profit>=0?'#22c55e':'#ef4444' }}>{fmt(a.profit)}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>₹{Math.round(a.profitPerAcre).toLocaleString('en-IN')}/acre</div>
          </div>
        ))}
      </div>

      <Card title="Season Comparison">
        {seasons.map(season => {
          const sc  = analytics.filter(a => a.crop.season === season);
          const rev = sc.reduce((s,a)=>s+a.totalRev, 0);
          const cst = sc.reduce((s,a)=>s+a.totalCost,0);
          const pft = rev - cst;
          return (
            <div key={season} style={{ padding: 14, background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{season}</span>
                <span style={{ color: pft>=0?'#22c55e':'#ef4444', fontWeight: 700, fontSize: 13 }}>{fmt(pft)}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#64748b' }}>
                <span>Revenue: <strong style={{color:'#22c55e'}}>{fmt(rev)}</strong></span>
                <span>Cost: <strong style={{color:'#fb923c'}}>{fmt(cst)}</strong></span>
                <span>Crops: <strong style={{color:'#e2e8f0'}}>{sc.length}</strong></span>
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="Profit per Acre Ranking">
        {[...analytics].sort((a,b)=>b.profitPerAcre-a.profitPerAcre).map((a,i) => (
          <div key={getId(a.crop)} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#e2e8f0', fontSize: 13 }}>#{i+1} {a.crop.name} <span style={{color:'#64748b'}}>({a.plot?.name})</span></span>
              <span style={{ color: a.profitPerAcre>=0?'#22c55e':'#ef4444', fontWeight: 700, fontSize: 12 }}>₹{Math.round(a.profitPerAcre).toLocaleString('en-IN')}/acre</span>
            </div>
            <div style={S.barTrack}>
              <div style={{ ...S.barSeg, width:`${Math.abs(a.profitPerAcre)/maxPPA*100}%`, background: a.profitPerAcre>=0?'#22c55e':'#ef4444' }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
function Empty({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#475569', fontSize: 14, background: '#0a1628', borderRadius: 14, border: '1px dashed #1e293b' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
      {message}
    </div>
  );
}
