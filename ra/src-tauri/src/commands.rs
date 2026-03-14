use chrono::Utc;
use tauri::{Manager, State};
use uuid::Uuid;

// ── PDF import ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn extract_pdf_text(path: String) -> Result<String, AppError> {
    pdf_extract::extract_text(&path)
        .map_err(|e| AppError::InvalidInput(format!("Could not read PDF: {e}")))
}

use crate::db::Database;
use crate::error::AppError;
use crate::models::*;
use crate::vault::{self, VaultState};

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

/// How old is this application? Computed from applied_at (or created_at as fallback).
fn compute_age(applied_at: &Option<String>, created_at: &str) -> String {
    let date_str = applied_at.as_deref().unwrap_or(created_at);
    let days = chrono::DateTime::parse_from_rfc3339(date_str)
        .map(|dt| (Utc::now() - dt.with_timezone(&Utc)).num_days())
        .unwrap_or(0);
    if days < 7 {
        "fresh".to_string()
    } else if days < 14 {
        "warning".to_string()
    } else {
        "stale".to_string()
    }
}

// ── Profiles ──────────────────────────────────────────────────────────────────

fn fetch_profile(conn: &rusqlite::Connection, id: &str) -> rusqlite::Result<Profile> {
    conn.query_row(
        "SELECT id, name, email, phone, address_line1, address_line2,
                city, state, zip_code, country,
                linkedin_url, website, created_at, updated_at
         FROM profiles WHERE id=?1",
        [id],
        |row| {
            Ok(Profile {
                id: row.get("id")?,
                name: row.get("name")?,
                email: row.get("email")?,
                phone: row.get("phone")?,
                address_line1: row.get("address_line1")?,
                address_line2: row.get("address_line2")?,
                city: row.get("city")?,
                state: row.get("state")?,
                zip_code: row.get("zip_code")?,
                country: row.get("country")?,
                linkedin_url: row.get("linkedin_url")?,
                website: row.get("website")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        },
    )
}

#[tauri::command]
pub fn get_profile(db: State<'_, Database>, id: String) -> Result<Profile, AppError> {
    let conn = db.0.lock().unwrap();
    fetch_profile(&conn, &id).map_err(AppError::from)
}

#[tauri::command]
pub fn get_profiles(db: State<'_, Database>) -> Result<Vec<Profile>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, name, email, phone, address_line1, address_line2,
                city, state, zip_code, country,
                linkedin_url, website, created_at, updated_at
         FROM profiles ORDER BY name ASC",
    )?;
    let profiles = stmt
        .query_map([], |row| {
            Ok(Profile {
                id: row.get("id")?,
                name: row.get("name")?,
                email: row.get("email")?,
                phone: row.get("phone")?,
                address_line1: row.get("address_line1")?,
                address_line2: row.get("address_line2")?,
                city: row.get("city")?,
                state: row.get("state")?,
                zip_code: row.get("zip_code")?,
                country: row.get("country")?,
                linkedin_url: row.get("linkedin_url")?,
                website: row.get("website")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(profiles)
}

#[tauri::command]
pub fn create_profile(
    db: State<'_, Database>,
    input: CreateProfileInput,
) -> Result<Profile, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    conn.execute(
        "INSERT INTO profiles
         (id, name, email, phone, address_line1, address_line2,
          city, state, zip_code, country,
          linkedin_url, website, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13)",
        rusqlite::params![
            id, input.name, input.email, input.phone,
            input.address_line1, input.address_line2,
            input.city, input.state, input.zip_code, input.country,
            input.linkedin_url, input.website, now,
        ],
    )?;
    Ok(Profile {
        id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        address_line1: input.address_line1,
        address_line2: input.address_line2,
        city: input.city,
        state: input.state,
        zip_code: input.zip_code,
        country: input.country,
        linkedin_url: input.linkedin_url,
        website: input.website,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_profile(
    db: State<'_, Database>,
    id: String,
    input: UpdateProfileInput,
) -> Result<Profile, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    let rows = conn.execute(
        "UPDATE profiles SET name=?1, email=?2, phone=?3,
         address_line1=?4, address_line2=?5,
         city=?6, state=?7, zip_code=?8, country=?9,
         linkedin_url=?10, website=?11, updated_at=?12
         WHERE id=?13",
        rusqlite::params![
            input.name, input.email, input.phone,
            input.address_line1, input.address_line2,
            input.city, input.state, input.zip_code, input.country,
            input.linkedin_url, input.website, now, id,
        ],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("profile {id}")));
    }
    fetch_profile(&conn, &id).map_err(AppError::from)
}

#[tauri::command]
pub fn delete_profile(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM profiles WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("profile {id}")));
    }
    Ok(())
}

#[tauri::command]
pub fn get_profile_stats(
    db: State<'_, Database>,
    profile_id: String,
) -> Result<ProfileStats, AppError> {
    let conn = db.0.lock().unwrap();

    let total: i64 = conn.query_row(
        "SELECT COUNT(*) FROM applications WHERE profile_id=?1 AND status != 'bookmarked'",
        [&profile_id],
        |row| row.get(0),
    )?;

    // Applications created in the last 7 days
    let week_ago = (Utc::now() - chrono::Duration::days(7)).to_rfc3339();
    let this_week: i64 = conn.query_row(
        "SELECT COUNT(*) FROM applications
         WHERE profile_id=?1 AND status != 'bookmarked' AND created_at >= ?2",
        rusqlite::params![profile_id, week_ago],
        |row| row.get(0),
    )?;

    // Applications created today (UTC midnight)
    let today_start = Utc::now().date_naive().and_hms_opt(0, 0, 0).unwrap();
    let today_start_str = today_start.format("%Y-%m-%dT%H:%M:%S%.fZ").to_string();
    let today: i64 = conn.query_row(
        "SELECT COUNT(*) FROM applications
         WHERE profile_id=?1 AND status != 'bookmarked' AND created_at >= ?2",
        rusqlite::params![profile_id, today_start_str],
        |row| row.get(0),
    )?;

    // Responded = phone-screen, interview, or offer
    let responded: i64 = conn.query_row(
        "SELECT COUNT(*) FROM applications
         WHERE profile_id=?1 AND status IN ('phone-screen', 'interview', 'offer')",
        [&profile_id],
        |row| row.get(0),
    )?;

    let response_rate = if total > 0 {
        (responded as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    // Top ATS platforms by usage (non-empty platform, non-bookmarked)
    let mut stmt = conn.prepare(
        "SELECT ats_platform, COUNT(*) as cnt FROM applications
         WHERE profile_id=?1 AND status != 'bookmarked' AND ats_platform != ''
         GROUP BY ats_platform ORDER BY cnt DESC LIMIT 5",
    )?;
    let top_ats: Vec<AtsCount> = stmt
        .query_map([&profile_id], |row| {
            Ok(AtsCount {
                platform: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    // Most-used resume variant name
    let top_variant: Option<String> = conn.query_row(
        "SELECT rv.name FROM applications a
         JOIN resume_variants rv ON a.resume_variant_id = rv.id
         WHERE a.profile_id=?1 AND a.resume_variant_id IS NOT NULL
         GROUP BY a.resume_variant_id ORDER BY COUNT(*) DESC LIMIT 1",
        [&profile_id],
        |row| row.get(0),
    ).ok();

    Ok(ProfileStats {
        total_applications: total,
        this_week,
        today,
        response_rate,
        top_ats,
        top_variant,
    })
}

// ── Resume Variants ───────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_resume_variants(
    db: State<'_, Database>,
    profile_id: String,
) -> Result<Vec<ResumeVariant>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, profile_id, name, description, is_default, content, created_at, updated_at
         FROM resume_variants WHERE profile_id=?1
         ORDER BY is_default DESC, name ASC",
    )?;
    let variants = stmt
        .query_map([&profile_id], |row| {
            let is_default: i64 = row.get("is_default")?;
            Ok(ResumeVariant {
                id: row.get("id")?,
                profile_id: row.get("profile_id")?,
                name: row.get("name")?,
                description: row.get("description")?,
                is_default: is_default != 0,
                content: row.get("content")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(variants)
}

#[tauri::command]
pub fn create_resume_variant(
    db: State<'_, Database>,
    input: CreateResumeVariantInput,
) -> Result<ResumeVariant, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();

    // If this is the first variant for the profile, make it the default
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM resume_variants WHERE profile_id=?1",
        [&input.profile_id],
        |row| row.get(0),
    )?;
    let is_default = count == 0;

    conn.execute(
        "INSERT INTO resume_variants
         (id, profile_id, name, description, is_default, content, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
        rusqlite::params![
            id, input.profile_id, input.name, input.description,
            is_default as i64, input.content, now,
        ],
    )?;
    Ok(ResumeVariant {
        id,
        profile_id: input.profile_id,
        name: input.name,
        description: input.description,
        is_default,
        content: input.content,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_resume_variant(
    db: State<'_, Database>,
    id: String,
    input: UpdateResumeVariantInput,
) -> Result<ResumeVariant, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    let rows = conn.execute(
        "UPDATE resume_variants SET name=?1, description=?2, content=?3, updated_at=?4
         WHERE id=?5",
        rusqlite::params![input.name, input.description, input.content, now, id],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("resume_variant {id}")));
    }
    let variant: ResumeVariant = conn.query_row(
        "SELECT id, profile_id, name, description, is_default, content, created_at, updated_at
         FROM resume_variants WHERE id=?1",
        [&id],
        |row| {
            let is_default: i64 = row.get("is_default")?;
            Ok(ResumeVariant {
                id: row.get("id")?,
                profile_id: row.get("profile_id")?,
                name: row.get("name")?,
                description: row.get("description")?,
                is_default: is_default != 0,
                content: row.get("content")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        },
    )?;
    Ok(variant)
}

#[tauri::command]
pub fn set_default_variant(
    db: State<'_, Database>,
    id: String,
    profile_id: String,
) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    conn.execute(
        "UPDATE resume_variants SET is_default=0, updated_at=?1 WHERE profile_id=?2",
        rusqlite::params![now, profile_id],
    )?;
    let rows = conn.execute(
        "UPDATE resume_variants SET is_default=1, updated_at=?1 WHERE id=?2",
        rusqlite::params![now, id],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("resume_variant {id}")));
    }
    Ok(())
}

#[tauri::command]
pub fn delete_resume_variant(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM resume_variants WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("resume_variant {id}")));
    }
    Ok(())
}

// ── Templates ─────────────────────────────────────────────────────────────────

fn row_to_template(row: &rusqlite::Row<'_>) -> rusqlite::Result<Template> {
    let vars_json: String = row.get("variables")?;
    let variables: Vec<String> =
        serde_json::from_str(&vars_json).unwrap_or_default();
    Ok(Template {
        id: row.get("id")?,
        kind: row.get("kind")?,
        title: row.get("title")?,
        description: row.get("description")?,
        content: row.get("content")?,
        variables,
        use_count: row.get("use_count")?,
        last_used_at: row.get("last_used_at")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

#[tauri::command]
pub fn get_templates(db: State<'_, Database>) -> Result<Vec<Template>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, kind, title, description, content, variables,
                use_count, last_used_at, created_at, updated_at
         FROM templates ORDER BY use_count DESC, title ASC",
    )?;
    let templates = stmt
        .query_map([], row_to_template)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(templates)
}

#[tauri::command]
pub fn create_template(
    db: State<'_, Database>,
    input: CreateTemplateInput,
) -> Result<Template, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    let vars_json = serde_json::to_string(&input.variables)?;
    conn.execute(
        "INSERT INTO templates
         (id, kind, title, description, content, variables, use_count, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, ?7, ?7)",
        rusqlite::params![
            id, input.kind, input.title, input.description,
            input.content, vars_json, now,
        ],
    )?;
    Ok(Template {
        id,
        kind: input.kind,
        title: input.title,
        description: input.description,
        content: input.content,
        variables: input.variables,
        use_count: 0,
        last_used_at: None,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_template(
    db: State<'_, Database>,
    id: String,
    input: UpdateTemplateInput,
) -> Result<Template, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    let vars_json = serde_json::to_string(&input.variables)?;
    let rows = conn.execute(
        "UPDATE templates SET title=?1, description=?2, content=?3,
         variables=?4, updated_at=?5 WHERE id=?6",
        rusqlite::params![
            input.title, input.description, input.content,
            vars_json, now, id,
        ],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("template {id}")));
    }
    conn.query_row(
        "SELECT id, kind, title, description, content, variables,
                use_count, last_used_at, created_at, updated_at
         FROM templates WHERE id=?1",
        [&id],
        row_to_template,
    )
    .map_err(AppError::from)
}

#[tauri::command]
pub fn record_template_use(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    conn.execute(
        "UPDATE templates SET use_count=use_count+1, last_used_at=?1, updated_at=?1
         WHERE id=?2",
        rusqlite::params![now, id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn delete_template(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM templates WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("template {id}")));
    }
    Ok(())
}

// ── Snippets ──────────────────────────────────────────────────────────────────

fn row_to_snippet(row: &rusqlite::Row<'_>) -> rusqlite::Result<Snippet> {
    let tags_json: String = row.get("tags")?;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
    Ok(Snippet {
        id: row.get("id")?,
        title: row.get("title")?,
        content: row.get("content")?,
        tags,
        use_count: row.get("use_count")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

#[tauri::command]
pub fn get_snippets(db: State<'_, Database>) -> Result<Vec<Snippet>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, title, content, tags, use_count, created_at, updated_at
         FROM snippets ORDER BY use_count DESC, title ASC",
    )?;
    let snippets = stmt
        .query_map([], row_to_snippet)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(snippets)
}

#[tauri::command]
pub fn create_snippet(
    db: State<'_, Database>,
    input: CreateSnippetInput,
) -> Result<Snippet, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    let tags_json = serde_json::to_string(&input.tags)?;
    conn.execute(
        "INSERT INTO snippets (id, title, content, tags, use_count, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 0, ?5, ?5)",
        rusqlite::params![id, input.title, input.content, tags_json, now],
    )?;
    Ok(Snippet {
        id,
        title: input.title,
        content: input.content,
        tags: input.tags,
        use_count: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_snippet(
    db: State<'_, Database>,
    id: String,
    input: UpdateSnippetInput,
) -> Result<Snippet, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    let tags_json = serde_json::to_string(&input.tags)?;
    let rows = conn.execute(
        "UPDATE snippets SET title=?1, content=?2, tags=?3, updated_at=?4 WHERE id=?5",
        rusqlite::params![input.title, input.content, tags_json, now, id],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("snippet {id}")));
    }
    conn.query_row(
        "SELECT id, title, content, tags, use_count, created_at, updated_at
         FROM snippets WHERE id=?1",
        [&id],
        row_to_snippet,
    )
    .map_err(AppError::from)
}

#[tauri::command]
pub fn record_snippet_use(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    conn.execute(
        "UPDATE snippets SET use_count=use_count+1, updated_at=?1 WHERE id=?2",
        rusqlite::params![now, id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn delete_snippet(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM snippets WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("snippet {id}")));
    }
    Ok(())
}

// ── Applications ──────────────────────────────────────────────────────────────

fn row_to_application(row: &rusqlite::Row<'_>) -> rusqlite::Result<Application> {
    let applied_at: Option<String> = row.get("applied_at")?;
    let created_at: String = row.get("created_at")?;
    let age = compute_age(&applied_at, &created_at);
    Ok(Application {
        id: row.get("id")?,
        profile_id: row.get("profile_id")?,
        company: row.get("company")?,
        title: row.get("title")?,
        location: row.get("location")?,
        status: row.get("status")?,
        salary_min: row.get("salary_min")?,
        salary_max: row.get("salary_max")?,
        ats_platform: row.get("ats_platform")?,
        job_url: row.get("job_url")?,
        resume_variant_id: row.get("resume_variant_id")?,
        notes: row.get("notes")?,
        applied_at,
        age,
        created_at,
        updated_at: row.get("updated_at")?,
    })
}

#[tauri::command]
pub fn get_applications(
    db: State<'_, Database>,
    profile_id: String,
) -> Result<Vec<Application>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, profile_id, company, title, location, status,
                salary_min, salary_max, ats_platform, job_url, resume_variant_id,
                notes, applied_at, created_at, updated_at
         FROM applications WHERE profile_id=?1
         ORDER BY created_at DESC",
    )?;
    let apps = stmt
        .query_map([&profile_id], row_to_application)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(apps)
}

#[tauri::command]
pub fn create_application(
    db: State<'_, Database>,
    input: CreateApplicationInput,
) -> Result<Application, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    conn.execute(
        "INSERT INTO applications
         (id, profile_id, company, title, location, status, salary_min, salary_max,
          ats_platform, job_url, resume_variant_id, notes, applied_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14)",
        rusqlite::params![
            id, input.profile_id, input.company, input.title,
            input.location, input.status, input.salary_min, input.salary_max,
            input.ats_platform, input.job_url, input.resume_variant_id,
            input.notes, input.applied_at, now,
        ],
    )?;
    let age = compute_age(&input.applied_at, &now);
    Ok(Application {
        id,
        profile_id: input.profile_id,
        company: input.company,
        title: input.title,
        location: input.location,
        status: input.status,
        salary_min: input.salary_min,
        salary_max: input.salary_max,
        ats_platform: input.ats_platform,
        job_url: input.job_url,
        resume_variant_id: input.resume_variant_id,
        notes: input.notes,
        applied_at: input.applied_at,
        age,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_application_status(
    db: State<'_, Database>,
    id: String,
    input: UpdateApplicationStatusInput,
) -> Result<Application, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();

    // If moving to "applied" and applied_at is not set, set it now
    let rows = if input.status == "applied" {
        conn.execute(
            "UPDATE applications SET status=?1, updated_at=?2,
             applied_at=COALESCE(applied_at, ?2) WHERE id=?3",
            rusqlite::params![input.status, now, id],
        )?
    } else {
        conn.execute(
            "UPDATE applications SET status=?1, updated_at=?2 WHERE id=?3",
            rusqlite::params![input.status, now, id],
        )?
    };

    if rows == 0 {
        return Err(AppError::NotFound(format!("application {id}")));
    }
    conn.query_row(
        "SELECT id, profile_id, company, title, location, status,
                salary_min, salary_max, ats_platform, job_url, resume_variant_id,
                notes, applied_at, created_at, updated_at
         FROM applications WHERE id=?1",
        [&id],
        row_to_application,
    )
    .map_err(AppError::from)
}

#[tauri::command]
pub fn delete_application(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM applications WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("application {id}")));
    }
    Ok(())
}

// ── Resume Files ──────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_resume_files(
    db: State<'_, Database>,
    profile_id: String,
) -> Result<Vec<ResumeFile>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, profile_id, variant_id, label, kind, filename, file_path, size_bytes, created_at
         FROM resume_files WHERE profile_id=?1 ORDER BY created_at DESC",
    )?;
    let rows = stmt
        .query_map([&profile_id], |row| {
            Ok(ResumeFile {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                variant_id: row.get(2)?,
                label: row.get(3)?,
                kind: row.get(4)?,
                filename: row.get(5)?,
                file_path: row.get(6)?,
                size_bytes: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
    Ok(rows)
}

#[tauri::command]
pub async fn import_resume_file(
    app: tauri::AppHandle,
    db: State<'_, Database>,
    input: ImportResumeFileInput,
) -> Result<ResumeFile, AppError> {
    use tauri_plugin_dialog::DialogExt;

    // Open native file picker (PDF only)
    let path = app
        .dialog()
        .file()
        .add_filter("PDF", &["pdf"])
        .blocking_pick_file()
        .ok_or_else(|| AppError::InvalidInput("No file selected".into()))?;

    let src_path = match path {
        tauri_plugin_dialog::FilePath::Path(p) => p,
        _ => return Err(AppError::InvalidInput("Unsupported path type".into())),
    };
    let filename: String = src_path
        .file_name()
        .and_then(|n: &std::ffi::OsStr| n.to_str())
        .unwrap_or("resume.pdf")
        .to_string();

    // Ensure files directory exists
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e: tauri::Error| AppError::InvalidInput(e.to_string()))?;
    let files_dir = app_dir.join("files");
    std::fs::create_dir_all(&files_dir)
        .map_err(|e| AppError::InvalidInput(format!("Cannot create files dir: {e}")))?;

    // Copy to app data dir with a unique name
    let id = Uuid::new_v4().to_string();
    let dest_path = files_dir.join(format!("{id}.pdf"));
    std::fs::copy(&src_path, &dest_path)
        .map_err(|e| AppError::InvalidInput(format!("Cannot copy file: {e}")))?;

    let size_bytes = std::fs::metadata(&dest_path)
        .map(|m| m.len() as i64)
        .unwrap_or(0);

    let now = Utc::now().to_rfc3339();
    let file_path = dest_path.to_string_lossy().to_string();

    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO resume_files (id, profile_id, variant_id, label, kind, filename, file_path, size_bytes, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        rusqlite::params![
            id, input.profile_id, input.variant_id, input.label,
            input.kind, filename, file_path, size_bytes, now,
        ],
    )?;

    Ok(ResumeFile {
        id,
        profile_id: input.profile_id,
        variant_id: input.variant_id,
        label: input.label,
        kind: input.kind,
        filename,
        file_path,
        size_bytes,
        created_at: now,
    })
}

#[tauri::command]
pub fn delete_resume_file(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let file_path: Option<String> = conn
        .query_row(
            "SELECT file_path FROM resume_files WHERE id=?1",
            [&id],
            |r| r.get(0),
        )
        .ok();

    let rows = conn.execute("DELETE FROM resume_files WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("resume file {id}")));
    }

    // Best-effort delete from disk — ignore error if already gone
    if let Some(path) = file_path {
        std::fs::remove_file(path).ok();
    }
    Ok(())
}

// ── Serket's Vault ────────────────────────────────────────────────────────────

/// Returns true if the vault has been set up (vault_meta row exists).
#[tauri::command]
pub fn vault_is_setup(db: State<'_, Database>) -> bool {
    let conn = db.0.lock().unwrap();
    conn.query_row("SELECT COUNT(*) FROM vault_meta", [], |r| r.get::<_, i64>(0))
        .unwrap_or(0)
        > 0
}

/// Returns true if the vault key is currently held in memory.
#[tauri::command]
pub fn vault_is_unlocked(vault: State<'_, VaultState>) -> bool {
    vault.is_unlocked()
}

/// First-time setup: derive a key from `master_password`, persist the salt and
/// a check-blob, and unlock the vault for this session.
#[tauri::command]
pub fn vault_setup(
    db: State<'_, Database>,
    vault: State<'_, VaultState>,
    master_password: String,
) -> Result<(), AppError> {
    let salt = vault::generate_salt();
    let key = vault::derive_key(&master_password, &salt);
    let (check_blob, check_nonce) =
        vault::make_check_blob(&key).map_err(AppError::InvalidInput)?;

    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO vault_meta (id, salt, check_nonce, check_blob) VALUES (1, ?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET salt=excluded.salt, check_nonce=excluded.check_nonce, check_blob=excluded.check_blob",
        rusqlite::params![hex::encode(salt), check_nonce, check_blob],
    )?;

    vault.set_key(key);
    Ok(())
}

/// Verify `master_password` against the stored check-blob and unlock this session.
/// Returns false (not an error) if the password is wrong.
#[tauri::command]
pub fn vault_unlock(
    db: State<'_, Database>,
    vault: State<'_, VaultState>,
    master_password: String,
) -> Result<bool, AppError> {
    let conn = db.0.lock().unwrap();
    let (salt_hex, check_nonce, check_blob): (String, String, String) = conn.query_row(
        "SELECT salt, check_nonce, check_blob FROM vault_meta WHERE id=1",
        [],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    )?;

    let salt = hex::decode(&salt_hex).map_err(|e| AppError::InvalidInput(e.to_string()))?;
    let key = vault::derive_key(&master_password, &salt);

    if vault::verify_check_blob(&key, &check_blob, &check_nonce) {
        vault.set_key(key);
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Clear the in-memory key (does not touch the DB).
#[tauri::command]
pub fn vault_lock(vault: State<'_, VaultState>) {
    vault.clear_key();
}

// ── Credentials CRUD ─────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_credentials(
    db: State<'_, Database>,
    vault: State<'_, VaultState>,
    profile_id: String,
) -> Result<Vec<Credential>, AppError> {
    if !vault.is_unlocked() {
        return Err(AppError::InvalidInput("Vault is locked".into()));
    }
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, profile_id, platform, login_url, username, enc_password, nonce, notes, created_at, updated_at
         FROM credentials WHERE profile_id=?1 ORDER BY platform ASC, created_at ASC",
    )?;

    let rows = stmt.query_map([&profile_id], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, String>(6)?,
            row.get::<_, String>(7)?,
            row.get::<_, String>(8)?,
            row.get::<_, String>(9)?,
        ))
    })?;

    let mut out = Vec::new();
    for row in rows {
        let (id, profile_id, platform, login_url, username, enc_pw, nonce, notes, created_at, updated_at) = row?;
        let password = vault
            .decrypt(&enc_pw, &nonce)
            .map_err(AppError::InvalidInput)?;
        out.push(Credential {
            id,
            profile_id,
            platform,
            login_url,
            username,
            password,
            notes,
            created_at,
            updated_at,
        });
    }
    Ok(out)
}

