#!/bin/bash
# Quick publish helper for Claude Code / cc-connect integration
# Usage: publish-page.sh <json-file-or-stdin>
#
# Reads a JSON spec file (or stdin) and publishes it to Claw2UI.
# Outputs just the public URL (for sending via IM).
#
# If Claw2UI server is not running, starts it first.

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${CLAWBOARD_PORT:-9800}"
API="http://localhost:$PORT"

# Helper to read token
read_token() {
  TOKEN="${CLAWBOARD_TOKEN:-}"
  if [ -z "$TOKEN" ] && [ -f "$SCRIPT_DIR/.api-token" ]; then
    TOKEN=$(cat "$SCRIPT_DIR/.api-token")
  fi
  AUTH_HEADER=""
  if [ -n "$TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $TOKEN"
  fi
}

read_token

# Check if server is running
if ! curl -s -H "$AUTH_HEADER" "$API/api/status" > /dev/null 2>&1; then
  echo "[claw2ui] Server not running, starting..." >&2
  cd "$SCRIPT_DIR" && bash start.sh >&2
  sleep 5
  # Re-read token (server may have generated a new one)
  read_token
fi

# Read input
if [ -n "$1" ] && [ -f "$1" ]; then
  DATA=$(cat "$1")
else
  DATA=$(cat /dev/stdin)
fi

# Publish
RESULT=$(curl -s -X POST "$API/api/pages" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$DATA")

# Extract and output URL
echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])" 2>/dev/null || echo "$RESULT"
