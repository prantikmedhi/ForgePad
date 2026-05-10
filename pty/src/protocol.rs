use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PtyMessage {
    pub action: String,
    pub payload: String,
}
