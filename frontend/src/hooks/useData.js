import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useData() {
  const [crops,    setCrops]    = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [c, e] = await Promise.all([api.crops.list(), api.expenses.list()]);
      setCrops(c); setExpenses(e);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addExpense = async (data) => {
    const doc = await api.expenses.create(data);
    setExpenses(prev => [doc, ...prev]);
    return doc;
  };

  const deleteExpense = async (id) => {
    await api.expenses.delete(id);
    setExpenses(prev => prev.filter(e => (e._id || e.id) !== id));
  };

  const addCrop = async (data) => {
    const doc = await api.crops.create(data);
    setCrops(prev => [doc, ...prev]);
    return doc;
  };

  const updateCrop = async (id, data) => {
    const doc = await api.crops.update(id, data);
    setCrops(prev => prev.map(c => (c._id || c.id) === id ? doc : c));
    return doc;
  };

  const deleteCrop = async (id) => {
    await api.crops.delete(id);
    setCrops(prev => prev.filter(c => (c._id || c.id) !== id));
  };

  return { crops, expenses, loading, error, reload: load, addExpense, deleteExpense, addCrop, updateCrop, deleteCrop };
}
