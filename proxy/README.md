# ForgePad Proxy

Dual-channel WebSocket relay for ForgePad.

## Channels

- `/ws/control`
- `/ws/data`

Each channel supports:

- `sessionId`
- `peer=host|mobile`

## Run

```bash
npm install
npm run build
npm run start
```

## Env

- `FORGEPAD_PROXY_PORT`
- `FORGEPAD_PROXY_PUBLIC_URL`
