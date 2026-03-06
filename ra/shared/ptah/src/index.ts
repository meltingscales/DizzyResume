export * from './types.js';

export const DATABASE_VERSION = 1;
export const DATABASE_FILENAME = 'dizzy-resume.db';

export function generateId(): string {
  return crypto.randomUUID();
}

export function serializeDate(date: Date): string {
  return date.toISOString();
}

export function deserializeDate(isoString: string): Date {
  return new Date(isoString);
}

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
