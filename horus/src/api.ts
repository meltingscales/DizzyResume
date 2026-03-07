/// Typed fetch wrappers for Hapi's Flow (Ra's local API on port 9741).

import type {
  Profile,
  ResumeVariant,
  Snippet,
  Template,
  Application,
  CreateApplicationInput,
} from './types';

const BASE = 'http://127.0.0.1:9741';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const raApi = {
  health: () => get<{ status: string; version: string }>('/health'),

  profiles: {
    list: () => get<Profile[]>('/profiles'),
    get: (id: string) => get<Profile>(`/profiles/${id}`),
    variants: (profileId: string) =>
      get<ResumeVariant[]>(`/profiles/${profileId}/variants`),
  },

  snippets: {
    list: () => get<Snippet[]>('/snippets'),
  },

  templates: {
    list: () => get<Template[]>('/templates'),
  },

  applications: {
    create: (input: CreateApplicationInput) =>
      post<Application>('/applications', input),
    updateStatus: (id: string, status: string) =>
      patch<{ id: string; status: string }>(`/applications/${id}/status`, { status }),
  },
};
