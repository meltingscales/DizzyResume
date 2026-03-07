const BASE = "http://127.0.0.1:9741";
async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
const raApi = {
  health: () => get("/health"),
  profiles: {
    list: () => get("/profiles"),
    get: (id) => get(`/profiles/${id}`),
    variants: (profileId) => get(`/profiles/${profileId}/variants`)
  },
  snippets: {
    list: () => get("/snippets")
  },
  templates: {
    list: () => get("/templates")
  },
  applications: {
    create: (input) => post("/applications", input),
    updateStatus: (id, status) => patch(`/applications/${id}/status`, { status })
  }
};
export {
  raApi as r
};
//# sourceMappingURL=api-DnzFSuXz.js.map
