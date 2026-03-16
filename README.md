# ClawBoard

Agent-to-UI bridge: let AI agents generate interactive web pages and serve them via a public URL.

ClawBoard takes a declarative JSON spec (or raw HTML) and renders it into a fully interactive page with Tailwind CSS, Alpine.js, and Chart.js — accessible anywhere through a Cloudflare Tunnel.

## Features

- **30+ UI components** — stats, charts, tables, tabs, modals, forms, and more
- **Zero-config tunneling** — automatic Cloudflare quick tunnel, or bring your own domain
- **Platform formatting** — API returns platform-specific summaries (Telegram, etc.) for agent delivery
- **Dark mode** — auto-detects system preference
- **CLI & API** — publish pages from scripts, agents, or any HTTP client
- **File-based storage** — no database needed
- **TTL support** — pages auto-expire after a set duration

## Quick Start

```bash
# Install globally
npm install -g clawboard

# Start the server (opens a tunnel automatically)
clawboard start

# Publish a page from a JSON spec
clawboard publish --spec-file dashboard.json --title "My Dashboard"
# → https://random-words.trycloudflare.com/p/abc123
```

## Installation

```bash
npm install -g clawboard
```

**Optional**: Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) for public tunnel access:

```bash
# macOS
brew install cloudflared

# Linux
# See https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

Without cloudflared, ClawBoard falls back to [localtunnel](https://github.com/localtunnel/localtunnel) or localhost-only mode.

## Usage

### CLI Commands

```bash
clawboard start                    # Start server + tunnel
clawboard status                   # Check server status
clawboard publish --spec-file <file> --title "Title"  # Publish from spec
clawboard publish --html "<h1>Hi</h1>" --title "Test" # Publish raw HTML
clawboard list                     # List all pages
clawboard delete <page-id>         # Delete a page
```

### Publish Options

| Flag | Description |
|------|-------------|
| `--spec-file <path>` | A2UI component spec (JSON file) |
| `--spec <json>` | Inline JSON spec |
| `--html <html>` | Raw HTML content |
| `--file <path>` | Read HTML from file |
| `--title <title>` | Page title |
| `--ttl <ms>` | Time-to-live in milliseconds (0 = forever) |

### API

ClawBoard runs on `http://localhost:9800` by default.

```bash
# Create a page
curl -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","components":[{"type":"container","children":[{"type":"header","props":{"title":"Hello World"}}]}]}'

# List pages
curl http://localhost:9800/api/pages

# Server status
curl http://localhost:9800/api/status
```

## Component Spec (A2UI)

Pages are described as a JSON tree of components:

```json
{
  "title": "Sales Dashboard",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Sales Dashboard", "subtitle": "Q1 2026" } },
      { "type": "row", "props": { "cols": 3 }, "children": [
        { "type": "stat", "props": { "label": "Revenue", "value": "$1.2M", "change": 15.3 } },
        { "type": "stat", "props": { "label": "Orders", "value": "8,432", "change": 8.1 } },
        { "type": "stat", "props": { "label": "Customers", "value": "2,847", "change": -2.5 } }
      ]},
      { "type": "card", "props": { "title": "Revenue Trend" }, "children": [
        { "type": "chart", "props": {
          "chartType": "line",
          "data": {
            "labels": ["Jan", "Feb", "Mar"],
            "datasets": [{ "label": "Revenue", "data": [320000, 410000, 480000], "borderColor": "#3b82f6" }]
          }
        }}
      ]}
    ]}
  ]
}
```

### Available Components

**Layout**: `container`, `row`, `column`, `card`, `tabs`, `accordion`, `list`, `modal`

**Data Display**: `stat`, `table`, `chart` (line, bar, pie, doughnut, radar)

**Input**: `button`, `text-field`, `select`, `checkbox`, `choice-picker`, `slider`, `date-time-input`

**Media**: `icon`, `image`, `video`, `audio-player`, `text`, `code`, `html`, `divider`, `spacer`

**Navigation**: `header`, `link`

See [CLAUDE.md](./CLAUDE.md) for full component documentation with all props.

## Configuration

### Platform Delivery (Telegram)

Copy the example config and fill in your values:

```bash
cp clawboard.config.example.json clawboard.config.json
```

```json
{
  "platforms": {
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID",
      "proxy": ""
    }
  }
}
```

Or use environment variables:

```bash
export CLAWBOARD_TG_BOT_TOKEN="your-bot-token"
export CLAWBOARD_TG_CHAT_ID="your-chat-id"
```

### Fixed Domain (Named Tunnel)

For a permanent URL instead of random quick tunnel URLs:

```bash
cloudflared tunnel login
cloudflared tunnel create clawboard
cloudflared tunnel route dns clawboard board.yourdomain.com

export CLAWBOARD_TUNNEL_NAME=clawboard
export CLAWBOARD_TUNNEL_URL=https://board.yourdomain.com
clawboard start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAWBOARD_PORT` | `9800` | Server port |
| `CLAWBOARD_TOKEN` | auto-generated | API bearer token |
| `CLAWBOARD_NO_TUNNEL` | `0` | Set to `1` to skip tunnel |
| `CLAWBOARD_TUNNEL_NAME` | — | Cloudflare named tunnel |
| `CLAWBOARD_TUNNEL_URL` | — | Fixed public URL for named tunnel |
| `CLAWBOARD_TG_BOT_TOKEN` | — | Telegram bot token |
| `CLAWBOARD_TG_CHAT_ID` | — | Telegram chat ID |
| `CLAWBOARD_TG_PROXY` | — | HTTPS proxy for Telegram API |

## Claude Code Skill

ClawBoard includes a skill definition for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). To install:

```bash
mkdir -p ~/.claude/skills/clawboard

# If installed globally via npm:
cp "$(npm root -g)/clawboard/skill/SKILL.md" ~/.claude/skills/clawboard/SKILL.md

# Or if cloned from source:
cp /path/to/clawboard/skill/SKILL.md ~/.claude/skills/clawboard/SKILL.md
```

## Adding New Platforms

1. Create `src/platforms/<name>.ts` with `formatMessage()` and `formatRawMessage()` functions
2. Register in `src/platforms/index.ts`

## Development

```bash
git clone https://github.com/0xsegfaulted/clawboard.git
cd clawboard
npm install
npm run build    # Compile TypeScript
npm run dev      # Watch mode
npm start        # Start server
```

## License

[MIT](./LICENSE)
