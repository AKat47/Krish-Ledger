import { useMemo, useState } from 'react';
import { KPI, Card, Badge } from '../components/UI';
import { fmt, getId, stageColor, catColor, STAGES, EXP_CATS, S } from '../utils';

// ── ANALYTICS (no acres / profitPerAcre removed) ──────────────────────────────
export function useAnalytics(data) {
  return useMemo(() => data.crops.map(crop => {
    const plot      = data.plots.find(p => getId(p) === (crop.plotId?._id || crop.plotId));
    const exps      = data.expenses.filter(e => (e.cropId?._id || e.cropId) === getId(crop));
    const ylds      = data.yields.filter(y => (y.cropId?._id || y.cropId) === getId(crop));
    const totalCost = exps.reduce((s, e) => s + e.amount, 0);
    const totalRev  = ylds.reduce((s, y) => s + y.quantity * y.salePrice, 0);
    const profit    = totalRev - totalCost;
    const labour    = exps.filter(e => e.category === 'Labour').reduce((s, e) => s + e.amount, 0);
    const inputs    = exps.filter(e => e.category === 'Inputs').reduce((s, e) => s + e.amount, 0);
    const irrig     = exps.filter(e => e.category === 'Irrigation').reduce((s, e) => s + e.amount, 0);
    return {
      crop, plot, totalCost, totalRev, profit,
      labourPct: totalCost ? Math.round(labour / totalCost * 100) : 0,
      inputsPct: totalCost ? Math.round(inputs / totalCost * 100) : 0,
      irrigPct:  totalCost ? Math.round(irrig  / totalCost * 100) : 0,
      yldTotal:  ylds.reduce((s, y) => s + y.quantity, 0),
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
      <div className="fl-kpi-grid" style={S.kpiGrid}>
        <KPI label="Total Revenue" value={fmt(totalRev)}    accent="#22c55e" icon="📈" />
        <KPI label="Total Cost"    value={fmt(totalCost)}   accent="#f97316" icon="💸" />
        <KPI label="Net Profit"    value={fmt(totalProfit)} accent={totalProfit >= 0 ? '#22c55e' : '#ef4444'} icon="💰" />
        <KPI label="Active Crops"  value={active}           accent="#a855f7" icon="🌱" />
      </div>

      {/* Two-col becomes single on mobile */}
      <div className="fl-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card title="Crop Performance">
          {analytics.length === 0 && <EmptyInline text="No crops yet" />}
          {analytics.map(a => (
            <div key={getId(a.crop)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
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
          {data.plots.length === 0 && <EmptyInline text="No plots yet" />}
          {data.plots.map(plot => {
            const plotCrops = data.crops.filter(c => (c.plotId?._id || c.plotId) === getId(plot));
            return (
              <div key={getId(plot)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0f172a', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{plot.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{plotCrops.length} crop(s)</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {plotCrops.map(c => <Badge key={getId(c)} label={c.name} color={stageColor(c.stage)} />)}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card title="Cost Breakdown by Crop">
        {analytics.filter(a => a.totalCost > 0).length === 0 && <EmptyInline text="No expense data yet" />}
        {analytics.filter(a => a.totalCost > 0).map(a => (
          <div key={getId(a.crop)} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{a.crop.name}</span>
              <span style={{ color: '#64748b', fontSize: 11 }}>Labour {a.labourPct}% · Inputs {a.inputsPct}% · Irrig. {a.irrigPct}%</span>
            </div>
            <div style={S.barTrack}>
              <div style={{ ...S.barSeg, width: `${a.labourPct}%`, background: '#fb923c' }} />
              <div style={{ ...S.barSeg, width: `${a.inputsPct}%`, background: '#34d399' }} />
              <div style={{ ...S.barSeg, width: `${a.irrigPct}%`,  background: '#60a5fa' }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {[['#fb923c','Labour'],['#34d399','Inputs'],['#60a5fa','Irrigation']].map(([col, lab]) => (
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.crops.length === 0 && <Empty message="No crops yet. Tap '+ Add Crop' to get started." />}
      {data.crops.map(crop => {
        const plot     = data.plots.find(p => getId(p) === (crop.plotId?._id || crop.plotId));
        const a        = analytics.find(a => getId(a.crop) === getId(crop));
        const stageIdx = STAGES.indexOf(crop.stage);
        return (
          <div key={getId(crop)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 16, padding: 16 }}>
            {/* Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#f0fdf4' }}>{crop.name}</span>
                  <Badge label={crop.stage} color={stageColor(crop.stage)} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  {plot?.name} · {crop.season}{crop.sowDate ? ` · Sown: ${crop.sowDate}` : ''}
                </div>
              </div>
              {/* Stage buttons — hidden on mobile */}
              <div className="fl-stage-btns" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                {STAGES.map((s, i) => (
                  <button key={s}
                    style={{ fontSize: 10, padding: '4px 9px', borderRadius: 999, cursor: 'pointer', fontWeight: 600, border: `1px solid ${i === stageIdx ? stageColor(s) : '#334155'}`, background: i === stageIdx ? stageColor(s) : 'transparent', color: i === stageIdx ? '#fff' : '#64748b' }}
                    onClick={() => onStageChange(getId(crop), s)}>{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile stage selector */}
            <div style={{ marginTop: 10 }} className="fl-stage-mobile-only">
              <select
                value={crop.stage}
                onChange={e => onStageChange(getId(crop), e.target.value)}
                style={{ ...S.inp, fontSize: 13, padding: '8px 10px' }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Progress bar */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 10px', padding: '0 4px' }}>
              <div style={{ position: 'absolute', left: 4, right: 4, height: 3, background: '#1e293b', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 4, height: 3, borderRadius: 2, background: stageColor(crop.stage), width: `${(stageIdx / (STAGES.length - 1)) * 100}%`, transition: 'width 0.4s' }} />
              {STAGES.map((s, i) => (
                <div key={s} style={{ width: 12, height: 12, borderRadius: '50%', zIndex: 2, background: i <= stageIdx ? stageColor(crop.stage) : '#1e293b', border: `2px solid ${i <= stageIdx ? stageColor(crop.stage) : '#334155'}` }} />
              ))}
            </div>

            {/* Stats */}
            <div className="fl-crop-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
              {[['Cost', fmt(a?.totalCost||0),'#fb923c'],['Revenue',fmt(a?.totalRev||0),'#22c55e'],['Profit',fmt(a?.profit||0),(a?.profit||0)>=0?'#22c55e':'#ef4444'],['Yield',`${a?.yldTotal||0} qtl`,'#60a5fa']].map(([label, val, col]) => (
                <div key={label} style={{ background: '#0f172a', borderRadius: 9, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontWeight: 800, color: col, fontSize: 12, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Delete */}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button style={S.delBtn} onClick={() => onDelete(getId(crop))}>Delete</button>
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
  const deskCols = '90px 1fr 90px 1fr 100px 44px';

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '6px 13px', borderRadius: 999, border: `1px solid ${filter===c?'#166534':'#1e293b'}`, background: filter===c?'#14532d':'transparent', color: filter===c?'#4ade80':'#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <Empty message="No expenses recorded yet." /> : (<>

        {/* Desktop table */}
        <div className="fl-tbl-desk" style={{ ...S.table, display: 'none' }}>
          <div style={{ ...S.tHead, gridTemplateColumns: deskCols }}><span>Date</span><span>Crop</span><span>Category</span><span>Note</span><span style={{textAlign:'right'}}>Amount</span><span /></div>
          {filtered.map(e => {
            const crop = data.crops.find(c => getId(c) === (e.cropId?._id || e.cropId));
            return (
              <div key={getId(e)} style={{ ...S.tRow, gridTemplateColumns: deskCols }}>
                <span style={{ color: '#64748b' }}>{e.date}</span>
                <span style={{ fontWeight: 600 }}>{crop?.name || '—'}</span>
                <span><Badge label={e.category} color={catColor(e.category)} /></span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{e.note}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#fb923c' }}>{fmt(e.amount)}</span>
                <span><button style={S.delBtn} onClick={() => onDelete(getId(e))}>✕</button></span>
              </div>
            );
          })}
          <TotalRow cols={deskCols} total={filtered.reduce((s,e)=>s+e.amount,0)} color="#f97316" />
        </div>

        {/* Mobile cards */}
        <div className="fl-tbl-mob" style={{ flexDirection: 'column', gap: 8, display: 'none' }}>
          {filtered.map(e => {
            const crop = data.crops.find(c => getId(c) === (e.cropId?._id || e.cropId));
            return (
              <div key={getId(e)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{fmt(e.amount)}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{crop?.name || '—'} · {e.date}</div>
                    {e.note && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{e.note}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge label={e.category} color={catColor(e.category)} />
                    <button style={S.delBtn} onClick={() => onDelete(getId(e))}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'right', padding: '10px 4px', fontWeight: 800, color: '#f97316', fontSize: 15 }}>
            Total: {fmt(filtered.reduce((s,e)=>s+e.amount,0))}
          </div>
        </div>
      </>)}
    </div>
  );
}

// ── LABOUR ────────────────────────────────────────────────────────────────────
export function Labour({ data, onDelete }) {
  const total    = data.labourLogs.reduce((s, l) => s + l.workers * l.wagePerDay, 0);
  const deskCols = '90px 1fr 1fr 60px 90px 90px 44px';

  return (
    <div>
      <div className="fl-kpi-grid" style={S.kpiGrid}>
        <KPI label="Labour Cost"  value={fmt(total)} accent="#fb923c" icon="💰" />
        <KPI label="Work Entries" value={data.labourLogs.length} accent="#a855f7" icon="📋" />
        <KPI label="Worker-Days"  value={data.labourLogs.reduce((s,l)=>s+l.workers,0)} accent="#22c55e" icon="👷" />
      </div>

      {data.labourLogs.length === 0 ? <Empty message="No labour logs yet." /> : (<>

        {/* Desktop */}
        <div className="fl-tbl-desk" style={{ ...S.table, display: 'none' }}>
          <div style={{ ...S.tHead, gridTemplateColumns: deskCols }}><span>Date</span><span>Crop</span><span>Task</span><span style={{textAlign:'center'}}>Workers</span><span>Wage/Day</span><span style={{textAlign:'right'}}>Total</span><span /></div>
          {data.labourLogs.map(l => {
            const crop = data.crops.find(c => getId(c) === (l.cropId?._id || l.cropId));
            return (
              <div key={getId(l)} style={{ ...S.tRow, gridTemplateColumns: deskCols }}>
                <span style={{ color: '#64748b' }}>{l.date}</span>
                <span style={{ fontWeight: 600 }}>{crop?.name}</span>
                <span style={{ color: '#94a3b8' }}>{l.task}</span>
                <span style={{ textAlign: 'center' }}>{l.workers}</span>
                <span style={{ color: '#94a3b8' }}>{fmt(l.wagePerDay)}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#fb923c' }}>{fmt(l.workers*l.wagePerDay)}</span>
                <span><button style={S.delBtn} onClick={() => onDelete(getId(l))}>✕</button></span>
              </div>
            );
          })}
        </div>

        {/* Mobile */}
        <div className="fl-tbl-mob" style={{ flexDirection: 'column', gap: 8, display: 'none' }}>
          {data.labourLogs.map(l => {
            const crop = data.crops.find(c => getId(c) === (l.cropId?._id || l.cropId));
            return (
              <div key={getId(l)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fb923c', fontSize: 14 }}>{fmt(l.workers*l.wagePerDay)}</div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{l.task}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{crop?.name} · {l.date} · {l.workers} workers × {fmt(l.wagePerDay)}</div>
                  </div>
                  <button style={S.delBtn} onClick={() => onDelete(getId(l))}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </>)}
    </div>
  );
}

// ── MATERIALS ─────────────────────────────────────────────────────────────────
export function Materials({ data, onDelete }) {
  const deskCols = '1fr 90px 90px 100px 110px 44px';

  return (
    <div>
      {data.materials.length === 0 ? <Empty message="No materials in inventory yet." /> : (<>

        {/* Desktop */}
        <div className="fl-tbl-desk" style={{ ...S.table, display: 'none' }}>
          <div style={{ ...S.tHead, gridTemplateColumns: deskCols }}><span>Item</span><span>Category</span><span>Qty</span><span style={{textAlign:'right'}}>Cost/Unit</span><span style={{textAlign:'right'}}>Total</span><span /></div>
          {data.materials.map(m => (
            <div key={getId(m)} style={{ ...S.tRow, gridTemplateColumns: deskCols }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span><span style={{ ...S.badge, background: '#1e293b', color: '#94a3b8' }}>{m.category}</span></span>
              <span>{m.qty} {m.unit}</span>
              <span style={{ textAlign: 'right', color: '#94a3b8' }}>{fmt(m.costPerUnit)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{fmt(m.qty*m.costPerUnit)}</span>
              <span><button style={S.delBtn} onClick={() => onDelete(getId(m))}>✕</button></span>
            </div>
          ))}
          <TotalRow cols={deskCols} label="Inventory Total" total={data.materials.reduce((s,m)=>s+m.qty*m.costPerUnit,0)} color="#34d399" />
        </div>

        {/* Mobile */}
        <div className="fl-tbl-mob" style={{ flexDirection: 'column', gap: 8, display: 'none' }}>
          {data.materials.map(m => (
            <div key={getId(m)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.qty} {m.unit} · {fmt(m.costPerUnit)}/unit</div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: 13, marginTop: 3 }}>{fmt(m.qty*m.costPerUnit)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...S.badge, background: '#1e293b', color: '#94a3b8' }}>{m.category}</span>
                  <button style={S.delBtn} onClick={() => onDelete(getId(m))}>✕</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'right', padding: '10px 4px', fontWeight: 800, color: '#34d399', fontSize: 15 }}>
            Total: {fmt(data.materials.reduce((s,m)=>s+m.qty*m.costPerUnit,0))}
          </div>
        </div>
      </>)}
    </div>
  );
}

// ── MANURE ────────────────────────────────────────────────────────────────────
export function Manure({ data, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.manureLogs.length === 0 && <Empty message="No manure/biofertilizer logs yet." />}
      {data.manureLogs.map(m => {
        const plot = data.plots.find(p => getId(p) === (m.plotId?._id || m.plotId));
        return (
          <div key={getId(m)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>🍃 {m.type}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{plot?.name} · {m.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#14532d', borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#4ade80', fontSize: 16 }}>{m.quantity}</div>
                  <div style={{ fontSize: 10, color: '#166534' }}>{m.unit}</div>
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
  const deskCols = '90px 1fr 100px 110px 110px 44px';

  return (
    <div>
      <div className="fl-kpi-grid" style={S.kpiGrid}>
        <KPI label="Total Revenue" value={fmt(data.yields.reduce((s,y)=>s+y.quantity*y.salePrice,0))} accent="#22c55e" icon="🌾" />
        <KPI label="Entries" value={data.yields.length} accent="#3b82f6" icon="📋" />
      </div>

      {data.yields.length === 0 ? <Empty message="No yields recorded yet." /> : (<>

        {/* Desktop */}
        <div className="fl-tbl-desk" style={{ ...S.table, display: 'none' }}>
          <div style={{ ...S.tHead, gridTemplateColumns: deskCols }}><span>Date</span><span>Crop</span><span>Quantity</span><span>Sale Price</span><span style={{textAlign:'right'}}>Revenue</span><span /></div>
          {data.yields.map(y => {
            const crop = data.crops.find(c => getId(c) === (y.cropId?._id || y.cropId));
            return (
              <div key={getId(y)} style={{ ...S.tRow, gridTemplateColumns: deskCols }}>
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

        {/* Mobile */}
        <div className="fl-tbl-mob" style={{ flexDirection: 'column', gap: 8, display: 'none' }}>
          {data.yields.map(y => {
            const crop = data.crops.find(c => getId(c) === (y.cropId?._id || y.cropId));
            return (
              <div key={getId(y)} style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>{fmt(y.quantity*y.salePrice)}</div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{crop?.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{y.quantity} {y.unit} · {fmt(y.salePrice)}/{y.unit} · {y.date}</div>
                  </div>
                  <button style={S.delBtn} onClick={() => onDelete(getId(y))}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </>)}
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export function Analytics({ analytics, data }) {
  const seasons = [...new Set(data.crops.map(c => c.season))];
  const maxProfit = Math.max(...analytics.map(a => Math.abs(a.profit)), 1);

  return (
    <div>
      <div className="fl-kpi-grid" style={S.kpiGrid}>
        {analytics.map(a => (
          <div key={getId(a.crop)} style={{ ...S.kpiCard, borderColor: (a.profit>=0?'#22c55e':'#ef4444')+'44' }}>
            <div style={S.kpiIcon}>🌿</div>
            <div style={S.kpiLabel}>{a.crop.name}</div>
            <div style={{ ...S.kpiVal, color: a.profit>=0?'#22c55e':'#ef4444' }}>{fmt(a.profit)}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{a.crop.season}</div>
          </div>
        ))}
      </div>

      <Card title="Season Comparison">
        {seasons.length === 0 && <EmptyInline text="No data yet" />}
        {seasons.map(season => {
          const sc  = analytics.filter(a => a.crop.season === season);
          const rev = sc.reduce((s,a)=>s+a.totalRev, 0);
          const cst = sc.reduce((s,a)=>s+a.totalCost,0);
          const pft = rev - cst;
          return (
            <div key={season} style={{ padding: 12, background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{season}</span>
                <span style={{ color: pft>=0?'#22c55e':'#ef4444', fontWeight: 700, fontSize: 13 }}>{fmt(pft)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                <span>Revenue: <strong style={{color:'#22c55e'}}>{fmt(rev)}</strong></span>
                <span>Cost: <strong style={{color:'#fb923c'}}>{fmt(cst)}</strong></span>
                <span>Crops: <strong style={{color:'#e2e8f0'}}>{sc.length}</strong></span>
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="Profit Ranking by Crop">
        {analytics.length === 0 && <EmptyInline text="No data yet" />}
        {[...analytics].sort((a,b)=>b.profit-a.profit).map((a,i) => (
          <div key={getId(a.crop)} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#e2e8f0', fontSize: 13 }}>#{i+1} {a.crop.name}
                <span style={{ color: '#64748b', fontSize: 11 }}> ({a.plot?.name})</span>
              </span>
              <span style={{ color: a.profit>=0?'#22c55e':'#ef4444', fontWeight: 700, fontSize: 12 }}>{fmt(a.profit)}</span>
            </div>
            <div style={S.barTrack}>
              <div style={{ ...S.barSeg, width:`${Math.abs(a.profit)/maxProfit*100}%`, background: a.profit>=0?'#22c55e':'#ef4444' }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function TotalRow({ cols, label = 'Total', total, color }) {
  const colCount = cols.split(' ').length;
  const empties  = Array(colCount - 2).fill(null);
  return (
    <div style={{ ...S.tRow, gridTemplateColumns: cols, borderTop: '2px solid #1e293b' }}>
      {empties.map((_, i) => <span key={i} />)}
      <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 800, color, fontSize: 15 }}>{fmt(total)}</span>
      <span />
    </div>
  );
}

function Empty({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '44px 20px', color: '#475569', fontSize: 14, background: '#0a1628', borderRadius: 14, border: '1px dashed #1e293b' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>🌱</div>
      {message}
    </div>
  );
}

function EmptyInline({ text }) {
  return <div style={{ color: '#475569', fontSize: 13, padding: '12px 0' }}>{text}</div>;
}
