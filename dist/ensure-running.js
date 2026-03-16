#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Ensure ClawBoard server is running. If not, start it.
 * Outputs the public URL (or localhost URL) to stdout.
 */
const http_1 = __importDefault(require("http"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const PORT = parseInt(process.env.CLAWBOARD_PORT || '9800', 10);
const API = `http://localhost:${PORT}`;
function checkServer() {
    return new Promise((resolve) => {
        http_1.default.get(`${API}/api/status`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const status = JSON.parse(data);
                    resolve(status.publicUrl || `http://localhost:${PORT}`);
                }
                catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}
async function main() {
    let url = await checkServer();
    if (url) {
        console.log(url);
        return;
    }
    const serverPath = path_1.default.join(__dirname, 'server.js');
    const proc = (0, child_process_1.spawn)('node', [serverPath], {
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
//# sourceMappingURL=ensure-running.js.map