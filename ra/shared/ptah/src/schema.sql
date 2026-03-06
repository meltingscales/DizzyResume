-- Ptah's Vault - SQLite Schema for DizzyResume
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  linkedin_url TEXT,
  website TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE resume_variants (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_resume_default ON resume_variants(profile_id) WHERE is_default = 1;

CREATE TABLE experience_entries (
  id TEXT PRIMARY KEY,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  current INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE education_entries (
  id TEXT PRIMARY KEY,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  gpa TEXT,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  proficiency TEXT
);

CREATE TABLE references (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE cover_letter_templates (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE snippets (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  tags TEXT NOT NULL
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  careers_url TEXT,
  notes TEXT
);

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  job_title TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  ats_platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'bookmarked',
  applied_at TEXT,
  cover_letter_id TEXT REFERENCES cover_letter_templates(id),
  document_ids TEXT NOT NULL DEFAULT '[]',
  salary_min INTEGER,
  salary_max INTEGER,
  notes TEXT DEFAULT '',
  last_status_change TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE field_mappings (
  id TEXT PRIMARY KEY,
  ats_platform TEXT NOT NULL,
  url_pattern TEXT,
  selector TEXT NOT NULL,
  field_type TEXT NOT NULL,
  label TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE ats_platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain_patterns TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE stored_credentials (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ats_platform TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  url TEXT NOT NULL,
  last_used TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT
);
