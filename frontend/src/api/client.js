const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

const get  = (path)       => request('GET',    path);
const post = (path, body) => request('POST',   path, body);
const put  = (path, body) => request('PUT',    path, body);
const del  = (path)       => request('DELETE', path);

export const api = {
  crops:     { list: () => get('/crops'),     create: (d) => post('/crops', d),     update: (id, d) => put(`/crops/${id}`, d),     delete: (id) => del(`/crops/${id}`)     },
  expenses:  { list: () => get('/expenses'),  create: (d) => post('/expenses', d),  update: (id, d) => put(`/expenses/${id}`, d),  delete: (id) => del(`/expenses/${id}`)  },
  labour:    { list: () => get('/labour'),    create: (d) => post('/labour', d),    update: (id, d) => put(`/labour/${id}`, d),    delete: (id) => del(`/labour/${id}`)    },
  materials: { list: () => get('/materials'), create: (d) => post('/materials', d), update: (id, d) => put(`/materials/${id}`, d), delete: (id) => del(`/materials/${id}`) },
  manure:    { list: () => get('/manure'),    create: (d) => post('/manure', d),    update: (id, d) => put(`/manure/${id}`, d),    delete: (id) => del(`/manure/${id}`)    },
  yields:    { list: () => get('/yields'),    create: (d) => post('/yields', d),    update: (id, d) => put(`/yields/${id}`, d),    delete: (id) => del(`/yields/${id}`)    },
};
