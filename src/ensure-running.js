#!/usr/bin/env node
/**
 * Ensure ClawBoard server is running. If not, start it.
 * Outputs the public URL (or localhost URL) to stdout.
 * Used by agents to check/start the server before publishing.
 */
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.CLAWBOARD_PORT || '9800', 10);
const API = `http://localhost:${PORT}`;

function checkServer() {
  return new Promise((resolve) => {
    http.get(`${API}/api/status`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const status = JSON.parse(data);
          resolve(status.publicUrl || `http://localhost:${PORT}`);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  // Try existing server
  let url = await checkServer();
  if (url) {
    console.log(url);
    return;
  }

  // Start server
  const serverPath = path.join(__dirname, 'server.js');
  const proc = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, CLAWBOARD_PORT: String(PORT) },
  });
  proc.unref();

  // Wait for it to be ready (up to 30s)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    url = await checkServer();
    if (url) {
      console.log(url);
      return;
    }
  }

  // Fallback
  console.log(`http://localhost:${PORT}`);
}

main();
