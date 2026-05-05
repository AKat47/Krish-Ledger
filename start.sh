#!/usr/bin/env bash
# Bootstrap + run KrishiLedger locally on macOS.
#
#   ./start.sh           install (if needed) and run backend + frontend
#   ./start.sh --build   install + production build of frontend, no servers
#   ./start.sh --clean   wipe node_modules and reinstall, then run
#
# Requires: node, npm, and a local mongod listening on 127.0.0.1:27017.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
MODE="${1:-run}"

log()  { printf "\033[1;32m▸\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m!\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m✗\033[0m %s\n" "$*"; exit 1; }

# ── Sanity ───────────────────────────────────────────────────────────────────
command -v node >/dev/null || fail "node not found. Install Node.js 18+ first."
command -v npm  >/dev/null || fail "npm not found."

# Quick mongod check (TCP probe, no client required).
if ! (echo > /dev/tcp/127.0.0.1/27017) >/dev/null 2>&1; then
  warn "mongod doesn't seem to be listening on 127.0.0.1:27017."
  warn "Start it first, e.g.:  brew services start mongodb-community"
  warn "Continuing anyway — backend will exit if it can't connect."
fi

# ── Clean reinstall? ─────────────────────────────────────────────────────────
if [ "$MODE" = "--clean" ]; then
  log "Removing node_modules in backend and frontend"
  rm -rf "$BACKEND/node_modules" "$FRONTEND/node_modules"
  MODE="run"
fi

# ── Install deps ─────────────────────────────────────────────────────────────
install_if_needed() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    log "Installing deps in $(basename "$dir")"
    (cd "$dir" && npm install)
  else
    log "Deps already installed in $(basename "$dir") (skipping)"
  fi
}

install_if_needed "$BACKEND"
install_if_needed "$FRONTEND"

# ── Build-only mode ──────────────────────────────────────────────────────────
if [ "$MODE" = "--build" ]; then
  log "Building frontend (production)"
  (cd "$FRONTEND" && npm run build)
  log "Build complete: $FRONTEND/dist"
  exit 0
fi

# ── Run both servers ─────────────────────────────────────────────────────────
log "Starting backend on http://localhost:5001"
(cd "$BACKEND" && npm start) &
BACK_PID=$!

# Give backend a moment to bind, mostly for cleaner log ordering.
sleep 1

log "Starting frontend on http://localhost:5173"
(cd "$FRONTEND" && npm run dev) &
FRONT_PID=$!

cleanup() {
  echo
  log "Shutting down…"
  kill "$BACK_PID"  2>/dev/null || true
  kill "$FRONT_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Wait for Vite to start serving, then open the browser.
(
  for i in $(seq 1 30); do
    if curl -sS -o /dev/null -m 1 http://localhost:5173/; then
      log "Frontend is up — opening browser"
      open "http://localhost:5173" 2>/dev/null || true
      break
    fi
    sleep 1
  done
) &

log "Both servers running. Press Ctrl+C to stop."
log "Open: http://localhost:5173"

wait
