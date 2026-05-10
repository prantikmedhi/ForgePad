# ForgePad

ForgePad is an original Android-first secure mobile IDE.

It is designed as a clean-room implementation:

- no reused third-party source files
- no copied branding or assets
- no dependency on another project's protocol

## Workspace layout

- `app/` Expo mobile client
- `cli/` desktop agent and provider runtime host
- `manager/` pairing session service
- `proxy/` encrypted relay entrypoint
- `pty/` native PTY helper

## Principles

- desktop remains the authority
- mobile remains a remote client
- every sensitive action is auditable
- providers are normalized through one adapter contract

## Near-term milestones

1. secure pairing
2. file system browsing
3. terminal session transport
4. git primitives
5. first AI provider adapter

## Verify

```bash
npm run verify
```

## APK

```bash
npm run app:build:apk
```

APK build details live in `docs/APK_BUILD.md`.

## npm CLI

```bash
npx forgepad-agent
```

Publish details live in `docs/NPM_PUBLISH.md`.
