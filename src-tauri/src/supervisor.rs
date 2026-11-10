use std::os::windows::process::CommandExt;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

static CHILD: Mutex<Option<Child>> = Mutex::new(None);
static JOB: Mutex<Option<isize>> = Mutex::new(None);

pub fn start(app: &AppHandle) -> Result<(), String> {
    let note_dir = note_stack_dir()?;
    fs::create_dir_all(&note_dir).map_err(|error| error.to_string())?;

    let db_path = note_dir.join("note-stack.db");
    let secret = load_or_create_secret(&note_dir.join("auth-secret"))?;
    let app_dir = resource_app_dir(app)?;
    let node = node_binary()?;
    let log_path = note_dir.join("server.log");
    let log_file = fs::File::create(&log_path).map_err(|error| error.to_string())?;

    let schema_status = command(&node)
        .arg(node_path(&app_dir.join("ensure-schema.cjs")))
        .current_dir(&app_dir)
        .env("NOTESTACK_DB", &db_path)
        .env("NOTESTACK_SCHEMA", app_dir.join("schema.sql"))
        .stdout(Stdio::from(log_file.try_clone().map_err(|error| error.to_string())?))
        .stderr(Stdio::from(log_file.try_clone().map_err(|error| error.to_string())?))
        .status()
        .map_err(|error| format!("Could not prepare the local database: {error}"))?;
    if !schema_status.success() {
        return Err(format!(
            "Could not prepare the local database.\n{}",
            tail(&log_path)
        ));
    }

    let port = free_port()?;
    let server_log = fs::File::create(&log_path).map_err(|error| error.to_string())?;
    let mut server = command(&node)
        .arg(node_path(&app_dir.join("server.js")))
        .current_dir(&app_dir)
        .env("PORT", port.to_string())
        .env("HOSTNAME", "127.0.0.1")
        .env("NODE_ENV", "production")
        .env("AUTH_SECRET", secret)
        .stdout(Stdio::from(server_log.try_clone().map_err(|error| error.to_string())?))
        .stderr(Stdio::from(server_log))
        .spawn()
        .map_err(|error| format!("Could not start the bundled Node.js runtime: {error}"))?;

    if let Err(error) = attach_kill_on_close(&server) {
        let _ = server.kill();
        return Err(error);
    }

    if let Err(error) = wait_until_ready(port, &mut server, &log_path) {
        let _ = server.kill();
        return Err(error);
    }

    let url = format!("http://127.0.0.1:{port}/")
        .parse()
        .map_err(|error: url::ParseError| error.to_string())?;
    tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::External(url))
        .title("Note-Stack")
        .inner_size(1280.0, 800.0)
        .min_inner_size(960.0, 640.0)
        .build()
        .map_err(|error| error.to_string())?;

    *CHILD.lock().map_err(|error| error.to_string())? = Some(server);
    Ok(())
}

pub fn stop() {
    if let Ok(mut child) = CHILD.lock() {
        if let Some(server) = child.as_mut() {
            let _ = server.kill();
            let _ = server.wait();
        }
        *child = None;
    }
    if let Ok(mut job) = JOB.lock() {
        if let Some(handle) = job.take() {
            unsafe {
                windows_sys::Win32::Foundation::CloseHandle(handle as *mut core::ffi::c_void);
            }
        }
    }
}

fn command(node: &Path) -> Command {
    let mut command = Command::new(node);
    command.creation_flags(0x08000000);
    command
}

fn node_path(path: &Path) -> PathBuf {
    let text = path.to_string_lossy();
    match text.strip_prefix(r"\\?\") {
        Some(stripped) => PathBuf::from(stripped),
        None => path.to_path_buf(),
    }
}

fn note_stack_dir() -> Result<PathBuf, String> {
    let base = std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .or_else(|| {
            std::env::var_os("USERPROFILE").map(|home| PathBuf::from(home).join("AppData").join("Roaming"))
        })
        .ok_or_else(|| "APPDATA is not set".to_string())?;
    Ok(base.join("NoteStack"))
}

