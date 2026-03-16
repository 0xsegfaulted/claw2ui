"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTunnel = startTunnel;
exports.getPublicUrl = getPublicUrl;
exports.stopTunnel = stopTunnel;
/**
 * Tunnel manager - exposes local server to the internet
 * Priority: cloudflared > localtunnel > manual SSH hint
 */
const child_process_1 = require("child_process");
let tunnelProcess = null;
let publicUrl = null;
/**
 * Try to start a cloudflared quick tunnel (no account needed)
 */
function startCloudflared(port) {
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let output = '';
        const timeout = setTimeout(() => {
            if (!publicUrl) {
                reject(new Error('cloudflared timed out'));
            }
        }, 30000);
        const handleData = (data) => {
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
function startLocaltunnel(port) {
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)('npx', ['-y', 'localtunnel', '--port', String(port)], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let output = '';
        const timeout = setTimeout(() => {
            reject(new Error('localtunnel timed out'));
        }, 60000);
        proc.stdout?.on('data', (data) => {
            output += data.toString();
            const match = output.match(/https:\/\/[a-z0-9-]+\.loca\.lt/);
            if (match) {
                clearTimeout(timeout);
                publicUrl = match[0];
                tunnelProcess = proc;
                resolve(publicUrl);
            }
        });
        proc.stderr?.on('data', (data) => {
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
async function startTunnel(port) {
    console.log('[tunnel] Attempting cloudflared quick tunnel...');
    try {
        const url = await startCloudflared(port);
        console.log(`[tunnel] cloudflared tunnel active: ${url}`);
        return url;
    }
    catch (e) {
        console.log(`[tunnel] cloudflared failed: ${e.message}`);
    }
    console.log('[tunnel] Falling back to localtunnel...');
    try {
        const url = await startLocaltunnel(port);
        console.log(`[tunnel] localtunnel active: ${url}`);
        return url;
    }
    catch (e) {
        console.log(`[tunnel] localtunnel failed: ${e.message}`);
    }
    const localUrl = `http://localhost:${port}`;
    publicUrl = localUrl;
    console.log(`[tunnel] No tunnel available. Using local URL: ${localUrl}`);
    console.log('[tunnel] Install cloudflared for public access: brew install cloudflared');
    return localUrl;
}
function getPublicUrl() {
    return publicUrl;
}
function stopTunnel() {
    if (tunnelProcess) {
        tunnelProcess.kill();
        tunnelProcess = null;
        publicUrl = null;
    }
}
//# sourceMappingURL=tunnel.js.map