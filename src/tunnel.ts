/**
 * Tunnel manager - exposes local server to the internet via cloudflared
 * Priority: named tunnel (if configured) > cloudflared quick tunnel > localhost
 *
 * Named tunnel config (env vars):
 *   CLAWBOARD_TUNNEL_NAME  - cloudflared tunnel name (e.g. "claw2ui")
 *   CLAWBOARD_TUNNEL_URL   - fixed public URL (e.g. "https://board.example.com")
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
 * Start a named cloudflared tunnel (requires `cloudflared tunnel login` + tunnel created)
 */
function startNamedTunnel(port: number, tunnelName: string, fixedUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('cloudflared', ['tunnel', 'run', '--url', `http://localhost:${port}`, tunnelName], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    const timeout = setTimeout(() => {
      if (!publicUrl) {
        reject(new Error('named tunnel timed out'));
      }
    }, 30000);

    const handleData = (data: Buffer): void => {
      output += data.toString();
      // Named tunnels log "Connection ... registered" when ready
      if (output.includes('Registered tunnel connection') || output.includes('Connection registered')) {
        clearTimeout(timeout);
        publicUrl = fixedUrl;
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
        reject(new Error(`cloudflared named tunnel exited with code ${code}`));
      }
    });
  });
}

/**
 * Start tunnel with auto-detection
 * Priority: named tunnel (env) > quick tunnel > localhost
 */
export async function startTunnel(port: number): Promise<string> {
  // 0. Static public URL (cloud deployment, no tunnel needed)
  const staticUrl = process.env.CLAWBOARD_PUBLIC_URL;
  if (staticUrl) {
    publicUrl = staticUrl.replace(/\/+$/, '');
    console.log(`[tunnel] Using static public URL: ${publicUrl}`);
    return publicUrl;
  }

  // 1. Named tunnel (fixed domain)
  const tunnelName = process.env.CLAWBOARD_TUNNEL_NAME;
  const tunnelUrl = process.env.CLAWBOARD_TUNNEL_URL;
  if (tunnelName && tunnelUrl) {
    console.log(`[tunnel] Starting named tunnel "${tunnelName}" → ${tunnelUrl}`);
    try {
      const url = await startNamedTunnel(port, tunnelName, tunnelUrl);
      console.log(`[tunnel] Named tunnel active: ${url}`);
      return url;
    } catch (e: any) {
      console.log(`[tunnel] Named tunnel failed: ${e.message}`);
    }
  }

  // 2. Quick tunnel (random URL)
  console.log('[tunnel] Attempting cloudflared quick tunnel...');
  try {
    const url = await startCloudflared(port);
    console.log(`[tunnel] cloudflared tunnel active: ${url}`);
    return url;
  } catch (e: any) {
    console.log(`[tunnel] cloudflared failed: ${e.message}`);
  }

  const localUrl = `http://localhost:${port}`;
  publicUrl = localUrl;
  console.log(`[tunnel] No tunnel available. Using local URL: ${localUrl}`);
  console.log('[tunnel] Install cloudflared for public access: brew install cloudflared');
  return localUrl;
}

export function getPublicUrl(): string | null {
  if (publicUrl) return publicUrl;
  const staticUrl = process.env.CLAWBOARD_PUBLIC_URL;
  if (staticUrl) return staticUrl.replace(/\/+$/, '');
  return null;
}

export function stopTunnel(): void {
  if (tunnelProcess) {
    tunnelProcess.kill();
    tunnelProcess = null;
    publicUrl = null;
  }
}
