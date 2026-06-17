# Development & Verification Workflow

How this repo is set up so that creating, **verifying**, and building work fast
and reliably — especially in **Claude Code on the web** (the cloud), where the
container is wiped and re-cloned every session.

## What's in this repo

This is two projects in one:

| Path | Project | Stack | Where it's built/verified |
| --- | --- | --- | --- |
| `/` (root) | **Website** | Next.js 16, React 19, TypeScript, Tailwind v4 | In-container + `Website CI` |
| `chess_app/` | **Chess Trainer** | Flutter / Dart → Android APK | **CI only** (`Build Chess Trainer APK`) |

The website runs and builds inside the Claude/cloud container. The Flutter app
does **not** — an Android/Flutter toolchain is multiple gigabytes and needs an
emulator, so it is built and tested in GitHub Actions, not the interactive
session. That split is intentional: keep the interactive box light and fast;
push the heavy mobile build to CI.

## The verification pipeline (website)

Everything is wired into npm scripts so there's one obvious command for each
check, and one command that runs them all:

```sh
npm run dev         # local dev server  → http://localhost:3000
npm run build       # production build — statically generates every page
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (type errors without emitting files)
npm run test        # Vitest, single run (CI mode)
npm run test:watch  # Vitest in watch mode while developing
npm run verify      # typecheck → lint → test → build  (run this before pushing)
```

**`npm run verify` is the one to remember.** If it's green, the site type-checks,
lints, every unit test passes, and every page builds. That's your "is my work
correct?" button.

### Why `build` is itself a strong test

`next build` statically generates all pages (see the route list it prints). If a
page throws while rendering, the build fails — so a green build is an
end-to-end smoke test that every page renders without error.

## Tests

Unit tests live next to the code they cover as `*.test.ts` / `*.test.tsx` and run
in Vitest. The first suite is `src/content/content.test.ts`, which guards the
data that drives every page (unique project slugs, required case-study fields,
valid demo ids, etc.).

- **Logic / data / content tests** run in the fast `node` environment — no setup.
- **React component tests** (rendering, clicks): add `jsdom` +
  `@testing-library/react` + `@testing-library/jest-dom`, then put
  `// @vitest-environment jsdom` at the top of the test file. (Not installed yet
  — added on first need to keep installs fast.)

To add a test: drop a `something.test.ts` beside the file under test, `import`
what you need, and write `describe / it / expect`. `npm run test:watch` re-runs
on save.

## Fast, warm cloud sessions — the SessionStart hook

`.claude/hooks/session-start.sh` runs automatically when a cloud session starts
and does `npm install`, so dependencies are ready before you do anything — no
cold start, no "command not found". It's registered in `.claude/settings.json`.

- It **only runs in the cloud** (`CLAUDE_CODE_REMOTE=true`); it no-ops locally.
- It runs **synchronously**: the session waits (~20 s) for the install to
  finish. That guarantees deps are ready before any test/build runs.
- **Want a faster start instead?** Switch to async: make the script's first
  line of output `echo '{"async": true, "asyncTimeout": 300000}'` and let it
  install in the background. Trade-off: the session starts sooner, but a command
  run in the first few seconds might race the still-running install.

> The hook takes effect for **all future sessions once it's merged into the
> repo's default branch.**

## Continuous Integration

| Workflow | File | Trigger | Does |
| --- | --- | --- | --- |
| **Website CI** | `.github/workflows/web-ci.yml` | push / PR (ignores `chess_app/`-only changes) | `npm ci` → typecheck → lint → test → build |
| **Build Chess Trainer APK** | `.github/workflows/build-chess-apk.yml` | push to `chess_app/**`, or manual | Builds the Android APK, publishes it to the `chess-app-latest` release |

So every push verifies the website automatically, and any chess-app change
produces a fresh installable APK — no local Android setup required.

## Recommended loop for a change

1. Make the change.
2. `npm run test:watch` (or `npm run test`) while iterating.
3. `npm run verify` before pushing.
4. Push → Website CI re-runs the same checks; chess changes also build an APK.
