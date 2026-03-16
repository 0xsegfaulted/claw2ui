#!/usr/bin/env node
/**
 * Ensure ClawBoard server is running. If not, start it.
 * Outputs the public URL (or localhost URL) to stdout.
 */
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

const PORT = parseInt(process.env.CLAWBOARD_PORT || '9800', 10);
const API = `http://localhost:${PORT}`;

function checkServer(): Promise<string | null> {
  return new Promise((resolve) => {
    http.get(`${API}/api/status`, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => data += chunk);
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

async function main(): Promise<void> {
  let url = await checkServer();
  if (url) {
    console.log(url);
    return;
  }

  const serverPath = path.join(__dirname, 'server.js');
  const proc = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, CLAWBOARD_PORT: String(PORT) },
  });
  proc.unref();

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    url = await checkServer();
    if (url) {
      console.log(url);
      return;
    }
  }

  console.log(`http://localhost:${PORT}`);
}

main();
