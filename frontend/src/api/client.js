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

const crud = (path) => ({
  list:   ()       => req('GET',    `/${path}`),
  create: (d)      => req('POST',   `/${path}`, d),
  update: (id, d)  => req('PUT',    `/${path}/${id}`, d),
  delete: (id)     => req('DELETE', `/${path}/${id}`),
});

export const api = {
  crops:    crud('crops'),
  expenses: crud('expenses'),
  income:   crud('income'),
  inputs:   crud('inputs'),
};