fn load_or_create_secret(path: &Path) -> Result<String, String> {
    if let Ok(existing) = fs::read_to_string(path) {
        let secret = existing.trim();
        if !secret.is_empty() {
            return Ok(secret.to_string());
        }
    }
    let mut bytes = [0u8; 32];
    getrandom::getrandom(&mut bytes).map_err(|error| error.to_string())?;
    let secret = bytes.iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    let mut file = fs::File::create(path).map_err(|error| error.to_string())?;
    file.write_all(secret.as_bytes()).map_err(|error| error.to_string())?;
    Ok(secret)
}

fn resource_app_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|error| error.to_string())?;
    let app_dir = resource_dir.join("resources").join("app");
    if app_dir.join("server.js").is_file() {
        return Ok(app_dir);
    }
    Err(format!(
        "The bundled Next.js server was not found at {}",
        app_dir.display()
    ))
}

fn node_binary() -> Result<PathBuf, String> {
    let exe_dir = std::env::current_exe()
        .map_err(|error| error.to_string())?
        .parent()
        .ok_or_else(|| "Could not locate the application directory".to_string())?
        .to_path_buf();
    for name in ["node.exe", "node-x86_64-pc-windows-msvc.exe"] {
        let candidate = exe_dir.join(name);
        if candidate.is_file() {
            return Ok(candidate);
        }
    }
    Err(format!(
        "Bundled Node.js was not found in {}",
        exe_dir.display()
    ))
}

fn free_port() -> Result<u16, String> {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").map_err(|error| error.to_string())?;
    let port = listener.local_addr().map_err(|error| error.to_string())?.port();
    drop(listener);
    Ok(port)
}

fn wait_until_ready(port: u16, server: &mut Child, log_path: &Path) -> Result<(), String> {
    let address = format!("127.0.0.1:{port}");
    let started = Instant::now();
    while started.elapsed() < Duration::from_secs(30) {
        if server.try_wait().map_err(|error| error.to_string())?.is_some() {
            return Err(format!("The local server stopped.\n{}", tail(log_path)));
        }
        if std::net::TcpStream::connect_timeout(
            &address.parse().map_err(|error: std::net::AddrParseError| error.to_string())?,
            Duration::from_millis(200),
        )
        .is_ok()
        {
            return Ok(());
        }
        std::thread::sleep(Duration::from_millis(200));
    }
    Err(format!("The local server did not start.\n{}", tail(log_path)))
}

fn tail(path: &Path) -> String {
    let mut file = match fs::File::open(path) {
        Ok(file) => file,
        Err(_) => return String::new(),
    };
    let mut text = String::new();
    let _ = file.read_to_string(&mut text);
    let mut lines = text.lines().rev().take(20).collect::<Vec<_>>();
    lines.reverse();
    lines.join("\n")
}

fn attach_kill_on_close(child: &Child) -> Result<(), String> {
    use std::os::windows::io::AsRawHandle;
    use windows_sys::Win32::Foundation::CloseHandle;
    use windows_sys::Win32::System::JobObjects::{
        AssignProcessToJobObject, CreateJobObjectW, JobObjectExtendedLimitInformation,
        SetInformationJobObject, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
    };

    unsafe {
        let job = CreateJobObjectW(std::ptr::null(), std::ptr::null());
        if job.is_null() {
            return Err("CreateJobObjectW failed".to_string());
        }
        let mut info: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        let configured = SetInformationJobObject(
            job,
            JobObjectExtendedLimitInformation,
            &info as *const _ as *const _,
            std::mem::size_of_val(&info) as u32,
        );
        if configured == 0 {
            CloseHandle(job);
            return Err("SetInformationJobObject failed".to_string());
        }
        let assigned = AssignProcessToJobObject(job, child.as_raw_handle() as _);
        if assigned == 0 {
            CloseHandle(job);
            return Err("AssignProcessToJobObject failed".to_string());
        }
        *JOB.lock().map_err(|error| error.to_string())? = Some(job as isize);
    }
    Ok(())
}
