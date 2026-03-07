// Types mirror Ra's API responses exactly.

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

export interface Snippet {
  id: string;
  title: string;
  content: string;
  tags: string[];
  use_count: number;
  created_at: string;
  updated_at: string;
}

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

export interface Application {
  id: string;
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
  age: string;
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

// Extension-internal types

export interface HorusState {
  profileId: string | null;
  variantId: string | null;
  raConnected: boolean;
}

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  label: string;
  category: FieldCategory;
  confidence: 'high' | 'medium' | 'low';
}

export type FieldCategory =
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'address_line1'
  | 'address_line2'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'linkedin'
  | 'website'
  | 'cover_letter'
  | 'resume_text'
  | 'unknown';
