#!/bin/bash
# Claw2UI startup script
# Starts the server with tunnel in the background

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Kill any existing instance
pkill -f "node dist/server.js" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# Remove stale URL file so we wait for the new tunnel
rm -f .public-url

# Build TypeScript if needed
if [ ! -f dist/server.js ] || [ "$(find src -name '*.ts' -newer dist/server.js 2>/dev/null)" ]; then
  echo "[claw2ui] Building TypeScript..."
  npx tsc || { echo "[claw2ui] Build failed!"; exit 1; }
fi

# Start server
echo "[claw2ui] Starting server..."
node dist/server.js &
SERVER_PID=$!

echo "[claw2ui] Server PID: $SERVER_PID"
echo "$SERVER_PID" > .server.pid

# Wait for tunnel URL
for i in $(seq 1 30); do
  if [ -f .public-url ]; then
    URL=$(cat .public-url)
    echo "[claw2ui] Ready! Public URL: $URL"
    exit 0
  fi
  sleep 1
done

echo "[claw2ui] Warning: tunnel may not have started. Server running on http://localhost:9800"
