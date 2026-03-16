# Claw2UI - Agent-to-UI Bridge

Claw2UI lets you generate interactive web pages (dashboards, charts, tables, forms) and serve them via a public URL through Cloudflare Tunnel. When a user asks for something better expressed as a visual UI rather than text, use Claw2UI to render it and send the URL.

## Architecture

```
User sends msg via IM (Telegram/Feishu/Discord)
  → cc-connect forwards to Claude Code
  → Claude Code generates A2UI spec or HTML
  → Posts to Claw2UI API (localhost:9800)
  → Claw2UI renders & serves via cloudflared tunnel
  → Claude Code sends public URL back via IM
  → User clicks URL → sees interactive dashboard
```

## Quick Start

The Claw2UI server must be running. Check and start if needed:
```bash
# Check if running
curl -s http://localhost:9800/api/status

# If not running, start:
bash start.sh
# OR
npm start
```

## How to Publish Pages

### CLI (recommended)
```bash
# From spec file
claw2ui publish --spec-file /tmp/page.json --title "Dashboard"

# Raw HTML
claw2ui publish --html "<h1>Hello</h1>" --title "Test"

# With TTL (auto-expire)
claw2ui publish --spec-file /tmp/page.json --title "Temp" --ttl 3600000

# Manage pages
claw2ui list
claw2ui delete <page-id>
claw2ui status
```

### API
```bash
# Publish spec
URL=$(curl -s -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d @/tmp/claw2ui_page.json | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")

# Publish raw HTML
URL=$(curl -s -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello</h1>","title":"Test"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
```

Raw HTML fragments are automatically wrapped with Tailwind CSS, Alpine.js, and Chart.js.

The API response includes `formats` with platform-specific summaries (e.g. `formats.telegram`) that the agent can use when sending messages.

## A2UI Component Spec Format

```json
{
  "title": "Page Title",
  "theme": "auto",
  "components": [
    { "type": "container", "children": [...] }
  ]
}
```

### Available Components

**Layout:**
- `container` - Max-width centered container
- `row` - Grid row. Props: `cols` (grid columns), `gap`
- `column` - Grid column. Props: `span`
- `card` - Card with border/shadow. Props: `title`, `subtitle`
- `tabs` - Tabbed content. Props: `tabs: [{ id, label, children }]`
- `accordion` - Collapsible sections. Props: `items: [{ title, children }]`
- `list` - Flex list. Props: `direction` (vertical/horizontal), `gap`, `align`
- `modal` - Dialog popup. Props: `title`. First child = trigger, rest = content

**Data Display:**
- `stat` - KPI card. Props: `label`, `value`, `change` (%), `icon`
- `table` - Searchable/sortable table. Props: `columns: [{ key, label, format }]`, `rows: [{}]`
  - Column formats: `currency`, `percent`, `badge`
  - Badge: add `badgeMap: { value: "success"|"warning"|"error"|"info" }`
- `chart` - Chart.js chart. Props: `chartType` (line/bar/pie/doughnut/radar), `data`, `height`

**Input:**
- `button` - Props: `label`, `variant` (primary/secondary/danger/outline)
- `text-field` - Props: `label`, `placeholder`, `value`
- `select` - Props: `label`, `options: [{ value, label }]`
- `checkbox` - Props: `label`, `value` (boolean)
- `choice-picker` - Single/multi select. Props: `label`, `options: [{value, label}]`, `value: [selected]`, `variant` (mutuallyExclusive/multipleSelection), `displayStyle` (checkbox/chips)
- `slider` - Range slider. Props: `label`, `min`, `max`, `value`
- `date-time-input` - Date/time picker. Props: `label`, `value` (ISO 8601), `enableDate`, `enableTime`, `min`, `max`

**Media:**
- `icon` - Material Icon. Props: `name` (e.g. "settings", "search", "delete"), `size` (px)
- `text` - Props: `content`, `size`, `bold`
- `code` - Props: `content`, `language`
- `html` - Raw HTML. Props: `content`
- `image` - Props: `src`, `alt`
- `video` - Video player. Props: `url`, `poster`
- `audio-player` - Audio player. Props: `url`, `description`
- `divider`, `spacer`

**Navigation:**
- `header` - Props: `title`, `subtitle`
- `link` - Props: `href`, `label`

### Fixed Domain (Named Tunnel)

To use a permanent URL instead of random quick tunnel URLs:

1. Set up Cloudflare: `cloudflared tunnel login` → `cloudflared tunnel create claw2ui` → `cloudflared tunnel route dns claw2ui board.yourdomain.com`
2. Configure env vars before starting:
```bash
export CLAWBOARD_TUNNEL_NAME=claw2ui
export CLAWBOARD_TUNNEL_URL=https://board.yourdomain.com
bash start.sh
```

Or add to your shell profile for persistence. The server will use the named tunnel instead of a random quick tunnel.

## When to Use Claw2UI

Use Claw2UI when the user asks for:
- Dashboards, analytics, or data visualization
- Tables with lots of data
- Charts (line, bar, pie, etc.)
- Reports with visual layout
- Any content where a web page is better than plain text

Include the URL in your response text. The API also returns platform-specific formatted summaries in `response.formats` that you can use for richer IM messages.

## Example: Full Dashboard

See `templates/dashboard.json` and `templates/analytics.json` for full examples.
