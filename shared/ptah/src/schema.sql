-- ═══════════════════════════════════════════════════════════════════════════════
-- Ptah's Vault - SQLite Schema for DizzyResume
-- "Ptah crafts the foundations upon which all data rests"
-- ═══════════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================================================
-- USER PROFILES
-- ============================================================================

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

-- ============================================================================
-- RESUME VARIANTS
-- ============================================================================

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

-- ============================================================================
-- EXPERIENCE ENTRIES
-- ============================================================================

CREATE TABLE experience_entries (
  id TEXT PRIMARY KEY,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  current INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL, -- JSON array of bullet points
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_experience_variant ON experience_entries(resume_variant_id);

-- ============================================================================
-- EDUCATION ENTRIES
-- ============================================================================

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

CREATE INDEX idx_education_variant ON education_entries(resume_variant_id);

-- ============================================================================
-- SKILLS
-- ============================================================================

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'technical', 'soft', 'language', 'tool', 'certification'
  name TEXT NOT NULL,
  proficiency TEXT -- 'beginner', 'intermediate', 'advanced', 'expert'
);

CREATE INDEX idx_skills_variant ON skills(resume_variant_id);

-- ============================================================================
-- REFERENCES
-- ============================================================================

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

CREATE INDEX idx_references_profile ON references(profile_id);

-- ============================================================================
-- COVER LETTER TEMPLATES
-- ============================================================================

CREATE TABLE cover_letter_templates (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT NOT NULL, -- JSON array of template variables
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- SNIPPETS
-- ============================================================================

CREATE TABLE snippets (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_snippets_tags ON snippets(profile_id, category);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'resume', 'cover-letter', 'other'
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  tags TEXT NOT NULL -- JSON array
);

CREATE INDEX idx_documents_profile ON documents(profile_id);
CREATE INDEX idx_documents_type ON documents(type);

-- ============================================================================
-- COMPANIES
-- ============================================================================

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  careers_url TEXT,
  notes TEXT
);

-- ============================================================================
-- APPLICATIONS (Seshat's domain)
-- ============================================================================

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  resume_variant_id TEXT NOT NULL REFERENCES resume_variants(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  job_title TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  ats_platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'bookmarked', -- 'bookmarked', 'applied', 'phone-screen', 'interview', 'offer', 'rejected', 'withdrawn'
  applied_at TEXT,
  cover_letter_id TEXT REFERENCES cover_letter_templates(id),
  document_ids TEXT NOT NULL DEFAULT '[]', -- JSON array
  salary_min INTEGER,
  salary_max INTEGER,
  notes TEXT DEFAULT '',
  last_status_change TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_applications_profile ON applications(profile_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_ats ON applications(ats_platform);
CREATE INDEX idx_applications_date ON applications(applied_at);

-- ============================================================================
-- FIELD MAPPINGS (Maat's domain)
-- ============================================================================

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

CREATE INDEX idx_mappings_ats ON field_mappings(ats_platform);
CREATE INDEX idx_mappings_type ON field_mappings(field_type);

-- ============================================================================
-- ATS PLATFORMS (Wadjet's domain)
-- ============================================================================

CREATE TABLE ats_platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain_patterns TEXT NOT NULL, -- JSON array
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  notes TEXT
);

-- Seed known ATS platforms
INSERT INTO ats_platforms (id, name, domain_patterns, difficulty, notes) VALUES
  ('greenhouse', 'Greenhouse', '["boards.greenhouse.io", "job-boards.greenhouse.io"]', 'medium', 'Two versions - old boards vs new job-boards'),
  ('workday', 'Workday', '["myworkdayjobs.com", "wd5.myworkday.com"]', 'hard', 'React-based, controlled inputs, most common enterprise ATS'),
  ('lever', 'Lever', '["jobs.lever.co"]', 'medium', 'Clean forms, reasonable DOM structure'),
  ('icims', 'iCIMS', '["icims.com"]', 'hard', 'Legacy interface, complex iframe usage'),
  ('taleo', 'Taleo', '["taleo.net"]', 'hard', 'Older technology, heavy iframe usage'),
  ('adp', 'ADP Workforce', '["workforcenow.adp.com"]', 'medium', 'Common for SMBs'),
  ('bamboohr', 'BambooHR', '["bamboohr.com"]', 'easy', 'Simple forms, good labeling'),
  ('ashby', 'Ashby', '["ashbyhq.com"]', 'easy', 'Modern, clean DOM'),
  ('smartrecruiters', 'SmartRecruiters', '["smartrecruiters.com"]', 'medium', 'Large enterprises'),
  ('paylocity', 'Paylocity', '["recruiting.paylocity.com"]', 'medium', 'Mid-market common'),
  ('jobvite', 'Jobvite', '["jobvite.com"]', 'medium', 'Moderate complexity'),
  ('jazzhr', 'JazzHR', '["applytojob.com"]', 'easy', 'Simple SMB-focused ATS');

-- ============================================================================
-- CREDENTIALS (Serket's Vault)
-- ============================================================================

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

CREATE INDEX idx_credentials_profile ON stored_credentials(profile_id);
CREATE INDEX idx_credentials_ats ON stored_credentials(ats_platform);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on profile changes
CREATE TRIGGER update_profile_timestamp
AFTER UPDATE ON user_profiles
BEGIN
  UPDATE user_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update updated_at timestamp on resume variant changes
CREATE TRIGGER update_resume_variant_timestamp
AFTER UPDATE ON resume_variants
BEGIN
  UPDATE resume_variants SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update updated_at timestamp on cover letter changes
CREATE TRIGGER update_cover_letter_timestamp
AFTER UPDATE ON cover_letter_templates
BEGIN
  UPDATE cover_letter_templates SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update last_status_change on application status change
CREATE TRIGGER update_application_status_timestamp
AFTER UPDATE ON applications
WHEN NEW.status != OLD.status
BEGIN
  UPDATE applications SET last_status_change = datetime('now') WHERE id = NEW.id;
END;

-- Update last_seen on field mapping access
CREATE TRIGGER update_mapping_last_seen
AFTER UPDATE ON field_mappings
BEGIN
  UPDATE field_mappings SET last_seen = datetime('now') WHERE id = NEW.id;
END;
