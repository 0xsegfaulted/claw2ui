#!/usr/bin/env node
/**
 * Claw2UI CLI - publish pages from the command line
 */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const TOKEN_FILE = path.join(__dirname, '..', '.api-token');

interface UserConfig {
  server?: string;
  token?: string;
}

function loadUserConfig(): UserConfig {
  const configPath = path.join(os.homedir(), '.claw2ui.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {}
  }
  return {};
}

function getLocalToken(): string {
  if (process.env.CLAWBOARD_TOKEN) return process.env.CLAWBOARD_TOKEN;
  try {
    return fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
  } catch {
    return '';
  }
}

const userConfig = loadUserConfig();
const envUrl = process.env.CLAWBOARD_URL;
const API_BASE = envUrl || userConfig.server || `http://localhost:${process.env.CLAWBOARD_PORT || 9800}`;
// Only use saved token if not overriding the server URL via env
// Fall back to local .api-token file for local server usage
const API_TOKEN = process.env.CLAWBOARD_TOKEN || (envUrl ? '' : userConfig.token) || getLocalToken();

function request(method: string, urlPath: string, body: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, API_BASE);
    const proto = url.protocol === 'https:' ? https : http;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers,
    };

    const req = proto.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function getArg(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`Claw2UI CLI - Agent-to-UI Bridge

Commands:
  publish    Create and publish a page
  list       List all pages
  delete     Delete a page
  themes     List available rendering themes
  status     Show server status
  start      Start the server
  register   Register with a remote server (self-service)
  init       Configure remote server manually
  token      Manage API tokens (server admin)

Publish options:
  --html <html>        Raw HTML content
  --file <path>        Read HTML from file
  --spec <json>        A2UI component spec (JSON string)
  --spec-file <path>   Read spec from file (.json or .ts DSL)
  --title <title>      Page title
  --ttl <ms>           Time-to-live in milliseconds (0 = forever)
  --style <theme>      Rendering theme (e.g. "anthropic", "classic")
  --no-check           Skip type checking for .ts DSL files

Register options:
  --server <url>       Remote server URL

Init options:
  --server <url>       Remote server URL
  --token <token>      API token

Token subcommands:
  token create         Generate a new config token
  token list           List config tokens
  token revoke <token> Remove a config token

Examples:
  claw2ui publish --spec-file dashboard.ts --title "Dashboard"
  claw2ui publish --spec-file spec.json --title "Dashboard"
  claw2ui publish --html "<h1>Hello</h1>" --title "Test"
  claw2ui publish --spec-file spec.json --style classic --title "Report"
  claw2ui themes
  claw2ui register --server https://board.example.com
  claw2ui init --server https://board.example.com --token <token>
  claw2ui status`);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'publish': {
        const htmlArg = getArg(args, '--html');
        const file = getArg(args, '--file');
        const spec = getArg(args, '--spec');
        const specFile = getArg(args, '--spec-file');
        const title = getArg(args, '--title') || 'Untitled';
        const ttl = parseInt(getArg(args, '--ttl') || '0', 10);

        if (args.includes('--deliver')) {
          console.error('Warning: --deliver is deprecated and will be removed. Delivery is now the agent\'s responsibility.');
          console.error('Page will still be published. Use response "formats" for platform-specific summaries.');
        }

        const style = getArg(args, '--style');
        const body: Record<string, any> = { title, ttl };
        if (style) body.style = style;

        if (spec) {
          body.spec = JSON.parse(spec);
          if (style) body.spec.style = style;
        } else if (specFile) {
          if (specFile.endsWith('.ts')) {
            const { runDslFile } = require('./dsl/runner');
            const noCheck = args.includes('--no-check');
            body.spec = runDslFile(path.resolve(specFile), { noCheck });
          } else {
            body.spec = JSON.parse(fs.readFileSync(path.resolve(specFile), 'utf-8'));
          }
          if (style) body.spec.style = style;
        } else if (file) {
          body.html = fs.readFileSync(path.resolve(file), 'utf-8');
        } else if (htmlArg) {
          body.html = htmlArg;
        } else {
          body.html = fs.readFileSync('/dev/stdin', 'utf-8');
        }

        const result = await request('POST', '/api/pages', body);
        if (result.error) {
          console.error('Error:', result.error);
          process.exit(1);
        }
        console.log(result.url);
        if (result.formats) {
          console.error(JSON.stringify(result.formats));
        }
        break;
      }

      case 'list': {
        const pages = await request('GET', '/api/pages');
        if (Array.isArray(pages) && pages.length === 0) {
          console.log('No pages.');
        } else if (Array.isArray(pages)) {
          for (const p of pages) {
            console.log(`${p.id}  ${p.title.padEnd(30)}  ${new Date(p.createdAt).toLocaleString()}  ${p.views} views  ${p.url}`);
          }
        } else {
          console.error('Error:', pages);
        }
        break;
      }

      case 'delete': {
        const id = args[1];
        if (!id) { console.error('Usage: claw2ui delete <id>'); process.exit(1); }
        const result = await request('DELETE', `/api/pages/${id}`);
        console.log(result.deleted ? 'Deleted.' : 'Error: ' + (result.error || 'Unknown'));
        break;
      }

      case 'themes': {
        const themes = await request('GET', '/api/themes');
        if (Array.isArray(themes) && themes.length === 0) {
          console.log('No themes available.');
        } else if (Array.isArray(themes)) {
          for (const t of themes) {
            console.log(`${t.id.padEnd(16)} ${t.name.padEnd(24)} ${t.description}`);
          }
        } else {
          console.error('Error:', themes);
        }
        break;
      }

      case 'status': {
        const status = await request('GET', '/api/status');
        console.log(`Status: ${status.status}`);
        console.log(`Port: ${status.port}`);
        console.log(`Public URL: ${status.publicUrl || 'none'}`);
        console.log(`Pages: ${status.pages}`);
        if (status.themes) {
          console.log(`Themes: ${status.themes.join(', ')}`);
        }
        break;
      }

      case 'start': {
        const port = getArg(args, '--port') || '9800';
        const noTunnel = args.includes('--no-tunnel');
        process.env.CLAWBOARD_PORT = port;
        if (noTunnel) process.env.CLAWBOARD_NO_TUNNEL = '1';
        require('./server');
        break;
      }

      case 'register': {
        const server = getArg(args, '--server');
        if (!server) {
          console.error('Usage: claw2ui register --server <url>');
          console.error('\nExample:');
          console.error('  claw2ui register --server https://0xsegfaulted-claw2ui.hf.space');
          process.exit(1);
        }

        const registerUrl = new URL('/api/register', server);
        const regProto = registerUrl.protocol === 'https:' ? https : http;

        const result = await new Promise<any>((resolve, reject) => {
          const req = regProto.request({
            hostname: registerUrl.hostname,
            port: registerUrl.port,
            path: registerUrl.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }, (res) => {
            let data = '';
            res.on('data', (chunk: Buffer) => data += chunk);
            res.on('end', () => {
              try { resolve(JSON.parse(data)); }
              catch { resolve(data); }
            });
          });
          req.on('error', reject);
          req.write('{}');
          req.end();
        });

        if (result.error || !result.token) {
          console.error('Registration failed:', result.error || 'Invalid response from server');
          process.exit(1);
        }

        // Save to ~/.claw2ui.json
        const regConfigPath = path.join(os.homedir(), '.claw2ui.json');
        fs.writeFileSync(regConfigPath, JSON.stringify({ server, token: result.token }, null, 2) + '\n', { mode: 0o600 });
        console.log('Registration successful!');
        console.log(`Config saved to ${regConfigPath}`);
        console.log(`Server: ${server}`);
        console.log('You can now publish pages with: claw2ui publish --html "<h1>Hello</h1>"');
        break;
      }

      case 'init': {
        const initServer = getArg(args, '--server');
        const initToken = getArg(args, '--token');
        if (!initServer || !initToken) {
          console.error('Usage: claw2ui init --server <url> --token <token>');
          process.exit(1);
        }
        const initConfigPath = path.join(os.homedir(), '.claw2ui.json');
        fs.writeFileSync(initConfigPath, JSON.stringify({ server: initServer, token: initToken }, null, 2) + '\n', { mode: 0o600 });
        console.log(`Config saved to ${initConfigPath}`);
        console.log(`Server: ${initServer}`);
        break;
      }

      case 'token': {
        const subCmd = args[1];
        const tokenConfigPath = path.join(process.cwd(), 'claw2ui.config.json');

        switch (subCmd) {
          case 'create': {
            const newToken = crypto.randomBytes(24).toString('hex');
            let config: any = {};
            if (fs.existsSync(tokenConfigPath)) {
              config = JSON.parse(fs.readFileSync(tokenConfigPath, 'utf-8'));
            }
            if (!config.tokens) config.tokens = [];
            config.tokens.push(newToken);
            fs.writeFileSync(tokenConfigPath, JSON.stringify(config, null, 2) + '\n');
            console.log(newToken);
            break;
          }
          case 'list': {
            if (!fs.existsSync(tokenConfigPath)) {
              console.log('No config found.');
              break;
            }
            const config = JSON.parse(fs.readFileSync(tokenConfigPath, 'utf-8'));
            const tokens: string[] = config.tokens || [];
            if (tokens.length === 0) {
              console.log('No tokens.');
            } else {
              for (const t of tokens) {
                console.log(t);
              }
            }
            break;
          }
          case 'revoke': {
            const target = args[2];
            if (!target) { console.error('Usage: claw2ui token revoke <token>'); process.exit(1); }
            if (!fs.existsSync(tokenConfigPath)) { console.error('No config found.'); process.exit(1); }
            const config = JSON.parse(fs.readFileSync(tokenConfigPath, 'utf-8'));
            const before = (config.tokens || []).length;
            config.tokens = (config.tokens || []).filter((t: string) => t !== target);
            if (config.tokens.length === before) {
              console.error('Token not found.');
              process.exit(1);
            }
            fs.writeFileSync(tokenConfigPath, JSON.stringify(config, null, 2) + '\n');
            console.log('Token revoked.');
            break;
          }
          default:
            console.error('Usage: claw2ui token <create|list|revoke>');
            process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}. Run 'claw2ui --help' for usage.`);
        process.exit(1);
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      if (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')) {
        console.error('Error: Claw2UI server is not running. Start it with: claw2ui start');
        console.error('Or connect to a remote server: claw2ui register --server <url>');
      } else {
        console.error(`Error: Cannot connect to ${API_BASE}`);
      }
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

main();
