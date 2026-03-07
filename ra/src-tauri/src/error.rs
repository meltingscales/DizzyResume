use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum AppError {
    Database(String),
    NotFound(String),
    InvalidInput(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Database(e) => write!(f, "Database error: {e}"),
            AppError::NotFound(e) => write!(f, "Not found: {e}"),
            AppError::InvalidInput(e) => write!(f, "Invalid input: {e}"),
        }
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::InvalidInput(e.to_string())
    }
}
