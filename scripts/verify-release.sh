#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# The user’s Termux/proot build previously hit the default ~2 GB V8 heap limit.
if [[ "${NODE_OPTIONS:-}" != *"--max-old-space-size="* ]]; then
  export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=4096"
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [[ "$NODE_MAJOR" -ne 22 ]]; then
  echo "ERROR: JEMBEE PLAY validation expects Node.js 22.x; found $(node --version)." >&2
  exit 2
fi

echo "[1/5] Running all dependency-free Node contract tests..."
TEST_LIST="$(mktemp)"
trap 'rm -f "$TEST_LIST"' EXIT
find src -type f \( -name '*.test.mjs' -o -name '*.spec.mjs' \) -print0 | sort -z > "$TEST_LIST"
mapfile -d '' -t TEST_FILES < "$TEST_LIST"
if [[ "${#TEST_FILES[@]}" -eq 0 ]]; then
  echo "ERROR: No Node contract tests were found." >&2
  exit 3
fi
node --test "${TEST_FILES[@]}"

echo "[2/5] Installing the exact locked dependencies..."
npm ci --no-audit --no-fund

echo "[3/5] Running the project TypeScript check..."
npx tsc --noEmit --incremental false --pretty false

echo "[4/5] Running ESLint..."
npx eslint src

echo "[5/5] Building the Next.js production bundle..."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
export NEXT_TELEMETRY_DISABLED=1
npm run build

echo "SUCCESS: Node tests, dependency install, TypeScript, ESLint, and production build all passed."
echo "This script does not verify external Firebase, Google Drive, Cashfree, ad-network, Android, or production deployment connectivity."
