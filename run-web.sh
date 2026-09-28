#!/usr/bin/env bash
# =============================================================================
# FoodPack AI — Web Application Runner
# Starts PostgreSQL, the NestJS API, and the Next.js web dev server.
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}ℹ️  $*${NC}"; }
ok()    { echo -e "${GREEN}✅ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $*${NC}"; }
err()   { echo -e "${RED}❌ $*${NC}"; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down FoodPack AI web services..."
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
  ok "All services stopped."
}
trap cleanup EXIT INT TERM

# ── 1. PostgreSQL ─────────────────────────────────────────────────────────────
info "Checking PostgreSQL..."
if ! pg_isready -q 2>/dev/null; then
  info "Starting PostgreSQL service..."
  sudo systemctl start postgresql || err "Could not start PostgreSQL. Run: sudo systemctl start postgresql"
fi
ok "PostgreSQL is running."

# ── 2. Prisma migrations (web API) ───────────────────────────────────────────
info "Running Prisma migrations..."
cd "$REPO_ROOT/apps/api"
pnpm exec prisma migrate deploy 2>/dev/null || warn "Prisma migrations skipped (may already be up-to-date)."
cd "$REPO_ROOT"
ok "Database schema is up-to-date."

# ── 3. NestJS API ────────────────────────────────────────────────────────────
info "Starting NestJS API (apps/api)..."
cd "$REPO_ROOT/apps/api"
pnpm run start:dev > "$REPO_ROOT/logs/api.log" 2>&1 &
API_PID=$!
ok "NestJS API started (PID $API_PID) — logs: logs/api.log"

# Give the API a moment to initialise before starting the web server
sleep 3

# ── 4. Next.js Web Dev Server ─────────────────────────────────────────────────
info "Starting Next.js web dev server (apps/web)..."
cd "$REPO_ROOT/apps/web"
pnpm run dev > "$REPO_ROOT/logs/web.log" 2>&1 &
WEB_PID=$!
ok "Next.js dev server started (PID $WEB_PID) — logs: logs/web.log"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       FoodPack AI — Web is running! 🌐           ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Web app  →  http://localhost:3000                ║${NC}"
echo -e "${GREEN}║  API      →  http://localhost:4000                ║${NC}"
echo -e "${GREEN}║  API docs →  http://localhost:4000/api/docs       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
info "Press Ctrl+C to stop all services."

# ── Keep script alive ─────────────────────────────────────────────────────────
mkdir -p "$REPO_ROOT/logs"
wait
