const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  expenses:  {
    list:   ()       => req('GET',    '/expenses'),
    create: (d)      => req('POST',   '/expenses', d),
    delete: (id)     => req('DELETE', `/expenses/${id}`),
  },
  crops: {
    list:   ()       => req('GET',    '/crops'),
    create: (d)      => req('POST',   '/crops', d),
    update: (id, d)  => req('PUT',    `/crops/${id}`, d),
    delete: (id)     => req('DELETE', `/crops/${id}`),
  },
};
