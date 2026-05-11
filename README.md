# ForgePad

ForgePad is an original Android-first mobile IDE stack.

Version `0.1.0` now ships with:

- Expo Android client in `app/`
- desktop agent CLI in `cli/`
- manager service with 10-minute in-memory session TTL in `manager/`
- dual-channel WebSocket relay proxy in `proxy/`
- native PTY daemon protocol in `pty/`

## Architecture

### App

- Android client pairs with desktop through direct LAN Pair URL or manager-issued relay Pair URL
- session metadata stored locally with secure storage
- workspace view shows transport mode, providers, project root, and session details

### CLI

Run:

```bash
npx forgepad-agent
```

Optional relay mode:

```bash
FORGEPAD_MANAGER_URL=http://127.0.0.1:47320 \
FORGEPAD_PROXY_URL=ws://127.0.0.1:47322 \
npx forgepad-agent
```

CLI prints:

- direct LAN Pair URL
- relay Pair URL when manager/proxy configured
- available AI providers

### Manager

Manager is session control plane.

- 10-minute session TTL
- session registration endpoint
- claim endpoint at `/pair?code=...`
- heartbeat endpoint for desktop agent renewal

### Proxy

Proxy is WebSocket relay plane.

- control channel at `/ws/control`
- data channel at `/ws/data`
- peer roles: `host` and `mobile`
- one session can keep both channels open in parallel

### PTY

PTY daemon speaks JSON lines over stdin/stdout.

Supported requests:

- `create`
- `write`
- `resize`
- `kill`
- `list`

Supported events:

- `ready`
- `output`
- `exit`
- `ack`
- `error`

## Local Run

Build services:

```bash
npm run manager:build
npm run proxy:build
npm run agent:build
```

Start services:

```bash
npm run manager:start
npm run proxy:start
npm run agent:start
```

## Verify

```bash
npm run verify
```

## APK

APK build notes live in `docs/APK_BUILD.md`.

Release artifact path:

```text
releases/apk/ForgePad-v0.1.0.apk
```
