// Ptah's Vault - Core Types for DizzyResume

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

export interface ResumeVariant {
  id: string;
  profileId: string;
  name: string;
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
  endDate?: Date;
  current: boolean;
  description: string[];
  order: number;
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

export interface CoverLetterTemplate {
  id: string;
  profileId: string;
  name: string;
  content: string;
  variables: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date';
  defaultValue?: string;
}

export interface Snippet {
  id: string;
  profileId: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  profileId: string;
  name: string;
  type: DocumentType;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  tags: string[];
}

export type DocumentType = 'resume' | 'cover-letter' | 'other';

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
  documentIds: string[];
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

export type FieldType =
  | 'fullName' | 'firstName' | 'lastName' | 'email' | 'phone'
  | 'address' | 'city' | 'state' | 'zipCode' | 'country'
  | 'linkedIn' | 'website' | 'company' | 'jobTitle'
  | 'startDate' | 'endDate' | 'current' | 'jobDescription'
  | 'school' | 'degree' | 'fieldOfStudy' | 'graduationDate' | 'gpa'
  | 'coverLetter' | 'resumeUpload' | 'salaryExpectations'
  | 'availability' | 'authorizedToWork' | 'visaSponsorship'
  | 'referralSource' | 'unknown';

export interface AtsPlatform {
  id: string;
  name: string;
  domainPatterns: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export interface StoredCredential {
  id: string;
  profileId: string;
  atsPlatform: string;
  username: string;
  encryptedPassword: string;
  url: string;
  lastUsed: Date;
  notes?: string;
}

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
