/**
 * Tunnel manager - exposes local server to the internet
 * Priority: cloudflared > localtunnel > manual SSH hint
 */
import { spawn, ChildProcess } from 'child_process';

let tunnelProcess: ChildProcess | null = null;
let publicUrl: string | null = null;

/**
 * Try to start a cloudflared quick tunnel (no account needed)
 */
function startCloudflared(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    const timeout = setTimeout(() => {
      if (!publicUrl) {
        reject(new Error('cloudflared timed out'));
      }
    }, 30000);

    const handleData = (data: Buffer): void => {
      output += data.toString();
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        clearTimeout(timeout);
        publicUrl = match[0];
        tunnelProcess = proc;
        resolve(publicUrl);
      }
    };

    proc.stderr?.on('data', handleData);
    proc.stdout?.on('data', handleData);

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    proc.on('exit', (code) => {
      if (!publicUrl) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited with code ${code}`));
      }
    });
  });
}

/**
 * Try localtunnel as fallback (npx-based, no install needed)
 */
function startLocaltunnel(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['-y', 'localtunnel', '--port', String(port)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    const timeout = setTimeout(() => {
      reject(new Error('localtunnel timed out'));
    }, 60000);

    proc.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
      const match = output.match(/https:\/\/[a-z0-9-]+\.loca\.lt/);
      if (match) {
        clearTimeout(timeout);
        publicUrl = match[0];
        tunnelProcess = proc;
        resolve(publicUrl);
      }
    });

    proc.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Start tunnel with auto-detection
 */
export async function startTunnel(port: number): Promise<string> {
  console.log('[tunnel] Attempting cloudflared quick tunnel...');
  try {
    const url = await startCloudflared(port);
    console.log(`[tunnel] cloudflared tunnel active: ${url}`);
    return url;
  } catch (e: any) {
    console.log(`[tunnel] cloudflared failed: ${e.message}`);
  }

  console.log('[tunnel] Falling back to localtunnel...');
  try {
    const url = await startLocaltunnel(port);
    console.log(`[tunnel] localtunnel active: ${url}`);
    return url;
  } catch (e: any) {
    console.log(`[tunnel] localtunnel failed: ${e.message}`);
  }

  const localUrl = `http://localhost:${port}`;
  publicUrl = localUrl;
  console.log(`[tunnel] No tunnel available. Using local URL: ${localUrl}`);
  console.log('[tunnel] Install cloudflared for public access: brew install cloudflared');
  return localUrl;
}

export function getPublicUrl(): string | null {
  return publicUrl;
}

export function stopTunnel(): void {
  if (tunnelProcess) {
    tunnelProcess.kill();
    tunnelProcess = null;
    publicUrl = null;
  }
}
