# npm Publish

The CLI package is `forgepad-agent`.

## Dry Run

```bash
npm --prefix cli run build
npm --prefix cli pack --dry-run
```

## Publish

```bash
npm login
npm --prefix cli publish
```

## User Command

After publish, users can run:

```bash
npx forgepad-agent
```

That command starts the desktop agent and prints a Pair URL for the Android app.
