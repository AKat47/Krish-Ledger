// Central API client
// In dev: Vite proxies /api → localhost:5000
// In prod: uses VITE_API_URL env variable
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

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const put    = (path, body)  => request('PUT',    path, body);
const del    = (path)        => request('DELETE', path);

// ── API methods per collection ────────────────────────────────────────────────
export const api = {
  // Plots
  plots: {
    list:   ()       => get('/plots'),
    get:    (id)     => get(`/plots/${id}`),
    create: (data)   => post('/plots', data),
    update: (id, d)  => put(`/plots/${id}`, d),
    delete: (id)     => del(`/plots/${id}`),
  },
  // Crops
  crops: {
    list:   ()       => get('/crops'),
    get:    (id)     => get(`/crops/${id}`),
    create: (data)   => post('/crops', data),
    update: (id, d)  => put(`/crops/${id}`, d),
    delete: (id)     => del(`/crops/${id}`),
  },
  // Expenses
  expenses: {
    list:   ()       => get('/expenses'),
    create: (data)   => post('/expenses', data),
    update: (id, d)  => put(`/expenses/${id}`, d),
    delete: (id)     => del(`/expenses/${id}`),
  },
  // Labour
  labour: {
    list:   ()       => get('/labour'),
    create: (data)   => post('/labour', data),
    update: (id, d)  => put(`/labour/${id}`, d),
    delete: (id)     => del(`/labour/${id}`),
  },
  // Materials
  materials: {
    list:   ()       => get('/materials'),
    create: (data)   => post('/materials', data),
    update: (id, d)  => put(`/materials/${id}`, d),
    delete: (id)     => del(`/materials/${id}`),
  },
  // Manure
  manure: {
    list:   ()       => get('/manure'),
    create: (data)   => post('/manure', data),
    update: (id, d)  => put(`/manure/${id}`, d),
    delete: (id)     => del(`/manure/${id}`),
  },
  // Yields
  yields: {
    list:   ()       => get('/yields'),
    create: (data)   => post('/yields', data),
    update: (id, d)  => put(`/yields/${id}`, d),
    delete: (id)     => del(`/yields/${id}`),
  },
};
