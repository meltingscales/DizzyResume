use chrono::Utc;
use tauri::State;
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

    Ok(ProfileStats {
        total_applications: total,
        this_week,
        response_rate,
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
