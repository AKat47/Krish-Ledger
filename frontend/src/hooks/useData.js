import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

function makeCrud(set, key) {
  return {
    add:    async (data) => {
      const doc = await api[key].create(data);
      set(prev => [doc, ...prev]);
      return doc;
    },
    update: async (id, data) => {
      const doc = await api[key].update(id, data);
      set(prev => prev.map(x => (x._id || x.id) === id ? doc : x));
      return doc;
    },
    remove: async (id) => {
      await api[key].delete(id);
      set(prev => prev.filter(x => (x._id || x.id) !== id));
    },
  };
}

export function useData() {
  const [crops,    setCrops]    = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income,   setIncome]   = useState([]);
  const [inputs,   setInputs]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [c, e, inc, inp] = await Promise.all([
        api.crops.list(),
        api.expenses.list(),
        api.income.list(),
        api.inputs.list(),
      ]);
      setCrops(c); setExpenses(e); setIncome(inc); setInputs(inp);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const expenseCrud = makeCrud(setExpenses, 'expenses');
  const incomeCrud  = makeCrud(setIncome,   'income');
  const inputCrud   = makeCrud(setInputs,   'inputs');
  const cropCrud    = makeCrud(setCrops,    'crops');

  return {
    crops, expenses, income, inputs, loading, error, reload: load,
    // expenses
    addExpense:    expenseCrud.add,
    updateExpense: expenseCrud.update,
    deleteExpense: expenseCrud.remove,
    // income
    addIncome:    incomeCrud.add,
    updateIncome: incomeCrud.update,
    deleteIncome: incomeCrud.remove,
    // inputs
    addInput:    inputCrud.add,
    updateInput: inputCrud.update,
    deleteInput: inputCrud.remove,
    // crops
    addCrop:    cropCrud.add,
    updateCrop: cropCrud.update,
    deleteCrop: cropCrud.remove,
  };
}
