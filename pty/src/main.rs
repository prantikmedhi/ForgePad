mod protocol;
mod session;

use std::collections::HashMap;
use std::env;
use std::io::{self, BufRead, Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;

use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use protocol::{PtyEvent, PtyRequest};
use session::PtySession;

type SharedStdout = Arc<Mutex<io::Stdout>>;

fn emit(stdout: &SharedStdout, event: &PtyEvent) {
    if let Ok(line) = serde_json::to_string(event) {
        if let Ok(mut handle) = stdout.lock() {
            let _ = writeln!(handle, "{line}");
            let _ = handle.flush();
        }
    }
}

fn default_shell() -> String {
    if cfg!(windows) {
        env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string())
    } else {
        env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string())
    }
}

fn start_session(
    sessions: &mut HashMap<String, PtySession>,
    stdout: &SharedStdout,
    id: String,
    cwd: Option<String>,
    shell: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
) {
    if sessions.contains_key(&id) {
        emit(
            stdout,
            &PtyEvent::Error {
                id: Some(id),
                message: "Session already exists".to_string(),
            },
        );
        return;
    }

    let pty_system = native_pty_system();
    let size = PtySize {
        rows: rows.unwrap_or(24),
        cols: cols.unwrap_or(80),
        pixel_width: 0,
        pixel_height: 0,
    };

    let pair = match pty_system.openpty(size) {
        Ok(pair) => pair,
        Err(error) => {
            emit(
                stdout,
                &PtyEvent::Error {
                    id: Some(id),
                    message: format!("openpty failed: {error}"),
                },
            );
            return;
        }
    };

    let mut builder = CommandBuilder::new(shell.unwrap_or_else(default_shell));
    if let Some(cwd) = cwd {
        builder.cwd(cwd);
    }

    let child = match pair.slave.spawn_command(builder) {
        Ok(child) => child,
        Err(error) => {
            emit(
                stdout,
                &PtyEvent::Error {
                    id: Some(id),
                    message: format!("spawn failed: {error}"),
                },
            );
            return;
        }
    };

    let reader_id = id.clone();
    let stdout_for_reader = Arc::clone(stdout);
    match pair.master.try_clone_reader() {
        Ok(mut reader) => {
            thread::spawn(move || {
                let mut buffer = [0_u8; 8192];
                loop {
                    match reader.read(&mut buffer) {
                        Ok(0) => break,
                        Ok(size) => {
                            let data = String::from_utf8_lossy(&buffer[..size]).to_string();
                            emit(
                                &stdout_for_reader,
                                &PtyEvent::Output {
                                    id: reader_id.clone(),
                                    data,
                                },
                            );
                        }
                        Err(error) => {
                            emit(
                                &stdout_for_reader,
                                &PtyEvent::Error {
                                    id: Some(reader_id.clone()),
                                    message: format!("read failed: {error}"),
                                },
                            );
                            break;
                        }
                    }
                }
            });
        }
        Err(error) => {
            emit(
                stdout,
                &PtyEvent::Error {
                    id: Some(id),
                    message: format!("clone reader failed: {error}"),
                },
            );
            return;
        }
    }

    let writer = match pair.master.take_writer() {
        Ok(writer) => writer,
        Err(error) => {
            emit(
                stdout,
                &PtyEvent::Error {
                    id: Some(id),
                    message: format!("take writer failed: {error}"),
                },
            );
            return;
        }
    };

    let session = PtySession::new(id.clone(), pair.master, writer, child);
    sessions.insert(id.clone(), session);
    emit(stdout, &PtyEvent::Ready { id });
}

fn main() {
    let stdin = io::stdin();
    let stdout = Arc::new(Mutex::new(io::stdout()));
    let mut sessions: HashMap<String, PtySession> = HashMap::new();

    for line in stdin.lock().lines() {
        let Ok(line) = line else {
            emit(
                &stdout,
                &PtyEvent::Error {
                    id: None,
                    message: "stdin read failed".to_string(),
                },
            );
            continue;
        };

        let request = match serde_json::from_str::<PtyRequest>(&line) {
            Ok(request) => request,
            Err(error) => {
                emit(
                    &stdout,
                    &PtyEvent::Error {
                        id: None,
                        message: format!("invalid request: {error}"),
                    },
                );
                continue;
            }
        };

        match request {
            PtyRequest::Create {
                id,
                cwd,
                shell,
                cols,
                rows,
            } => {
                start_session(&mut sessions, &stdout, id, cwd, shell, cols, rows);
            }
            PtyRequest::Write { id, data } => {
                match sessions.get_mut(&id) {
                    Some(session) => {
                        if let Err(error) = session.writer.write_all(data.as_bytes()) {
                            emit(
                                &stdout,
                                &PtyEvent::Error {
                                    id: Some(id),
                                    message: format!("write failed: {error}"),
                                },
                            );
                        } else {
                            emit(
                                &stdout,
                                &PtyEvent::Ack {
                                    id,
                                    action: "write".to_string(),
                                },
                            );
                        }
                    }
                    None => emit(
                        &stdout,
                        &PtyEvent::Error {
                            id: Some(id),
                            message: "session not found".to_string(),
                        },
                    ),
                }
            }
            PtyRequest::Resize { id, cols, rows } => {
                match sessions.get_mut(&id) {
                    Some(session) => {
                        let result = session.master.resize(PtySize {
                            rows,
                            cols,
                            pixel_width: 0,
                            pixel_height: 0,
                        });

                        match result {
                            Ok(()) => emit(
                                &stdout,
                                &PtyEvent::Ack {
                                    id,
                                    action: "resize".to_string(),
                                },
                            ),
                            Err(error) => emit(
                                &stdout,
                                &PtyEvent::Error {
                                    id: Some(id),
                                    message: format!("resize failed: {error}"),
                                },
                            ),
                        }
                    }
                    None => emit(
                        &stdout,
                        &PtyEvent::Error {
                            id: Some(id),
                            message: "session not found".to_string(),
                        },
                    ),
                }
            }
            PtyRequest::Kill { id } => {
                match sessions.remove(&id) {
                    Some(mut session) => {
                        let _ = session.child.kill();
                        let status = session.child.wait().ok().and_then(|exit| exit.exit_code());
                        emit(&stdout, &PtyEvent::Exit { id, status });
                    }
                    None => emit(
                        &stdout,
                        &PtyEvent::Error {
                            id: Some(id),
                            message: "session not found".to_string(),
                        },
                    ),
                }
            }
            PtyRequest::List => {
                let mut ids: Vec<String> = sessions.values().map(|session| session.id.clone()).collect();
                ids.sort();
                emit(&stdout, &PtyEvent::Sessions { ids });
            }
        }
    }
}
