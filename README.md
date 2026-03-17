# Claw2UI

Agent-to-UI bridge: let AI agents generate interactive web pages and serve them via a public URL.

Claw2UI takes a declarative JSON spec (or raw HTML) and renders it into a fully interactive page — accessible anywhere through a Cloudflare Tunnel or cloud deployment.

**[Live Demo](https://0xsegfaulted-claw2ui.hf.space)** · **[npm](https://www.npmjs.com/package/claw2ui)** · **[HF Space](https://huggingface.co/spaces/0xsegfaulted/claw2ui)**

## Features

- **TypeScript DSL** — type-checked page specs with loops, conditionals, and auto-completion
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

# Register with the public server (one-time)
claw2ui register --server https://0xsegfaulted-claw2ui.hf.space

# Publish a page from a TypeScript DSL spec (recommended)
claw2ui publish --spec-file dashboard.ts --title "My Dashboard"
# → https://0xsegfaulted-claw2ui.hf.space/p/abc123

# Or from JSON spec
claw2ui publish --spec-file dashboard.json --title "My Dashboard"

# Use a specific theme
claw2ui publish --spec-file report.ts --title "Report" --style classic

# Self-host: start your own server (opens a tunnel automatically)
claw2ui start
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
claw2ui publish --spec-file <file.ts> --title "Title"  # Publish from TS DSL (type-checked)
claw2ui publish --spec-file <file.json> --title "Title" # Publish from JSON spec
claw2ui publish --spec-file <file.ts> --no-check        # Skip type checking
claw2ui publish --html "<h1>Hi</h1>" --title "Test"     # Publish raw HTML
claw2ui publish --spec-file <file> --style classic       # Use specific theme
claw2ui list                     # List all pages
claw2ui delete <page-id>         # Delete a page
claw2ui register                 # Self-service token registration (remote server)
claw2ui token list               # Admin: list registered tokens
claw2ui token revoke <id>        # Admin: revoke a token
```

### Publish Options

| Flag | Description |
|------|-------------|
| `--spec-file <path>` | A2UI component spec (`.ts` DSL or `.json`) |
| `--no-check` | Skip type checking for `.ts` DSL files |
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

## TypeScript DSL (Recommended)

Write `.ts` files instead of JSON — type-checked, ~60% fewer tokens, and supports loops/conditionals.

```typescript
import { page, container, header, row, stat, card, chart, table, col, badge, dataset, months } from "claw2ui/dsl"

export default page("Sales Dashboard", [
  container(
    header("Sales Dashboard", "Q1 2026"),
    row(3,
      stat("Revenue", "$1.2M", { change: 15.3, icon: "payments" }),
      stat("Orders", "8,432", { change: 8.1, icon: "shopping_cart" }),
      stat("Customers", "2,847", { change: -2.5, icon: "group" }),
    ),
    card("Revenue Trend",
      chart("line", {
        labels: months(6),
        datasets: [dataset("Revenue", [320, 410, 380, 450, 480, 520], {
          borderColor: "#3b82f6", tension: 0.3, fill: true,
        })],
      }, { height: 280 }),
    ),
    card("Top Products",
      table(
        [col("name", "Name"), col("rev", "Revenue", "currency"),
         badge("status", "Status", { Active: "success", "Low Stock": "warning" })],
        [
          { name: "Widget Pro", rev: 450000, status: "Active" },
          { name: "Gadget X", rev: 320000, status: "Low Stock" },
        ],
      ),
    ),
  ),
], { style: "anthropic" })
```

### DSL supports logic

```typescript
// Loops — generate stats from data
const services = ["nginx", "postgres", "redis"]
row(3, ...services.map(s => stat(s, "Running")))

// Conditionals
container(
  header("Report"),
  data.length > 0 ? card("Trend", chart("line", chartData)) : text("No data"),
)
```

### DSL Function Reference

**Page**: `page(title, components[], opts?)` — opts: `{ theme?, style? }`

**Layout**: `container(...)`, `row(cols, ...)`, `column(span, ...)`, `card(title, ...)`, `list(dir, ...)`, `modal(title, ...)`

**Special**: `tabs(tab("id","Label",...), ...)`, `accordion(section("Title",...), ...)`

**Data**: `stat(label, value, opts?)`, `chart(type, data, opts?)`, `table(columns, rows, opts?)`

**Helpers**: `dataset(label, data[], opts?)`, `col(key, label?, format?)`, `badge(key, label, map)`, `months(n)`

**Input**: `button`, `textField`, `select`, `checkbox`, `choicePicker`, `slider`, `dateTimeInput`

**Media**: `markdown`, `text`, `code`, `html`, `icon`, `image`, `video`, `audioPlayer`, `divider`, `spacer`

**Navigation**: `header(title, subtitle?)`, `link(href, label?, target?)`

## Component Spec (JSON)

JSON specs are still supported. Pages are described as a JSON tree of components:

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

Claw2UI includes a `Dockerfile` for cloud deployment (e.g. Hugging Face Spaces). Free tier sleeps after 48h idle and auto-wakes on visit.

```bash
# Install HF CLI
pip install huggingface_hub[cli]
hf auth login

# Create a Docker Space
hf repos create yourname/claw2ui --type space --space-sdk docker

# Prepare deploy directory (only the files Docker needs)
mkdir -p /tmp/claw2ui-deploy
cp package.json package-lock.json tsconfig.json Dockerfile /tmp/claw2ui-deploy/
cp -r src bin templates /tmp/claw2ui-deploy/

# Add HF Space README (required)
cat > /tmp/claw2ui-deploy/README.md << 'EOF'
---
title: Claw2UI
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---
EOF

# Upload
hf upload yourname/claw2ui /tmp/claw2ui-deploy . --type space
```

Set these **Secrets** in your Space settings (Settings -> Variables and secrets):

| Secret | Required | Value |
|--------|----------|-------|
| `CLAWBOARD_TOKEN` | Yes | Admin token (`python3 -c "import secrets; print(secrets.token_hex(32))"`) |
| `CLAWBOARD_PUBLIC_URL` | Yes | `https://yourname-claw2ui.hf.space` |
| `HF_TOKEN` | Optional | HF token with write access (for backup) |
| `CLAWBOARD_BACKUP_REPO` | Optional | `yourname/claw2ui-data` (private dataset for persistence) |

The Dockerfile sets `CLAWBOARD_BIND=0.0.0.0`, `CLAWBOARD_PORT=7860`, `CLAWBOARD_TRUST_PROXY=1` automatically. With backup configured, pages and tokens persist across Space restarts.

> **Important**: Pages are rendered at publish time. Deploying new code only affects future publishes — existing pages keep their original HTML.

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
