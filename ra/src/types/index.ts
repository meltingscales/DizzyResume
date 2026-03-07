// Navigation items
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  count?: number;
  badge?: string;
}

// View types
export type ViewId =
  | 'profiles'
  | 'resumes'
  | 'templates'
  | 'snippets'
  | 'tracker'
  | 'discovery'
  | 'settings';

// Profile types (from Ptah)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  linkedInUrl?: string;
  website?: string;
  resumeVariants: number;
  applications: number;
  lastActive?: Date;
}

// Application types (from Seshat)
export type ApplicationStatus =
  | 'bookmarked'
  | 'applied'
  | 'phone-screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  company: string;
  title: string;
  location: string;
  status: ApplicationStatus;
  salaryMin?: number;
  salaryMax?: number;
  atsPlatform: string;
  appliedAt: Date;
  age: 'fresh' | 'warning' | 'stale';
}
