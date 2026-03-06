// ═══════════════════════════════════════════════════════════════════════════════
// Ptah's Vault - Core Types for DizzyResume
// "Ptah crafts the data structures that store all user information"
// ═══════════════════════════════════════════════════════════════════════════════

// ============================================================================
// USER PROFILES
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: Location;
  linkedInUrl?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  street?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ============================================================================
// RESUME VARIANTS
// ============================================================================

export interface ResumeVariant {
  id: string;
  profileId: string;
  name: string; // e.g., "Data Analytics", "General", "HR Focus"
  summary: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceEntry {
  id: string;
  resumeVariantId: string;
  company: string;
  title: string;
  location: string;
  startDate: Date;
  endDate?: Date; // null for current position
  current: boolean;
  description: string[]; // Bullet points
  order: number; // For sorting
}

export interface EducationEntry {
  id: string;
  resumeVariantId: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  description?: string;
  order: number;
}

export interface Skill {
  id: string;
  resumeVariantId: string;
  category: SkillCategory;
  name: string;
  proficiency?: ProficiencyLevel;
}

export type SkillCategory = 'technical' | 'soft' | 'language' | 'tool' | 'certification';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================================================
// REFERENCES
// ============================================================================

export interface Reference {
  id: string;
  profileId: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  order: number;
}

// ============================================================================
// COVER LETTERS & TEMPLATES
// ============================================================================

export interface CoverLetterTemplate {
  id: string;
  profileId: string;
  name: string;
  content: string; // Template with merge fields like {company_name}, {role_title}
  variables: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string; // e.g., "company_name"
  label: string; // e.g., "Company Name"
  type: 'text' | 'textarea' | 'date';
  defaultValue?: string;
}

// ============================================================================
// SNIPPETS (Reusable text blocks)
// ============================================================================

export interface Snippet {
  id: string;
  profileId: string;
  title: string;
  content: string;
  tags: string[];
  category?: string; // e.g., "Leadership", "Conflict Resolution"
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DOCUMENTS (PDF/DOCX storage)
// ============================================================================

export interface Document {
  id: string;
  profileId: string;
  name: string;
  type: DocumentType;
  filePath: string; // Local file path
  fileSize: number;
  uploadedAt: Date;
  tags: string[];
}

export type DocumentType = 'resume' | 'cover-letter' | 'other';

// ============================================================================
// APPLICATION TRACKING (Seshat's domain)
// ============================================================================

export interface Application {
  id: string;
  profileId: string;
  resumeVariantId: string;
  companyId: string;
  jobTitle: string;
  location: string;
  url: string;
  atsPlatform: string;
  status: ApplicationStatus;
  appliedAt: Date;
  coverLetterId?: string;
  documentIds: string[]; // Resume, cover letter PDFs used
  salaryMin?: number;
  salaryMax?: number;
  notes: string;
  lastStatusChange: Date;
}

export type ApplicationStatus =
  | 'bookmarked'
  | 'applied'
  | 'phone-screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Company {
  id: string;
  name: string;
  domain?: string;
  careersUrl?: string;
  notes?: string;
}

// ============================================================================
// FIELD MAPPINGS (Maat's domain)
// ============================================================================

export interface FieldMapping {
  id: string;
  atsPlatform: string;
  urlPattern?: string; // e.g., "boards.greenhouse.io/*"
  selector: string; // CSS selector
  fieldType: FieldType;
  label?: string; // Human-readable label
  confidence: number; // 0-1
  createdAt: Date;
  lastSeen: Date;
}

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
// ATS PLATFORMS (Wadjet's domain)
// ============================================================================

export interface AtsPlatform {
  id: string;
  name: string; // e.g., "Greenhouse", "Workday"
  domainPatterns: string[]; // e.g., ["boards.greenhouse.io", "job-boards.greenhouse.io"]
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

// ============================================================================
// CREDENTIALS (Serket's Vault)
// ============================================================================

export interface StoredCredential {
  id: string;
  profileId: string;
  atsPlatform: string;
  username: string;
  encryptedPassword: string; // Encrypted at rest
  url: string;
  lastUsed: Date;
  notes?: string;
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

export interface ApplicationFilter {
  status?: ApplicationStatus[];
  atsPlatform?: string[];
  dateRange?: { from: Date; to: Date };
  searchQuery?: string;
}

export interface JobSearchQuery {
  keywords: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  datePosted?: 'day' | 'week' | 'month';
  atsPlatforms?: string[];
}
