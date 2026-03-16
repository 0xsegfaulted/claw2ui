#!/bin/bash
# ClawBoard startup script
# Starts the server with tunnel in the background

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Kill any existing instance
pkill -f "node dist/server.js" 2>/dev/null
pkill -f "cloudflared tunnel --url http://localhost" 2>/dev/null
sleep 1

# Remove stale URL file so we wait for the new tunnel
rm -f .public-url

# Build TypeScript if needed
if [ ! -f dist/server.js ] || [ "$(find src -name '*.ts' -newer dist/server.js 2>/dev/null)" ]; then
  echo "[clawboard] Building TypeScript..."
  npx tsc || { echo "[clawboard] Build failed!"; exit 1; }
fi

# Start server
echo "[clawboard] Starting server..."
node dist/server.js &
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
