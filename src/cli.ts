#!/usr/bin/env node
/**
 * ClawBoard CLI - publish pages from the command line
 */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

const API_BASE = process.env.CLAWBOARD_URL || `http://localhost:${process.env.CLAWBOARD_PORT || 9800}`;

function request(method: string, urlPath: string, body: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, API_BASE);
    const proto = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' } as Record<string, string>,
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
    console.log(`ClawBoard CLI - Agent-to-UI Bridge

Commands:
  publish    Create and publish a page
  list       List all pages
  delete     Delete a page
  status     Show server status
  start      Start the server

Publish options:
  --html <html>        Raw HTML content
  --file <path>        Read HTML from file
  --spec <json>        A2UI component spec (JSON string)
  --spec-file <path>   Read spec from JSON file
  --title <title>      Page title
  --ttl <ms>           Time-to-live in milliseconds (0 = forever)

Examples:
  clawboard publish --html "<h1>Hello World</h1>" --title "Test"
  clawboard publish --spec-file spec.json --title "Analytics"
  clawboard status`);
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

        const body: Record<string, any> = { title, ttl };

        if (spec) {
          body.spec = JSON.parse(spec);
        } else if (specFile) {
          const content = fs.readFileSync(path.resolve(specFile), 'utf-8');
          body.spec = JSON.parse(content);
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
        if (!id) { console.error('Usage: clawboard delete <id>'); process.exit(1); }
        const result = await request('DELETE', `/api/pages/${id}`);
        console.log(result.deleted ? 'Deleted.' : 'Error: ' + (result.error || 'Unknown'));
        break;
      }

      case 'status': {
        const status = await request('GET', '/api/status');
        console.log(`Status: ${status.status}`);
        console.log(`Port: ${status.port}`);
        console.log(`Public URL: ${status.publicUrl || 'none'}`);
        console.log(`Pages: ${status.pages}`);
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

      default:
        console.error(`Unknown command: ${command}. Run 'clawboard --help' for usage.`);
        process.exit(1);
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Error: ClawBoard server is not running. Start it with: clawboard start');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

main();