#[tauri::command]
pub fn create_credential(
    db: State<'_, Database>,
    vault: State<'_, VaultState>,
    input: CreateCredentialInput,
) -> Result<Credential, AppError> {
    if !vault.is_unlocked() {
        return Err(AppError::InvalidInput("Vault is locked".into()));
    }
    let (enc_password, nonce) = vault
        .encrypt(&input.password)
        .map_err(AppError::InvalidInput)?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO credentials (id, profile_id, platform, login_url, username, enc_password, nonce, notes, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
        rusqlite::params![
            id, input.profile_id, input.platform, input.login_url,
            input.username, enc_password, nonce, input.notes, now, now,
        ],
    )?;

    Ok(Credential {
        id,
        profile_id: input.profile_id,
        platform: input.platform,
        login_url: input.login_url,
        username: input.username,
        password: input.password,
        notes: input.notes,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_credential(
    db: State<'_, Database>,
    vault: State<'_, VaultState>,
    id: String,
    input: UpdateCredentialInput,
) -> Result<Credential, AppError> {
    if !vault.is_unlocked() {
        return Err(AppError::InvalidInput("Vault is locked".into()));
    }
    let (enc_password, nonce) = vault
        .encrypt(&input.password)
        .map_err(AppError::InvalidInput)?;

    let now = Utc::now().to_rfc3339();
    let conn = db.0.lock().unwrap();
    let rows = conn.execute(
        "UPDATE credentials SET platform=?1, login_url=?2, username=?3,
         enc_password=?4, nonce=?5, notes=?6, updated_at=?7 WHERE id=?8",
        rusqlite::params![
            input.platform, input.login_url, input.username,
            enc_password, nonce, input.notes, now, id,
        ],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("credential {id}")));
    }

    let profile_id: String = conn.query_row(
        "SELECT profile_id FROM credentials WHERE id=?1",
        [&id],
        |r| r.get(0),
    )?;
    let created_at: String = conn.query_row(
        "SELECT created_at FROM credentials WHERE id=?1",
        [&id],
        |r| r.get(0),
    )?;

    Ok(Credential {
        id,
        profile_id,
        platform: input.platform,
        login_url: input.login_url,
        username: input.username,
        password: input.password,
        notes: input.notes,
        created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_credential(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM credentials WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("credential {id}")));
    }
    Ok(())
}

// ── Experience Entries ────────────────────────────────────────────────────────

fn row_to_experience(row: &rusqlite::Row<'_>) -> rusqlite::Result<ExperienceEntry> {
    let is_current: i64 = row.get("is_current")?;
    Ok(ExperienceEntry {
        id: row.get("id")?,
        profile_id: row.get("profile_id")?,
        company: row.get("company")?,
        title: row.get("title")?,
        location: row.get("location")?,
        start_date: row.get("start_date")?,
        end_date: row.get("end_date")?,
        is_current: is_current != 0,
        description: row.get("description")?,
        sort_order: row.get("sort_order")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

#[tauri::command]
pub fn get_experience_entries(
    db: State<'_, Database>,
    profile_id: String,
) -> Result<Vec<ExperienceEntry>, AppError> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, profile_id, company, title, location, start_date, end_date,
                is_current, description, sort_order, created_at, updated_at
         FROM experience_entries WHERE profile_id=?1 ORDER BY sort_order ASC",
    )?;
    let entries = stmt
        .query_map([&profile_id], row_to_experience)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(entries)
}

#[tauri::command]
pub fn create_experience_entry(
    db: State<'_, Database>,
    input: CreateExperienceEntryInput,
) -> Result<ExperienceEntry, AppError> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    conn.execute(
        "INSERT INTO experience_entries
         (id, profile_id, company, title, location, start_date, end_date,
          is_current, description, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?11)",
        rusqlite::params![
            id, input.profile_id, input.company, input.title, input.location,
            input.start_date, input.end_date,
            input.is_current as i64, input.description, input.sort_order, now,
        ],
    )?;
    Ok(ExperienceEntry {
        id,
        profile_id: input.profile_id,
        company: input.company,
        title: input.title,
        location: input.location,
        start_date: input.start_date,
        end_date: input.end_date,
        is_current: input.is_current,
        description: input.description,
        sort_order: input.sort_order,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_experience_entry(
    db: State<'_, Database>,
    id: String,
    input: UpdateExperienceEntryInput,
) -> Result<ExperienceEntry, AppError> {
    let conn = db.0.lock().unwrap();
    let now = now();
    let rows = conn.execute(
        "UPDATE experience_entries SET company=?1, title=?2, location=?3,
         start_date=?4, end_date=?5, is_current=?6, description=?7,
         sort_order=?8, updated_at=?9 WHERE id=?10",
        rusqlite::params![
            input.company, input.title, input.location,
            input.start_date, input.end_date,
            input.is_current as i64, input.description,
            input.sort_order, now, id,
        ],
    )?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("experience entry {id}")));
    }
    let profile_id: String = conn.query_row(
        "SELECT profile_id FROM experience_entries WHERE id=?1",
        [&id],
        |r| r.get(0),
    )?;
    let created_at: String = conn.query_row(
        "SELECT created_at FROM experience_entries WHERE id=?1",
        [&id],
        |r| r.get(0),
    )?;
    Ok(ExperienceEntry {
        id,
        profile_id,
        company: input.company,
        title: input.title,
        location: input.location,
        start_date: input.start_date,
        end_date: input.end_date,
        is_current: input.is_current,
        description: input.description,
        sort_order: input.sort_order,
        created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_experience_entry(db: State<'_, Database>, id: String) -> Result<(), AppError> {
    let conn = db.0.lock().unwrap();
    let rows = conn.execute("DELETE FROM experience_entries WHERE id=?1", [&id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("experience entry {id}")));
    }
    Ok(())
}
