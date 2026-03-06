// ═══════════════════════════════════════════════════════════════════════════════
// Ptah's Vault - Database Utilities
// "Ptah crafts the foundations upon which all data rests"
// ═══════════════════════════════════════════════════════════════════════════════

export * from './types.js';

// Database version for migrations
export const DATABASE_VERSION = 1;
export const DATABASE_FILENAME = 'dizzy-resume.db';

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Helper for date serialization
export function serializeDate(date: Date): string {
  return date.toISOString();
}

export function deserializeDate(isoString: string): Date {
  return new Date(isoString);
}

// JSON serialization helpers for arrays stored as TEXT
export function serializeArray<T>(arr: T[]): string {
  return JSON.stringify(arr);
}

export function deserializeArray<T>(jsonString: string): T[] {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}
