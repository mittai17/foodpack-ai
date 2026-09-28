#!/usr/bin/env bash
# =============================================================================
# FoodPack AI — Mobile Application Runner (Android Emulator / Physical Device)
# Starts the Expo Metro bundler and optionally launches an Android emulator.
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}ℹ️  $*${NC}"; }
ok()    { echo -e "${GREEN}✅ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $*${NC}"; }
err()   { echo -e "${RED}❌ $*${NC}"; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$REPO_ROOT/mobile"

# ── Parse flags ──────────────────────────────────────────────────────────────
PLATFORM="android"          # default
EMULATOR_NAME=""            # optional: specific AVD name
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ios)      PLATFORM="ios"; shift ;;
    --android)  PLATFORM="android"; shift ;;
    --emulator) EMULATOR_NAME="$2"; shift 2 ;;
    --tunnel)   EXPO_EXTRA="--tunnel"; shift ;;
    --help|-h)
      echo "Usage: $0 [--android|--ios] [--emulator AVD_NAME] [--tunnel]"
      echo ""
      echo "  --android          Target Android emulator (default)"
      echo "  --ios              Target iOS simulator (macOS only)"
      echo "  --emulator NAME    Launch a specific Android AVD by name"
      echo "  --tunnel           Use Expo tunnel mode (for physical devices on different network)"
      exit 0
      ;;
    *) warn "Unknown option: $1"; shift ;;
  esac
done
EXPO_EXTRA="${EXPO_EXTRA:-}"

# ── 1. Check prerequisites ────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Install it via: https://nodejs.org"
fi

if ! command -v pnpm &>/dev/null && ! command -v npx &>/dev/null; then
  err "pnpm or npx is required. Install pnpm: npm install -g pnpm"
fi

if [[ "$PLATFORM" == "android" ]]; then
  if [[ -z "${ANDROID_HOME:-}" ]]; then
    # Try common locations
    if [[ -d "$HOME/Android/Sdk" ]]; then
      export ANDROID_HOME="$HOME/Android/Sdk"
    elif [[ -d "$HOME/.android/sdk" ]]; then
      export ANDROID_HOME="$HOME/.android/sdk"
    else
      warn "ANDROID_HOME is not set. Android SDK may not be found."
    fi
  fi
  export PATH="${PATH}:${ANDROID_HOME:-}/emulator:${ANDROID_HOME:-}/platform-tools"
fi

ok "Prerequisites look good."

# ── 2. Install / verify mobile dependencies ───────────────────────────────────
info "Checking mobile dependencies..."
cd "$MOBILE_DIR"
if [[ ! -d node_modules ]]; then
  info "node_modules not found — installing dependencies..."
  pnpm install || npm install
fi
ok "Dependencies ready."

# ── 3. Launch Android Emulator (if requested and not already running) ─────────
if [[ "$PLATFORM" == "android" ]]; then
  RUNNING_EMULATORS=$(adb devices 2>/dev/null | grep -c "emulator" || true)
  if [[ "$RUNNING_EMULATORS" -eq 0 ]]; then
    if [[ -n "$EMULATOR_NAME" ]]; then
      info "Launching emulator: $EMULATOR_NAME ..."
      emulator -avd "$EMULATOR_NAME" -no-snapshot-load &>/dev/null &
      EMULATOR_PID=$!
      info "Waiting for emulator to boot (this may take ~30s)..."
      adb wait-for-device 2>/dev/null
      sleep 8
      ok "Emulator booted."
    else
      # Auto-pick first available AVD
      AVD_LIST=$(emulator -list-avds 2>/dev/null | head -1 || true)
      if [[ -n "$AVD_LIST" ]]; then
        info "Auto-launching AVD: $AVD_LIST ..."
        emulator -avd "$AVD_LIST" -no-snapshot-load &>/dev/null &
        EMULATOR_PID=$!
        info "Waiting for emulator to boot (this may take ~30s)..."
        adb wait-for-device 2>/dev/null
        sleep 8
        ok "Emulator booted."
      else
        warn "No AVD found and no emulator running. Expo will wait for a device."
        warn "Start an emulator from Android Studio, then re-run this script."
      fi
    fi
  else
    ok "Android emulator already running."
  fi
fi

# ── 4. Start Expo Metro Bundler ───────────────────────────────────────────────
echo ""
info "Starting Expo Metro bundler for FoodPack AI Mobile (${PLATFORM})..."
echo ""

if [[ "$PLATFORM" == "android" ]]; then
  EXPO_CMD="npx expo start --android $EXPO_EXTRA"
elif [[ "$PLATFORM" == "ios" ]]; then
  EXPO_CMD="npx expo start --ios $EXPO_EXTRA"
else
  EXPO_CMD="npx expo start $EXPO_EXTRA"
fi

echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     FoodPack AI — Mobile (Expo) is starting 📱   ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Platform: ${PLATFORM}                                     ║${NC}"
echo -e "${GREEN}║  Tunnel:   ${EXPO_EXTRA:-disabled}                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Run Expo in foreground (interactive — shows QR code, Metro logs, etc.)
cd "$MOBILE_DIR"
eval "$EXPO_CMD"
