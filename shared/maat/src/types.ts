// Ma'at's Scale - Field Types and Classification

export type FieldType =
  | 'fullName' | 'firstName' | 'lastName' | 'email' | 'phone'
  | 'address' | 'city' | 'state' | 'zipCode' | 'country'
  | 'linkedIn' | 'website' | 'company' | 'jobTitle'
  | 'startDate' | 'endDate' | 'current' | 'jobDescription'
  | 'school' | 'degree' | 'fieldOfStudy' | 'graduationDate' | 'gpa'
  | 'coverLetter' | 'resumeUpload' | 'salaryExpectations'
  | 'availability' | 'authorizedToWork' | 'visaSponsorship'
  | 'referralSource' | 'unknown';

export interface FieldPattern {
  fieldType: FieldType;
  selectors: string[];
  labelPatterns: RegExp[];
  namePatterns: RegExp[];
  ariaPatterns: RegExp[];
  placeholderPatterns: RegExp[];
}

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  confidence: number;
  label: string;
  metadata: {
    bySelector: boolean;
    byLabel: boolean;
    byName: boolean;
    byAria: boolean;
    byPlaceholder: boolean;
  };
}

export interface ClassificationResult {
  fieldType: FieldType;
  confidence: number;
  reason: string;
}
