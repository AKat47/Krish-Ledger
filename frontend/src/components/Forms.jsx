import { useState } from 'react';
import { Field } from './UI';
import { S, STAGES, SEASONS, EXP_CATS, MAT_CATS, MANURE_TYPES, getId } from '../utils';

export function CropForm({ data, onSave, loading }) {
  const [v, setV] = useState({ name: '', location: '', season: SEASONS[0], stage: 'Sowing', sowDate: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.name && onSave(v); }}>
      <Field label="Crop Name">
        <input style={S.inp} required value={v.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tomato" />
      </Field>
      <Field label="Location (optional)">
        <input style={S.inp} value={v.location} onChange={e => set('location', e.target.value)} placeholder="e.g. North Field, Block A…" />
      </Field>
      <Field label="Season">
        <select style={S.inp} value={v.season} onChange={e => set('season', e.target.value)}>
          {SEASONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Starting Stage">
        <select style={S.inp} value={v.stage} onChange={e => set('stage', e.target.value)}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Sow Date">
        <input style={S.inp} type="date" value={v.sowDate} onChange={e => set('sowDate', e.target.value)} />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Crop'}
      </button>
    </form>
  );
}

export function ExpenseForm({ data, onSave, loading }) {
  const [v, setV] = useState({ cropId: getId(data.crops[0]) || '', category: EXP_CATS[0], amount: '', date: '', note: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.amount && onSave({ ...v, amount: Number(v.amount) }); }}>
      <Field label="Crop">
        <select style={S.inp} value={v.cropId} onChange={e => set('cropId', e.target.value)}>
          {data.crops.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Category">
        <select style={S.inp} value={v.category} onChange={e => set('category', e.target.value)}>
          {EXP_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Amount (₹)">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
      </Field>
      <Field label="Date">
        <input style={S.inp} required type="date" value={v.date} onChange={e => set('date', e.target.value)} />
      </Field>
      <Field label="Note">
        <input style={S.inp} value={v.note} onChange={e => set('note', e.target.value)} placeholder="Description" />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Expense'}
      </button>
    </form>
  );
}

export function LabourForm({ data, onSave, loading }) {
  const [v, setV] = useState({ cropId: getId(data.crops[0]) || '', date: '', workers: '', wagePerDay: '', hours: 8, task: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.workers && onSave({ ...v, workers: Number(v.workers), wagePerDay: Number(v.wagePerDay), hours: Number(v.hours) }); }}>
      <Field label="Crop">
        <select style={S.inp} value={v.cropId} onChange={e => set('cropId', e.target.value)}>
          {data.crops.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Date">
        <input style={S.inp} required type="date" value={v.date} onChange={e => set('date', e.target.value)} />
      </Field>
      <Field label="Task">
        <input style={S.inp} required value={v.task} onChange={e => set('task', e.target.value)} placeholder="e.g. Weeding" />
      </Field>
      <Field label="No. of Workers">
        <input style={S.inp} required type="number" inputMode="numeric" min="1" value={v.workers} onChange={e => set('workers', e.target.value)} />
      </Field>
      <Field label="Wage per Day (₹)">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.wagePerDay} onChange={e => set('wagePerDay', e.target.value)} />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Log Labour'}
      </button>
    </form>
  );
}

export function MaterialForm({ onSave, loading }) {
  const [v, setV] = useState({ name: '', category: MAT_CATS[0], qty: '', unit: 'Bags', costPerUnit: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.name && onSave({ ...v, qty: Number(v.qty), costPerUnit: Number(v.costPerUnit) }); }}>
      <Field label="Item Name">
        <input style={S.inp} required value={v.name} onChange={e => set('name', e.target.value)} placeholder="e.g. DAP Fertilizer" />
      </Field>
      <Field label="Category">
        <select style={S.inp} value={v.category} onChange={e => set('category', e.target.value)}>
          {MAT_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Quantity">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.qty} onChange={e => set('qty', e.target.value)} />
      </Field>
      <Field label="Unit">
        <input style={S.inp} required value={v.unit} onChange={e => set('unit', e.target.value)} placeholder="Bags / kg / Nos" />
      </Field>
      <Field label="Cost per Unit (₹)">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Add Material'}
      </button>
    </form>
  );
}

export function ManureForm({ onSave, loading }) {
  const [v, setV] = useState({ location: '', type: MANURE_TYPES[0], quantity: '', unit: 'kg', date: '', notes: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.quantity && onSave({ ...v, quantity: Number(v.quantity) }); }}>
      <Field label="Location (optional)">
        <input style={S.inp} value={v.location} onChange={e => set('location', e.target.value)} placeholder="e.g. North Field, Block A…" />
      </Field>
      <Field label="Type">
        <select style={S.inp} value={v.type} onChange={e => set('type', e.target.value)}>
          {MANURE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Quantity">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.quantity} onChange={e => set('quantity', e.target.value)} />
      </Field>
      <Field label="Unit">
        <input style={S.inp} required value={v.unit} onChange={e => set('unit', e.target.value)} placeholder="kg / Tonne / Litre" />
      </Field>
      <Field label="Date">
        <input style={S.inp} required type="date" value={v.date} onChange={e => set('date', e.target.value)} />
      </Field>
      <Field label="Notes">
        <input style={S.inp} value={v.notes} onChange={e => set('notes', e.target.value)} placeholder="Preparation method, source…" />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Log Manure'}
      </button>
    </form>
  );
}

export function YieldForm({ data, onSave, loading }) {
  const [v, setV] = useState({ cropId: getId(data.crops[0]) || '', quantity: '', unit: 'quintal', salePrice: '', date: '' });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  return (
    <form onSubmit={e => { e.preventDefault(); v.quantity && onSave({ ...v, quantity: Number(v.quantity), salePrice: Number(v.salePrice) }); }}>
      <Field label="Crop">
        <select style={S.inp} value={v.cropId} onChange={e => set('cropId', e.target.value)}>
          {data.crops.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Quantity">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.quantity} onChange={e => set('quantity', e.target.value)} />
      </Field>
      <Field label="Unit">
        <input style={S.inp} required value={v.unit} onChange={e => set('unit', e.target.value)} placeholder="quintal / kg / tonne" />
      </Field>
      <Field label="Sale Price (₹ per unit)">
        <input style={S.inp} required type="number" inputMode="numeric" min="0" value={v.salePrice} onChange={e => set('salePrice', e.target.value)} />
      </Field>
      <Field label="Date">
        <input style={S.inp} required type="date" value={v.date} onChange={e => set('date', e.target.value)} />
      </Field>
      <button style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Record Yield'}
      </button>
    </form>
  );
}
