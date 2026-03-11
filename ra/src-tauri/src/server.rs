/// Hapi's Flow — local HTTP server on 127.0.0.1:9741
///
/// Horus (the browser extension) calls this API to fetch profile data,
/// get resume variants for autofill, and log completed applications.
/// Bound to loopback only — never reachable from outside the machine.
use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, Method, StatusCode},
    response::{Json, Response},
    routing::{get, patch, post},
    Router,
};
use chrono::Utc;
use serde_json::{json, Value};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

use crate::db::Database;
use crate::models::*;

// ── Helpers ───────────────────────────────────────────────────────────────────

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<Value>)>;

fn err500(e: impl std::fmt::Display) -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    )
}

fn err404(msg: impl std::fmt::Display) -> (StatusCode, Json<Value>) {
    (
        StatusCode::NOT_FOUND,
        Json(json!({ "error": msg.to_string() })),
    )
}

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

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

// ── Handlers ──────────────────────────────────────────────────────────────────

async fn health() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "Ra",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

// GET /profiles
async fn list_profiles(State(db): State<Database>) -> ApiResult<Vec<Profile>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, name, email, phone, address_line1, address_line2,
                    city, state, zip_code, country,
                    linkedin_url, website, created_at, updated_at
             FROM profiles ORDER BY name ASC",
        )
        .map_err(err500)?;
    let rows = stmt
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
        })
        .map_err(err500)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(err500)?;
    Ok(Json(rows))
}

// GET /profiles/:id
async fn get_profile(
    State(db): State<Database>,
    Path(id): Path<String>,
) -> ApiResult<Profile> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT id, name, email, phone, address_line1, address_line2,
                city, state, zip_code, country,
                linkedin_url, website, created_at, updated_at
         FROM profiles WHERE id=?1",
        [&id],
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
    .map(Json)
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => err404(format!("profile '{id}' not found")),
        _ => err500(e),
    })
}

// GET /profiles/:id/variants
async fn list_variants(
    State(db): State<Database>,
    Path(profile_id): Path<String>,
) -> ApiResult<Vec<ResumeVariant>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, profile_id, name, description, is_default, content, created_at, updated_at
             FROM resume_variants WHERE profile_id=?1
             ORDER BY is_default DESC, name ASC",
        )
        .map_err(err500)?;
    let rows = stmt
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
        })
        .map_err(err500)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(err500)?;
    Ok(Json(rows))
}

// GET /snippets
async fn list_snippets(State(db): State<Database>) -> ApiResult<Vec<Snippet>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, title, content, tags, use_count, created_at, updated_at
             FROM snippets ORDER BY use_count DESC, title ASC",
        )
        .map_err(err500)?;
    let rows = stmt
        .query_map([], |row| {
            let tags_json: String = row.get("tags")?;
            Ok(Snippet {
                id: row.get("id")?,
                title: row.get("title")?,
                content: row.get("content")?,
                tags: serde_json::from_str(&tags_json).unwrap_or_default(),
                use_count: row.get("use_count")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        })
        .map_err(err500)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(err500)?;
    Ok(Json(rows))
}

// GET /templates
async fn list_templates(State(db): State<Database>) -> ApiResult<Vec<Template>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, kind, title, description, content, variables,
                    use_count, last_used_at, created_at, updated_at
             FROM templates ORDER BY use_count DESC, title ASC",
        )
        .map_err(err500)?;
    let rows = stmt
        .query_map([], |row| {
            let vars_json: String = row.get("variables")?;
            Ok(Template {
                id: row.get("id")?,
                kind: row.get("kind")?,
                title: row.get("title")?,
                description: row.get("description")?,
                content: row.get("content")?,
                variables: serde_json::from_str(&vars_json).unwrap_or_default(),
                use_count: row.get("use_count")?,
                last_used_at: row.get("last_used_at")?,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
            })
        })
        .map_err(err500)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(err500)?;
    Ok(Json(rows))
}

// POST /snippets/:id/use — Horus records a snippet copy
async fn record_snippet_use(
    State(db): State<Database>,
    Path(id): Path<String>,
) -> ApiResult<Value> {
    let conn = db.0.lock().unwrap();
    let now = now();
    conn.execute(
        "UPDATE snippets SET use_count=use_count+1, updated_at=?1 WHERE id=?2",
        rusqlite::params![now, id],
    )
    .map_err(err500)?;
    Ok(Json(json!({ "ok": true })))
}

