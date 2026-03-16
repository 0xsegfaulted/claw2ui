#!/bin/bash
# Stop ClawBoard server and tunnel
pkill -f "node.*clawboard.*server" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
rm -f "$(dirname "$0")/.public-url" "$(dirname "$0")/.server.pid"
echo "[clawboard] Stopped."
