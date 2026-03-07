mod commands;
mod db;
mod error;
mod models;
mod server;

use commands::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_dir)?;

            let database = db::init(app_dir.join("ra.db"))
                .expect("Failed to initialise Ptah's Vault (SQLite)");

            // Spawn Hapi's Flow on Tauri's tokio runtime.
            // The server gets its own clone of the Arc<Mutex<Connection>>.
            let db_for_server = database.clone();
            tauri::async_runtime::spawn(async move {
                server::serve(db_for_server).await;
            });

            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Profiles
            get_profile,
            get_profiles,
            create_profile,
            update_profile,
            delete_profile,
            get_profile_stats,
            // Resume Variants
            get_resume_variants,
            create_resume_variant,
            update_resume_variant,
            set_default_variant,
            delete_resume_variant,
            // Templates
            get_templates,
            create_template,
            update_template,
            record_template_use,
            delete_template,
            // Snippets
            get_snippets,
            create_snippet,
            update_snippet,
            record_snippet_use,
            delete_snippet,
            // PDF import
            extract_pdf_text,
            // Applications
            get_applications,
            create_application,
            update_application_status,
            delete_application,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
