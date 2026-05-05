#!/usr/bin/env bash
# Sync this folder up to your existing GitHub repo without overwriting its
# history. Strategy:
#   1. Reset the local repo state (.git is currently from a sandbox attempt).
#   2. git init + add remote + fetch origin/main.
#   3. `git reset origin/main` so HEAD/index match remote, but keep our working
#      tree untouched.
#   4. `git add` the diff (just our new local-run scripts + port move).
#   5. Commit + push as a normal new commit on top of remote main.
#
# Auth: uses your Mac's existing creds (Keychain, gh, or SSH).

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

REMOTE_URL="https://github.com/AKat47/Krish-Ledger.git"
BRANCH="main"

log()  { printf "\033[1;32m▸\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m!\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m✗\033[0m %s\n" "$*"; exit 1; }

command -v git >/dev/null || fail "git not found. Run: xcode-select --install"

# ── Wipe whatever .git we have — start clean ────────────────────────────────
if [ -d ".git" ]; then
  warn "Removing existing .git (it's from an earlier sandbox attempt)"
  rm -rf .git
fi

log "git init"
git init -b "$BRANCH" >/dev/null

# Set local identity if global isn't configured.
if [ -z "$(git config user.name)" ]; then
  git config user.name "${GIT_AUTHOR_NAME:-AK}"
fi
if [ -z "$(git config user.email)" ]; then
  git config user.email "${GIT_AUTHOR_EMAIL:-ananthkrish2002@gmail.com}"
fi

log "Adding remote: $REMOTE_URL"
git remote add origin "$REMOTE_URL"

log "Fetching origin/$BRANCH (you may be prompted for credentials)"
echo "    Username = your GitHub username (e.g. AKat47)"
echo "    Password = a Personal Access Token (settings → Developer settings → PAT)"
echo
if ! git fetch origin "$BRANCH"; then
  warn "Fetch failed. Common causes:"
  warn "  - Wrong PAT (passwords don't work since 2021)"
  warn "  - PAT missing 'repo' scope"
  warn "  - Network issue"
  exit 1
fi

# Move HEAD/index to origin/main, but DO NOT touch working tree files.
log "Aligning local repo with origin/$BRANCH (working tree preserved)"
git reset "origin/$BRANCH" >/dev/null

log "Diff vs. origin/$BRANCH:"
git status --short
echo

# Stage everything that differs.
git add -A

if git diff --cached --quiet; then
  log "Nothing to commit — local working tree already matches origin/$BRANCH"
  log "Done. Open: https://github.com/AKat47/Krish-Ledger"
  echo
  read -n 1 -s -r -p "Press any key to close…"
  echo
  exit 0
fi

log "Committing local changes"
git commit -m "Local-run scaffolding: start.sh, Start/Push .command files, backend port -> 5001

- start.sh + Start KrishiLedger.command for one-click local dev (npm install,
  npm start backend, npm run dev frontend, browser open)
- Push to GitHub.command for syncing this folder back to origin
- Move backend from :5000 to :5001 to avoid macOS AirPlay Receiver conflict;
  Vite proxy target updated to match
- backend/.env (local mongo URI) — gitignored, not committed"

log "Pushing to origin/$BRANCH"
if git push -u origin "$BRANCH"; then
  log "Pushed successfully."
  echo
  echo "Open: https://github.com/AKat47/Krish-Ledger"
else
  warn "Push was rejected. The remote may have advanced since we fetched."
  warn "Re-run this script to fetch again and try once more."
fi

echo
read -n 1 -s -r -p "Press any key to close…"
echo
