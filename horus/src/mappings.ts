/// User-defined field mappings — persisted in chrome.storage.local.
///
/// When Ma'at can't classify a field, the user can manually assign it a
/// category from the Bes panel. That mapping is saved here, keyed by
/// hostname + label text, and applied on every subsequent fill.

import type { FieldCategory } from './types';

export type MappingStore = Record<string, FieldCategory>;

const STORAGE_KEY = 'field_mappings';

/** Canonical key for a mapping: "hostname:lowercased-label". */
export function mappingKey(hostname: string, label: string): string {
  return `${hostname}:${label.trim().toLowerCase()}`;
}

/** Load all saved mappings from storage. Returns {} if none. */
export async function loadMappings(): Promise<MappingStore> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as MappingStore) ?? {};
}

/** Persist a single mapping. Merges with existing entries. */
export async function saveMapping(
  hostname: string,
  label: string,
  category: FieldCategory
): Promise<void> {
  const existing = await loadMappings();
  existing[mappingKey(hostname, label)] = category;
  await chrome.storage.local.set({ [STORAGE_KEY]: existing });
}

/** Remove a mapping (user changed their mind). */
export async function deleteMapping(hostname: string, label: string): Promise<void> {
  const existing = await loadMappings();
  delete existing[mappingKey(hostname, label)];
  await chrome.storage.local.set({ [STORAGE_KEY]: existing });
}
