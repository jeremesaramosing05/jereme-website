#!/bin/bash
set -euo pipefail

# ── SessionStart hook for Claude Code on the web ──────────────────────────────
# The cloud container is wiped and re-cloned every session, so dependencies are
# missing on startup. This installs them up front so `npm run dev | build | lint
# | test` all work immediately — no cold start, no "command not found".
#
# Mode: SYNCHRONOUS. The session waits for this to finish, which guarantees deps
# are ready before any test/lint/build runs (no race conditions). If you'd
# rather trade that guarantee for a faster session start, switch to async (see
# docs/WORKFLOW.md).
#
# Note: the Flutter chess app (chess_app/) is intentionally NOT set up here — an
# Android toolchain is multi-GB and belongs in CI (.github/workflows/
# build-chess-apk.yml), not the interactive container.

# Only run in the remote (cloud) environment; no-op on a local machine.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

LOG="$(mktemp -t session-start-npm.XXXXXX.log)"
echo "[session-start] Installing website dependencies (npm install)…"

# `npm install` (not `npm ci`) so the post-hook container cache stays warm and
# re-runs are fast and idempotent. Verbose output goes to a log; errors surface.
if ! npm install --no-audit --no-fund > "$LOG" 2>&1; then
  echo "[session-start] npm install FAILED:"
  tail -n 30 "$LOG"
  exit 1
fi

echo "[session-start] Ready ✓  (npm run dev | build | lint | test | typecheck)"
