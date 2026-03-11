// Navigation
export type ViewId =
  | 'profiles'
  | 'resumes'
  | 'templates'
  | 'snippets'
  | 'tracker'
  | 'discovery'
  | 'vault'
  | 'settings';

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  linkedin_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  linkedin_url: string | null;
  website: string | null;
}

export interface AtsCount {
  platform: string;
  count: number;
}

export interface ProfileStats {
  total_applications: number;
  this_week: number;
  today: number;
  response_rate: number;
  top_ats: AtsCount[];
  top_variant: string | null;
}

// ── Resume Variant ────────────────────────────────────────────────────────────

export interface ResumeVariant {
  id: string;
  profile_id: string;
  name: string;
  description: string;
  is_default: boolean;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResumeVariantInput {
  profile_id: string;
  name: string;
  description: string;
  content: string;
}

export interface UpdateResumeVariantInput {
  name: string;
  description: string;
  content: string;
}

// ── Template ──────────────────────────────────────────────────────────────────

export type TemplateKind = 'cover-letter' | 'references' | 'qa';

export interface Template {
  id: string;
  type: string;
  title: string;
  description: string;
  content: string;
  variables: string[];
  use_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  type: string;
  title: string;
  description: string;
  content: string;
  variables: string[];
}

export interface UpdateTemplateInput {
  title: string;
  description: string;
  content: string;
  variables: string[];
}

// ── Snippet ───────────────────────────────────────────────────────────────────

export interface Snippet {
  id: string;
  title: string;
  content: string;
  tags: string[];
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSnippetInput {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateSnippetInput {
  title: string;
  content: string;
  tags: string[];
}

// ── Application ───────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'bookmarked'
  | 'applied'
  | 'phone-screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type ApplicationAge = 'fresh' | 'warning' | 'stale';

export interface Application {
  id: string;
  profile_id: string;
  company: string;
  title: string;
  location: string;
  status: ApplicationStatus;
  salary_min: number | null;
  salary_max: number | null;
  ats_platform: string;
  job_url: string | null;
  resume_variant_id: string | null;
  notes: string;
  applied_at: string | null;
  age: ApplicationAge;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  profile_id: string;
  company: string;
  title: string;
  location: string;
  status: string;
  salary_min: number | null;
  salary_max: number | null;
  ats_platform: string;
  job_url: string | null;
  resume_variant_id: string | null;
  notes: string;
  applied_at: string | null;
}

// ── Credential (Serket's Vault) ───────────────────────────────────────────────

export interface Credential {
  id: string;
  profile_id: string;
  platform: string;
  login_url: string;
  username: string;
  password: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCredentialInput {
  profile_id: string;
  platform: string;
  login_url: string;
  username: string;
  password: string;
  notes: string;
}

export interface UpdateCredentialInput {
  platform: string;
  login_url: string;
  username: string;
  password: string;
  notes: string;
}
