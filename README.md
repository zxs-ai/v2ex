# V2EX Local Client (Skeleton)

This project is a local macOS desktop client shell:

- shows a custom local landing UI first
- then opens official V2EX sign-in page inside the same app window
- optionally tries to auto-fill and submit credentials

## Quick start

```bash
npm install
npm run start
```

## Package for macOS

```bash
npm run dist:mac
```

This will generate a `.dmg` installer under release output folders from `electron-builder`.

## Notes

- Real login state is still handled by `v2ex.com` cookies in a persistent Electron session partition.
- If V2EX changes its login form structure, auto-fill selectors may need updates in `src/main.js`.
- No credential storage is implemented yet (for safety by default).

