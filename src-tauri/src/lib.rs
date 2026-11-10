mod supervisor;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            if let Err(error) = supervisor::start(app.handle()) {
                eprintln!("{error}");
                return Err(error.into());
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Note-Stack")
        .run(|_app, event| {
            if let tauri::RunEvent::Exit = event {
                supervisor::stop();
            }
        });
}
