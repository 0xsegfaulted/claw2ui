#!/bin/bash
# ClawBoard startup script
# Starts the server with tunnel in the background

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Kill any existing instance
pkill -f "node.*clawboard.*server" 2>/dev/null
sleep 1

# Start server
echo "[clawboard] Starting server..."
node src/server.js &
SERVER_PID=$!

echo "[clawboard] Server PID: $SERVER_PID"
echo "$SERVER_PID" > .server.pid

# Wait for tunnel URL
for i in $(seq 1 30); do
  if [ -f .public-url ]; then
    URL=$(cat .public-url)
    echo "[clawboard] Ready! Public URL: $URL"
    exit 0
  fi
  sleep 1
done

echo "[clawboard] Warning: tunnel may not have started. Server running on http://localhost:9800"
