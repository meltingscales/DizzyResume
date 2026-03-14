mod commands;
mod db;
mod error;
mod models;
mod server;
mod vault;

use commands::*;
use tauri::Manager;
use vault::VaultState;

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
            app.manage(VaultState::new());
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
            // Resume Files
            get_resume_files,
            import_resume_file,
            delete_resume_file,
            // Experience Entries
            get_experience_entries,
            create_experience_entry,
            update_experience_entry,
            delete_experience_entry,
            // Serket's Vault
            vault_is_setup,
            vault_is_unlocked,
            vault_setup,
            vault_unlock,
            vault_lock,
            get_credentials,
            create_credential,
            update_credential,
            delete_credential,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
