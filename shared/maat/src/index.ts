// Ma'at's Scale - Field Mapping Engine

export * from './types.js';
export * from './patterns.js';

import type { DetectedField, FieldType } from './types.js';
import { FIELD_PATTERNS } from './patterns.js';

export function classifyField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): FieldType {
  const name = element.name?.toLowerCase() || '';
  const id = element.id?.toLowerCase() || '';
  const label = findLabel(element)?.textContent?.toLowerCase() || '';

  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    if (fieldType === 'unknown') continue;

    // Check selectors
    for (const selector of pattern.selectors) {
      try {
        if (element.matches(selector)) {
          return fieldType as FieldType;
        }
      } catch {}
    }

    // Check label patterns
    for (const patternRegex of pattern.labelPatterns) {
      if (patternRegex.test(label)) {
        return fieldType as FieldType;
      }
    }

    // Check name patterns
    for (const patternRegex of pattern.namePatterns) {
      if (patternRegex.test(name) || patternRegex.test(id)) {
        return fieldType as FieldType;
      }
    }
  }

  return 'unknown';
}

function findLabel(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): HTMLLabelElement | null {
  if (element.id) {
    const label = element.ownerDocument.querySelector(`label[for="${element.id}"]`);
    if (label) return label as HTMLLabelElement;
  }

  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') return parent as HTMLLabelElement;
    if (parent.parentElement?.tagName === 'FORM') break;
    parent = parent.parentElement;
  }

  if (element.getAttribute('aria-label')) {
    const dummy = element.ownerDocument.createElement('label');
    dummy.textContent = element.getAttribute('aria-label') || '';
    return dummy;
  }

  return null;
}

export function scanForm(
  formOrDocument: HTMLFormElement | Document,
): DetectedField[] {
  const fields: DetectedField[] = [];

  const elements = Array.from(
    formOrDocument.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
    )
  );

  for (const element of elements) {
    if (element.disabled || ('readOnly' in element && element.readOnly)) continue;

    const fieldType = classifyField(element);

    fields.push({
      element,
      fieldType,
      confidence: fieldType === 'unknown' ? 0 : 0.8,
      label: findLabel(element)?.textContent?.trim() || element.name || element.id || '',
      metadata: {
        bySelector: true,
        byLabel: true,
        byName: true,
        byAria: true,
        byPlaceholder: true,
      },
    });
  }

  return fields;
}
