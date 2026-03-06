// ═══════════════════════════════════════════════════════════════════════════════
// Ma'at's Scale - Field Mapping Engine
// "Ma'at weighs each field against the feather of truth"
// ═══════════════════════════════════════════════════════════════════════════════

export * from './types.js';
export * from './patterns.js';

import type { DetectedField, FieldType, ClassificationResult } from './types.js';
import { FIELD_PATTERNS } from './patterns.js';

/**
 * Classify a form field by examining its attributes and context
 */
export function classifyField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): ClassificationResult {
  const scores: Record<FieldType, number> = {} as Record<FieldType, number>;
  const reasons: Record<FieldType, string[]> = {} as Record<FieldType, string[]>;

  // Get field attributes
  const name = element.name?.toLowerCase() || '';
  const id = element.id?.toLowerCase() || '';
  const placeholder = element.placeholder?.toLowerCase() || '';
  const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
  const ariaDescription = element.getAttribute('aria-describedby')?.toLowerCase() || '';
  const type = element.type?.toLowerCase() || 'text';

  // Find label element
  const label = findLabel(element);
  const labelText = label?.textContent?.toLowerCase() || '';

  // Score each field type
  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    if (fieldType === 'unknown') continue;

    let score = 0;
    const typeReasons: string[] = [];

    // Check CSS selectors (highest weight)
    if (pattern.selectors.length > 0) {
      try {
        for (const selector of pattern.selectors) {
          if (element.matches(selector)) {
            score += 100;
            typeReasons.push('matches selector');
            break;
          }
        }
      } catch {
        // Invalid selector, skip
      }
    }

    // Check label patterns
    for (const patternRegex of pattern.labelPatterns) {
      if (patternRegex.test(labelText)) {
        score += 50;
        typeReasons.push('label match');
        break;
      }
    }

    // Check name patterns
    for (const patternRegex of pattern.namePatterns) {
      if (patternRegex.test(name) || patternRegex.test(id)) {
        score += 30;
        typeReasons.push('name/id match');
        break;
      }
    }

    // Check aria patterns
    for (const patternRegex of pattern.ariaPatterns) {
      if (
        patternRegex.test(ariaLabel) ||
        patternRegex.test(ariaDescription) ||
        element.getAttribute('data-testid')?.toLowerCase().match(patternRegex)
      ) {
        score += 25;
        typeReasons.push('aria match');
        break;
      }
    }

    // Check placeholder patterns
    for (const patternRegex of pattern.placeholderPatterns) {
      if (patternRegex.test(placeholder)) {
        score += 20;
        typeReasons.push('placeholder match');
        break;
      }
    }

    if (score > 0) {
      scores[fieldType as FieldType] = score;
      reasons[fieldType as FieldType] = typeReasons;
    }
  }

  // Find the highest scoring field type
  let bestType: FieldType = 'unknown';
  let bestScore = 0;
  let bestReason = 'no match found';

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as FieldType;
      bestReason = reasons[type as FieldType]?.join(', ') || 'match';
    }
  }

  // Calculate confidence (normalize score)
  const confidence = Math.min(bestScore / 150, 1);

  return {
    fieldType: bestType,
    confidence,
    reason: bestReason,
  };
}

/**
 * Find the label element associated with a form field
 */
function findLabel(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): HTMLLabelElement | null {
  // Check if there's a label with matching 'for' attribute
  if (element.id) {
    const label = element.ownerDocument.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label as HTMLLabelElement;
    }
  }

  // Check if the element is wrapped in a label
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') {
      return parent as HTMLLabelElement;
    }
    // Don't go too far up
    if (parent.parentElement?.tagName === 'FORM' || parent.tagName === 'FORM') {
      break;
    }
    parent = parent.parentElement;
  }

  // Check aria-label
  if (element.getAttribute('aria-label')) {
    const dummyLabel = element.ownerDocument.createElement('label');
    dummyLabel.textContent = element.getAttribute('aria-label') || '';
    return dummyLabel;
  }

  return null;
}

/**
 * Scan a form and classify all fields
 */
export function scanForm(
  formOrDocument: HTMLFormElement | Document,
): DetectedField[] {
  const fields: DetectedField[] = [];

  // Get all input, textarea, and select elements
  const elements = formOrDocument.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');

  for (const element of elements) {
    // Skip disabled or readonly fields
    if (element.disabled || element.readOnly) {
      continue;
    }

    const classification = classifyField(element);

    fields.push({
      element,
      fieldType: classification.fieldType,
      confidence: classification.confidence,
      label: findLabel(element)?.textContent?.trim() || element.name || element.id || '',
      metadata: {
        bySelector: classification.reason.includes('selector'),
        byLabel: classification.reason.includes('label'),
        byName: classification.reason.includes('name'),
        byAria: classification.reason.includes('aria'),
        byPlaceholder: classification.reason.includes('placeholder'),
      },
    });
  }

  return fields;
}

/**
 * Group detected fields by type
 */
export function groupFieldsByType(fields: DetectedField[]): Record<FieldType, DetectedField[]> {
  const grouped: Record<FieldType, DetectedField[]> = {} as Record<FieldType, DetectedField[]>;

  for (const field of fields) {
    if (!grouped[field.fieldType]) {
      grouped[field.fieldType] = [];
    }
    grouped[field.fieldType].push(field);
  }

  return grouped;
}

/**
 * Filter fields by minimum confidence threshold
 */
export function filterByConfidence(fields: DetectedField[], minConfidence: number): DetectedField[] {
  return fields.filter((f) => f.confidence >= minConfidence);
}
