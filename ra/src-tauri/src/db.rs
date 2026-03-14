use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

/// Shared database handle. Clone-able — both Tauri state and the Hapi HTTP
/// server hold a reference to the same underlying connection through the Arc.
#[derive(Clone)]
pub struct Database(pub Arc<Mutex<Connection>>);

const SCHEMA: &str = "
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    address_line1 TEXT NOT NULL DEFAULT '',
    address_line2 TEXT NOT NULL DEFAULT '',
    city        TEXT NOT NULL DEFAULT '',
    state       TEXT NOT NULL DEFAULT '',
    zip_code    TEXT NOT NULL DEFAULT '',
    country     TEXT NOT NULL DEFAULT 'USA',
    linkedin_url TEXT,
    website     TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_variants (
    id          TEXT PRIMARY KEY,
    profile_id  TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_default  INTEGER NOT NULL DEFAULT 0,
    content     TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
    id          TEXT PRIMARY KEY,
    kind        TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL DEFAULT '',
    variables   TEXT NOT NULL DEFAULT '[]',
    use_count   INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS snippets (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',
    use_count   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id                  TEXT PRIMARY KEY,
    profile_id          TEXT NOT NULL,
    company             TEXT NOT NULL,
    title               TEXT NOT NULL,
    location            TEXT NOT NULL DEFAULT '',
    status              TEXT NOT NULL DEFAULT 'bookmarked',
    salary_min          INTEGER,
    salary_max          INTEGER,
    ats_platform        TEXT NOT NULL DEFAULT '',
    job_url             TEXT,
    resume_variant_id   TEXT,
    notes               TEXT NOT NULL DEFAULT '',
    applied_at          TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- PDF resume / cover-letter files stored on disk; metadata here.
CREATE TABLE IF NOT EXISTS resume_files (
    id          TEXT PRIMARY KEY,
    profile_id  TEXT NOT NULL,
    variant_id  TEXT,
    label       TEXT NOT NULL,
    kind        TEXT NOT NULL DEFAULT 'resume',
    filename    TEXT NOT NULL,
    file_path   TEXT NOT NULL,
    size_bytes  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Serket's Vault: one row holds the PBKDF2 salt and an encrypted check-blob
-- used to verify the master password without storing it.
CREATE TABLE IF NOT EXISTS vault_meta (
    id          INTEGER PRIMARY KEY CHECK (id = 1),
    salt        TEXT NOT NULL,
    check_nonce TEXT NOT NULL,
    check_blob  TEXT NOT NULL
);

-- Work experience entries for a profile (ordered by sort_order ASC = most recent first).
CREATE TABLE IF NOT EXISTS experience_entries (
    id          TEXT PRIMARY KEY,
    profile_id  TEXT NOT NULL,
    company     TEXT NOT NULL,
    title       TEXT NOT NULL,
    location    TEXT NOT NULL DEFAULT '',
    start_date  TEXT NOT NULL DEFAULT '',
    end_date    TEXT,
    is_current  INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- One encrypted credential per ATS account.
CREATE TABLE IF NOT EXISTS credentials (
    id              TEXT PRIMARY KEY,
    profile_id      TEXT NOT NULL,
    platform        TEXT NOT NULL,
    login_url       TEXT NOT NULL DEFAULT '',
    username        TEXT NOT NULL,
    enc_password    TEXT NOT NULL,
    nonce           TEXT NOT NULL,
    notes           TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
";

pub fn init(path: impl AsRef<std::path::Path>) -> Result<Database> {
    let conn = Connection::open(path)?;
    conn.execute_batch(SCHEMA)?;
    // Migrations: ALTER TABLE is idempotent via .ok() — silently ignored if column exists.
    conn.execute("ALTER TABLE profiles ADD COLUMN address_line1 TEXT NOT NULL DEFAULT ''", []).ok();
    conn.execute("ALTER TABLE profiles ADD COLUMN address_line2 TEXT NOT NULL DEFAULT ''", []).ok();
    Ok(Database(Arc::new(Mutex::new(conn))))
}
