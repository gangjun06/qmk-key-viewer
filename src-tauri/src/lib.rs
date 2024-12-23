use tauri::{AppHandle, Emitter, Manager};

extern crate hidapi;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

const VID: u16 = 0x5957;
const PID: u16 = 0x0200;

fn start_hid_monitoring(app: AppHandle) {
    let api = hidapi::HidApi::new().unwrap();

    let devices = api.device_list();

    let device = devices.into_iter().find(|device| {
     println!(
            "Device Found: VID: {:04X}, PID: {:04X}, Manufacturer: {:?}, Product: {:?}, Interface: {:?}, Usage Page: {:?}, Usage: {:?}",
            device.vendor_id(),
            device.product_id(),
            device.manufacturer_string(),
            device.product_string(),
            device.interface_number(),
            device.usage_page(),
            device.usage(),
        );

        device.vendor_id() == VID && device.product_id() == PID && device.usage_page() == 65329 && device.usage() == 116
    });

    if device.is_none() {
        println!("Device not found");
        return;
    }

    let device = device.unwrap().open_device(&api).unwrap();

    let mut current_line = String::new();
    let mut buf = [0u8; 32];

    loop {
        match device.read_timeout(&mut buf, 1000) {
            Ok(size) if size > 0 => {
                current_line.push_str(&String::from_utf8_lossy(&buf[..size]).replace('\x00', ""));
                while let Some(pos) = current_line.find('\n') {
                    let message = current_line[..pos].to_string();
                    current_line = current_line[pos + 1..].to_string();
                    println!("Received: {}", message);
                    app.emit(
                        "hid_event",
                        Payload {
                            message: format!("{}", message),
                        },
                    )
                    .unwrap();
                }
            }
            Ok(_) => {
                // No data read
            }
            Err(e) => {
                eprintln!("Error reading from device: {}", e);
                break;
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            // window.set_ignore_cursor_events(true)?;
            window.set_decorations(false)?;

            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_positioner::init())
                    .unwrap();
                tauri::tray::TrayIconBuilder::new()
                    .on_tray_icon_event(|tray_handle, event| {
                        tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);
                    })
                    .build(app)?;
            }

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                start_hid_monitoring(app_handle);
            });

            // #[cfg(target_os = "macos")]
            // apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            //     .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            //
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
