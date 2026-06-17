<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace & verification

This repo is a **Next.js website** (root) plus a **Flutter chess app**
(`chess_app/`). Full details in [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

- **Verify website work with `npm run verify`** (typecheck → lint → test →
  build). Run it before pushing. Individual steps: `npm run typecheck | lint |
  test | build`.
- **Tests** are Vitest, co-located as `*.test.ts(x)`. Add one beside the code
  you change.
- **Cloud sessions** auto-run `npm install` via `.claude/hooks/session-start.sh`,
  so deps are ready on start.
- **The Flutter app is built and tested in CI** (`.github/workflows/
  build-chess-apk.yml`), not in this container — no local Flutter/Android setup.
