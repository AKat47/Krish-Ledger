import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useFarmData() {
  const [data, setData] = useState({
    crops: [], expenses: [], labourLogs: [], materials: [], manureLogs: [], yields: [],
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [crops, expenses, labourLogs, materials, manureLogs, yields] = await Promise.all([
        api.crops.list(),
        api.expenses.list(),
        api.labour.list(),
        api.materials.list(),
        api.manure.list(),
        api.yields.list(),
      ]);
      setData({ crops, expenses, labourLogs, materials, manureLogs, yields });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const create = useCallback(async (collection, apiFn, payload) => {
    const doc = await apiFn(payload);
    setData(d => ({ ...d, [collection]: [doc, ...d[collection]] }));
    return doc;
  }, []);

  const update = useCallback(async (collection, apiFn, id, payload) => {
    const doc = await apiFn(id, payload);
    setData(d => ({ ...d, [collection]: d[collection].map(item => (item._id || item.id) === id ? doc : item) }));
    return doc;
  }, []);

  const remove = useCallback(async (collection, apiFn, id) => {
    await apiFn(id);
    setData(d => ({ ...d, [collection]: d[collection].filter(item => (item._id || item.id) !== id) }));
  }, []);

  const actions = {
    addCrop:      (d) => create('crops',      api.crops.create,     d),
    addExpense:   (d) => create('expenses',   api.expenses.create,  d),
    addLabour:    (d) => create('labourLogs', api.labour.create,    d),
    addMaterial:  (d) => create('materials',  api.materials.create, d),
    addManure:    (d) => create('manureLogs', api.manure.create,    d),
    addYield:     (d) => create('yields',     api.yields.create,    d),

    updateCrop: (id, d) => update('crops', api.crops.update, id, d),

    deleteCrop:     (id) => remove('crops',      api.crops.delete,     id),
    deleteExpense:  (id) => remove('expenses',   api.expenses.delete,  id),
    deleteLabour:   (id) => remove('labourLogs', api.labour.delete,    id),
    deleteMaterial: (id) => remove('materials',  api.materials.delete, id),
    deleteManure:   (id) => remove('manureLogs', api.manure.delete,    id),
    deleteYield:    (id) => remove('yields',     api.yields.delete,    id),
  };

  return { data, loading, error, actions, reload: loadAll };
}
