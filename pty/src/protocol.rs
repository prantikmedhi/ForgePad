use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PtyRequest {
    Create {
        id: String,
        cwd: Option<String>,
        shell: Option<String>,
        cols: Option<u16>,
        rows: Option<u16>,
    },
    Write {
        id: String,
        data: String,
    },
    Resize {
        id: String,
        cols: u16,
        rows: u16,
    },
    Kill {
        id: String,
    },
    List,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PtyEvent {
    Ready {
        id: String,
    },
    Output {
        id: String,
        data: String,
    },
    Exit {
        id: String,
        status: Option<i32>,
    },
    Sessions {
        ids: Vec<String>,
    },
    Ack {
        id: String,
        action: String,
    },
    Error {
        id: Option<String>,
        message: String,
    },
}
