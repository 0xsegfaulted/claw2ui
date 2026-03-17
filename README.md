# Claw2UI

Agent-to-UI bridge: let AI agents generate interactive web pages and serve them via a public URL.

Claw2UI takes a declarative JSON spec (or raw HTML) and renders it into a fully interactive page — accessible anywhere through a Cloudflare Tunnel or cloud deployment.

**[Live Demo](https://0xsegfaulted-claw2ui.hf.space)** · **[npm](https://www.npmjs.com/package/claw2ui)** · **[HF Space](https://huggingface.co/spaces/0xsegfaulted/claw2ui)**

## Features

- **30+ UI components** — stats, charts, tables, tabs, modals, forms, and more
- **Pluggable themes** — Anthropic Editorial (default) and Classic, with runtime registration
- **Mobile responsive** — fluid `clamp()` sizing, adapts to any screen
- **Zero-config tunneling** — automatic Cloudflare quick tunnel, or bring your own domain
- **Cloud deployment** — Docker + HF Space support with auto-backup to HF Dataset
- **Self-service API** — register tokens, publish pages, no admin needed
- **Platform formatting** — API returns platform-specific summaries (Telegram, etc.)
- **Dark mode** — auto-detects system preference
- **CLI & API** — publish pages from scripts, agents, or any HTTP client
- **ComponentRegistry pattern** — extensible, type-safe component rendering
- **File-based storage** — no database needed, with optional HF Dataset backup
- **TTL support** — pages auto-expire after a set duration

## Quick Start

```bash
# Install globally
npm install -g claw2ui

# Start the server (opens a tunnel automatically)
claw2ui start

# Publish a page from a JSON spec
claw2ui publish --spec-file dashboard.json --title "My Dashboard"
# → https://random-words.trycloudflare.com/p/abc123

# Use a specific theme
claw2ui publish --spec-file report.json --title "Report" --style classic

# List available themes
claw2ui themes
```

## Installation

```bash
npm install -g claw2ui
```

**Optional**: Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) for public tunnel access:

```bash
# macOS
brew install cloudflared

# Linux
# See https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

Without cloudflared, Claw2UI falls back to localhost-only mode.

## Usage

### CLI Commands

```bash
claw2ui start                    # Start server + tunnel
claw2ui status                   # Check server status
claw2ui themes                   # List available themes
claw2ui publish --spec-file <file> --title "Title"  # Publish from spec
claw2ui publish --html "<h1>Hi</h1>" --title "Test" # Publish raw HTML
claw2ui publish --spec-file <file> --style classic   # Use specific theme
claw2ui list                     # List all pages
claw2ui delete <page-id>         # Delete a page
claw2ui register                 # Self-service token registration (remote server)
claw2ui token list               # Admin: list registered tokens
claw2ui token revoke <id>        # Admin: revoke a token
```

### Publish Options

| Flag | Description |
|------|-------------|
| `--spec-file <path>` | A2UI component spec (JSON file) |
| `--spec <json>` | Inline JSON spec |
| `--html <html>` | Raw HTML content |
| `--file <path>` | Read HTML from file |
| `--title <title>` | Page title |
| `--style <theme>` | Rendering theme (`anthropic`, `classic`) |
| `--ttl <ms>` | Time-to-live in milliseconds (0 = forever) |

### API

Claw2UI runs on `http://localhost:9800` by default.

```bash
# Self-service registration (no auth required)
curl -X POST http://localhost:9800/api/register
# → {"token": "abc...", "message": "Registration successful."}

# Create a page
curl -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Hello","components":[{"type":"header","props":{"title":"Hello World"}}]}'

# List pages (admin/config token or localhost)
curl http://localhost:9800/api/pages

# List themes
curl http://localhost:9800/api/themes

# Server status
curl http://localhost:9800/api/status
```

### Authentication Tiers

| Tier | Access | Use Case |
|------|--------|----------|
| **Admin** | Full access (token from env/file) | Server operator |
| **Config** | Privileged (tokens in config file) | Trusted agents |
| **Registered** | Publish only (50 pages/day limit) | Self-service users |
| **Public** | View pages at `/p/:id` | Anyone with the URL |

## Themes

Claw2UI ships with two built-in themes:

| Theme | Description |
|-------|-------------|
| `anthropic` (default) | Warm editorial aesthetic — cream backgrounds, Newsreader serif headings, terracotta accents, generous whitespace |
| `classic` | Original Claw2UI look — clean Tailwind CSS, blue accents, gray surfaces, system fonts |

Specify a theme in the spec:

```json
{
  "title": "My Page",
  "style": "anthropic",
  "components": [...]
}
```

Or via CLI: `claw2ui publish --spec-file spec.json --style classic`

## Component Spec (A2UI)

Pages are described as a JSON tree of components:

```json
{
  "title": "Sales Dashboard",
  "style": "anthropic",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Sales Dashboard", "subtitle": "Q1 2026" } },
      { "type": "row", "props": { "cols": 3 }, "children": [
        { "type": "stat", "props": { "label": "Revenue", "value": "$1.2M", "change": 15.3, "icon": "payments" } },
        { "type": "stat", "props": { "label": "Orders", "value": "8,432", "change": 8.1, "icon": "shopping_cart" } },
        { "type": "stat", "props": { "label": "Customers", "value": "2,847", "change": -2.5, "icon": "group" } }
      ]},
      { "type": "card", "props": { "title": "Revenue Trend" }, "children": [
        { "type": "chart", "props": {
          "chartType": "line",
          "data": {
            "labels": ["Jan", "Feb", "Mar"],
            "datasets": [{ "label": "Revenue", "data": [320000, 410000, 480000] }]
          }
        }}
      ]}
    ]}
  ]
}
```

### Available Components

**Layout**: `container`, `row`, `column`, `card`, `tabs`, `accordion`, `list`, `modal`

**Data Display**: `stat`, `table`, `chart` (line, bar, pie, doughnut, radar, polarArea, bubble, scatter)

**Input**: `button`, `text-field`, `select`, `checkbox`, `choice-picker`, `slider`, `date-time-input`

**Media**: `icon`, `image`, `video`, `audio-player`, `text`, `code`, `markdown`, `html`, `divider`, `spacer`

**Navigation**: `header`, `link`

See [CLAUDE.md](./CLAUDE.md) for full component documentation with all props.

## Deployment

### Local (default)

```bash
claw2ui start
# Server on http://localhost:9800, tunnel URL printed to console
```

### Local + Fixed Domain

```bash
cloudflared tunnel login
cloudflared tunnel create claw2ui
cloudflared tunnel route dns claw2ui board.yourdomain.com

export CLAWBOARD_TUNNEL_NAME=claw2ui
export CLAWBOARD_TUNNEL_URL=https://board.yourdomain.com
claw2ui start
```

### Docker / HF Space

Claw2UI includes a `Dockerfile` for cloud deployment (e.g. Hugging Face Spaces):

```bash
# Create HF Space
hf repos create yourname/claw2ui --type space --space-sdk docker

# Upload
hf upload yourname/claw2ui . . --type space
```

Set these Secrets in your Space settings:

| Secret | Value |
|--------|-------|
| `CLAWBOARD_TOKEN` | Your admin token |
| `CLAWBOARD_PUBLIC_URL` | `https://yourname-claw2ui.hf.space` |
| `HF_TOKEN` | HF token with write access (for backup) |
| `CLAWBOARD_BACKUP_REPO` | `yourname/claw2ui-data` (private dataset) |

The server auto-backs up pages and tokens to an HF Dataset, restoring them on restart.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAWBOARD_PORT` | `9800` | Server port |
| `CLAWBOARD_BIND` | `127.0.0.1` | Bind address (`0.0.0.0` for cloud) |
| `CLAWBOARD_TOKEN` | auto-generated | Admin API bearer token |
| `CLAWBOARD_NO_TUNNEL` | `0` | Set to `1` to skip tunnel |
| `CLAWBOARD_TUNNEL_NAME` | — | Cloudflare named tunnel |
| `CLAWBOARD_TUNNEL_URL` | — | Fixed public URL for named tunnel |
| `CLAWBOARD_PUBLIC_URL` | — | Static public URL (cloud deployment) |
| `CLAWBOARD_TRUST_PROXY` | `loopback` | Express trust proxy setting |
| `CLAWBOARD_BACKUP_REPO` | — | HF Dataset repo for backup |
| `HF_TOKEN` | — | HF API token for backup |

### Platform Delivery (Telegram)

```bash
cp claw2ui.config.example.json claw2ui.config.json
```

```json
{
  "platforms": {
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID"
    }
  }
}
```

## Architecture

```
User sends msg via IM (Telegram/Feishu/Discord)
  → cc-connect forwards to Claude Code
  → Claude Code generates A2UI spec
  → POST to Claw2UI API
  → Claw2UI renders with selected theme
  → Serves via tunnel or cloud URL
  → User clicks URL → interactive dashboard
```

## Claude Code Skill

Claw2UI includes a skill definition for [Claude Code](https://docs.anthropic.com/en/docs/claude-code):

```bash
mkdir -p ~/.claude/skills/claw2ui

# If installed globally via npm:
cp "$(npm root -g)/claw2ui/skill/SKILL.md" ~/.claude/skills/claw2ui/SKILL.md

# Or if cloned from source:
cp /path/to/claw2ui/skill/SKILL.md ~/.claude/skills/claw2ui/SKILL.md
```

## Development

```bash
git clone https://github.com/0xsegfaulted/claw2ui.git
cd claw2ui
npm install
npm run build    # Compile TypeScript
npm run dev      # Watch mode
npm start        # Start server
npm test         # Run tests
```

### Adding Themes

1. Create `src/themes/<name>.ts` implementing the `Theme` interface
2. Register in `src/themes/index.ts`

### Adding Platforms

1. Create `src/platforms/<name>.ts` with `formatMessage()` and `formatRawMessage()`
2. Register in `src/platforms/index.ts`

### Adding Components

1. Create a render function in your theme's component registry
2. Register with `registry.register('my-component', renderFn)`

## License

[MIT](./LICENSE)
