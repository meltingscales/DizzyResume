use serde::{Deserialize, Serialize};

// ── Profile ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
    pub country: String,
    pub linkedin_url: Option<String>,
    pub website: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProfileInput {
    pub name: String,
    pub email: String,
    pub phone: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
    pub country: String,
    pub linkedin_url: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileInput {
    pub name: String,
    pub email: String,
    pub phone: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
    pub country: String,
    pub linkedin_url: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProfileStats {
    pub total_applications: i64,
    pub this_week: i64,
    pub response_rate: f64,
}

// ── Resume Variant ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResumeVariant {
    pub id: String,
    pub profile_id: String,
    pub name: String,
    pub description: String,
    pub is_default: bool,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateResumeVariantInput {
    pub profile_id: String,
    pub name: String,
    pub description: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateResumeVariantInput {
    pub name: String,
    pub description: String,
    pub content: String,
}

// ── Template ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Template {
    pub id: String,
    /// "cover-letter" | "references" | "qa"
    #[serde(rename = "type")]
    pub kind: String,
    pub title: String,
    pub description: String,
    pub content: String,
    pub variables: Vec<String>,
    pub use_count: i64,
    pub last_used_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTemplateInput {
    #[serde(rename = "type")]
    pub kind: String,
    pub title: String,
    pub description: String,
    pub content: String,
    pub variables: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTemplateInput {
    pub title: String,
    pub description: String,
    pub content: String,
    pub variables: Vec<String>,
}

// ── Snippet ───────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Snippet {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub use_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSnippetInput {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSnippetInput {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
}

// ── Application ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Application {
    pub id: String,
    pub profile_id: String,
    pub company: String,
    pub title: String,
    pub location: String,
    pub status: String,
    pub salary_min: Option<i64>,
    pub salary_max: Option<i64>,
    pub ats_platform: String,
    pub job_url: Option<String>,
    pub resume_variant_id: Option<String>,
    pub notes: String,
    pub applied_at: Option<String>,
    /// Derived: "fresh" | "warning" | "stale"
    pub age: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateApplicationInput {
    pub profile_id: String,
    pub company: String,
    pub title: String,
    pub location: String,
    pub status: String,
    pub salary_min: Option<i64>,
    pub salary_max: Option<i64>,
    pub ats_platform: String,
    pub job_url: Option<String>,
    pub resume_variant_id: Option<String>,
    pub notes: String,
    pub applied_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateApplicationStatusInput {
    pub status: String,
}
