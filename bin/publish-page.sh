#!/bin/bash
# Quick publish helper for Claude Code / cc-connect integration
# Usage: publish-page.sh <json-file-or-stdin>
#
# Reads a JSON spec file (or stdin) and publishes it to ClawBoard.
# Outputs just the public URL (for sending via IM).
#
# If ClawBoard server is not running, starts it first.

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${CLAWBOARD_PORT:-9800}"
API="http://localhost:$PORT"

# Check if server is running
if ! curl -s "$API/api/status" > /dev/null 2>&1; then
  echo "[clawboard] Server not running, starting..." >&2
  cd "$SCRIPT_DIR" && bash start.sh >&2
  sleep 5
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
  -d "$DATA")

# Extract and output URL
echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])" 2>/dev/null || echo "$RESULT"
