# ForgePad PTY

Native PTY daemon speaking JSON lines over stdin/stdout.

## Request Types

- `create`
- `write`
- `resize`
- `kill`
- `list`

## Event Types

- `ready`
- `output`
- `exit`
- `ack`
- `error`
