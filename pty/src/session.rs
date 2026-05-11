use std::io::Write;

use portable_pty::{Child, MasterPty};

pub struct PtySession {
    pub id: String,
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Box<dyn Write + Send>,
    pub child: Box<dyn Child + Send>,
}

impl PtySession {
    pub fn new(
        id: String,
        master: Box<dyn MasterPty + Send>,
        writer: Box<dyn Write + Send>,
        child: Box<dyn Child + Send>,
    ) -> Self {
        Self {
            id,
            master,
            writer,
            child,
        }
    }
}