// POST /applications — Horus calls this when a form is successfully submitted
async fn create_application(
    State(db): State<Database>,
    Json(input): Json<CreateApplicationInput>,
) -> ApiResult<Application> {
    let conn = db.0.lock().unwrap();
    let id = new_id();
    let now = now();
    conn.execute(
        "INSERT INTO applications
         (id, profile_id, company, title, location, status, salary_min, salary_max,
          ats_platform, job_url, resume_variant_id, notes, applied_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14)",
        rusqlite::params![
            id,
            input.profile_id,
            input.company,
            input.title,
            input.location,
            input.status,
            input.salary_min,
            input.salary_max,
            input.ats_platform,
            input.job_url,
            input.resume_variant_id,
            input.notes,
            input.applied_at,
            now,
        ],
    )
    .map_err(err500)?;

    let age = compute_age(&input.applied_at, &now);
    Ok(Json(Application {
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
    }))
}

// PATCH /applications/:id/status
async fn update_application_status(
    State(db): State<Database>,
    Path(id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Value> {
    let status = body["status"]
        .as_str()
        .ok_or_else(|| (StatusCode::BAD_REQUEST, Json(json!({ "error": "missing 'status' field" }))))?
        .to_string();

    let conn = db.0.lock().unwrap();
    let now = now();
    let rows = if status == "applied" {
        conn.execute(
            "UPDATE applications SET status=?1, updated_at=?2,
             applied_at=COALESCE(applied_at, ?2) WHERE id=?3",
            rusqlite::params![status, now, id],
        )
    } else {
        conn.execute(
            "UPDATE applications SET status=?1, updated_at=?2 WHERE id=?3",
            rusqlite::params![status, now, id],
        )
    }
    .map_err(err500)?;

    if rows == 0 {
        return Err(err404(format!("application '{id}' not found")));
    }
    Ok(Json(json!({ "id": id, "status": status, "updated_at": now })))
}

// GET /profiles/:id/files
async fn list_resume_files(
    State(db): State<Database>,
    Path(profile_id): Path<String>,
) -> ApiResult<Vec<ResumeFile>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, profile_id, variant_id, label, kind, filename, file_path, size_bytes, created_at
             FROM resume_files WHERE profile_id=?1 ORDER BY created_at DESC",
        )
        .map_err(err500)?;
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
        })
        .map_err(err500)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(err500)?;
    Ok(Json(rows))
}

// GET /files/:id/download — serves raw PDF bytes to Horus
async fn download_resume_file(
    State(db): State<Database>,
    Path(id): Path<String>,
) -> Result<Response<Body>, (StatusCode, Json<serde_json::Value>)> {
    let conn = db.0.lock().unwrap();
    let (file_path, filename): (String, String) = conn
        .query_row(
            "SELECT file_path, filename FROM resume_files WHERE id=?1",
            [&id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => err404(format!("file '{id}' not found")),
            _ => err500(e),
        })?;
    drop(conn); // release the lock before file I/O

    let bytes = std::fs::read(&file_path).map_err(|e| err500(e))?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/pdf")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{filename}\""),
        )
        .body(Body::from(bytes))
        .map_err(|e| err500(e))?;

    Ok(response)
}

// ── Router ────────────────────────────────────────────────────────────────────

pub async fn serve(db: Database) {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let app = Router::new()
        .route("/health", get(health))
        .route("/profiles", get(list_profiles))
        .route("/profiles/:id", get(get_profile))
        .route("/profiles/:id/variants", get(list_variants))
        .route("/profiles/:id/files", get(list_resume_files))
        .route("/files/:id/download", get(download_resume_file))
        .route("/snippets", get(list_snippets))
        .route("/snippets/:id/use", post(record_snippet_use))
        .route("/templates", get(list_templates))
        .route("/applications", post(create_application))
        .route("/applications/:id/status", patch(update_application_status))
        .with_state(db)
        .layer(cors);

    match tokio::net::TcpListener::bind("127.0.0.1:9741").await {
        Ok(listener) => {
            eprintln!("Hapi's Flow: listening on http://127.0.0.1:9741");
            if let Err(e) = axum::serve(listener, app).await {
                eprintln!("Hapi's Flow: server error: {e}");
            }
        }
        Err(e) => {
            eprintln!("Hapi's Flow: could not bind to port 9741: {e}");
        }
    }
}
