import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

// Loads all farm data from backend on mount, exposes CRUD helpers
export function useFarmData() {
  const [data, setData] = useState({
    plots: [], crops: [], expenses: [],
    labourLogs: [], materials: [], manureLogs: [], yields: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load everything ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plots, crops, expenses, labourLogs, materials, manureLogs, yields] = await Promise.all([
        api.plots.list(),
        api.crops.list(),
        api.expenses.list(),
        api.labour.list(),
        api.materials.list(),
        api.manure.list(),
        api.yields.list(),
      ]);
      setData({ plots, crops, expenses, labourLogs, materials, manureLogs, yields });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Generic CRUD helpers ──
  const create = useCallback(async (collection, apiMethod, payload) => {
    const newDoc = await apiMethod(payload);
    setData(d => ({ ...d, [collection]: [newDoc, ...d[collection]] }));
    return newDoc;
  }, []);

  const update = useCallback(async (collection, apiMethod, id, payload) => {
    const updated = await apiMethod(id, payload);
    setData(d => ({
      ...d,
      [collection]: d[collection].map(item =>
        (item._id || item.id) === id ? updated : item
      )
    }));
    return updated;
  }, []);

  const remove = useCallback(async (collection, apiMethod, id) => {
    await apiMethod(id);
    setData(d => ({
      ...d,
      [collection]: d[collection].filter(item => (item._id || item.id) !== id)
    }));
  }, []);

  // ── Specific actions ──
  const actions = {
    addPlot:     (d) => create('plots',      api.plots.create,      d),
    addCrop:     (d) => create('crops',      api.crops.create,      d),
    addExpense:  (d) => create('expenses',   api.expenses.create,   d),
    addLabour:   (d) => create('labourLogs', api.labour.create,     d),
    addMaterial: (d) => create('materials',  api.materials.create,  d),
    addManure:   (d) => create('manureLogs', api.manure.create,     d),
    addYield:    (d) => create('yields',     api.yields.create,     d),

    updateCrop: (id, d) => update('crops', api.crops.update, id, d),

    deleteCrop:    (id) => remove('crops',      api.crops.delete,     id),
    deleteExpense: (id) => remove('expenses',   api.expenses.delete,  id),
    deleteLabour:  (id) => remove('labourLogs', api.labour.delete,    id),
    deleteMaterial:(id) => remove('materials',  api.materials.delete, id),
    deleteManure:  (id) => remove('manureLogs', api.manure.delete,    id),
    deleteYield:   (id) => remove('yields',     api.yields.delete,    id),
  };

  return { data, loading, error, actions, reload: loadAll };
}
