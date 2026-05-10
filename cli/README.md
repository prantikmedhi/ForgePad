# ForgePad Agent

Desktop agent for ForgePad mobile IDE.

## Run

```bash
npx forgepad-agent
```

The agent prints a local Pair URL. Paste that URL into the ForgePad Android app.

## Options

```bash
npx forgepad-agent --port 47321
npx forgepad-agent --help
npx forgepad-agent --version
```

## Security Model

- pairing uses a one-time code
- the desktop owns workspace authority
- the mobile app receives only a session token after pairing
- invalid pairing codes are rejected
