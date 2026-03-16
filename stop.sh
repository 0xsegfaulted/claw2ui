#!/bin/bash
# Stop Claw2UI server and tunnel
pkill -f "node dist/server.js" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
rm -f "$(dirname "$0")/.public-url" "$(dirname "$0")/.server.pid"
echo "[claw2ui] Stopped."
