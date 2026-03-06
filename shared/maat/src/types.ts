// ═══════════════════════════════════════════════════════════════════════════════
// Ma'at's Scale - Field Types and Classification
// "Ma'at weighs each field against the feather of truth"
// ═══════════════════════════════════════════════════════════════════════════════

import type { AtsPlatform } from '@dizzy-resume/wadjet';

// ============================================================================
// FIELD TYPES
// ============================================================================

export type FieldType =
  // Personal Info
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'address'
  | 'city'
  | 'state'
  | 'zipCode'
  | 'country'
  | 'linkedIn'
  | 'website'
  // Experience
  | 'company'
  | 'jobTitle'
  | 'startDate'
  | 'endDate'
  | 'current'
  | 'jobDescription'
  // Education
  | 'school'
  | 'degree'
  | 'fieldOfStudy'
  | 'graduationDate'
  | 'gpa'
  // Additional
  | 'coverLetter'
  | 'resumeUpload'
  | 'salaryExpectations'
  | 'availability'
  | 'authorizedToWork'
  | 'visaSponsorship'
  | 'referralSource'
  | 'unknown';

// ============================================================================
// FIELD DETECTION
// ============================================================================

export interface FieldPattern {
  fieldType: FieldType;
  // CSS selectors
  selectors: string[];
  // Label text patterns (regex)
  labelPatterns: RegExp[];
  // Input name/id patterns (regex)
  namePatterns: RegExp[];
  // Aria patterns
  ariaPatterns: RegExp[];
  // Placeholder patterns
  placeholderPatterns: RegExp[];
}

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  confidence: number; // 0-1
  label: string;
  metadata: {
    bySelector: boolean;
    byLabel: boolean;
    byName: boolean;
    byAria: boolean;
    byPlaceholder: boolean;
  };
}

// ============================================================================
// FIELD MAPPING
// ============================================================================

export interface FieldMapping {
  id: string;
  atsPlatform: string;
  urlPattern?: string;
  selector: string;
  fieldType: FieldType;
  label?: string;
  confidence: number;
  createdAt: Date;
  lastSeen: Date;
}

export interface MappingResult {
  field: DetectedField;
  userData: unknown; // The actual user data to fill
  success: boolean;
  error?: string;
}

// ============================================================================
// FORM CONTEXT
// ============================================================================

export interface FormContext {
  atsPlatform: AtsPlatform | null;
  url: string;
  fields: DetectedField[];
  multiStep: boolean;
  currentStep?: number;
  totalSteps?: number;
}

// ============================================================================
// SPECIAL HANDLERS
// ============================================================================

export type FieldHandler = (
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: unknown,
) => Promise<boolean> | boolean;

export interface HandlerRegistry {
  // React controlled input handler
  react: FieldHandler;
  // Shadow DOM handler
  shadowDom: FieldHandler;
  // File input handler
  fileInput: FieldHandler;
  // Rich text editor handler
  richText: FieldHandler;
  // Standard input handler
  standard: FieldHandler;
}

// ============================================================================
// CLASSIFICATION RESULT
// ============================================================================

export interface ClassificationResult {
  fieldType: FieldType;
  confidence: number;
  reason: string;
}
