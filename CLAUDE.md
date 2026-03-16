# ClawBoard - Agent-to-UI Bridge

ClawBoard lets you generate interactive web pages (dashboards, charts, tables, forms) and serve them via a public URL through Cloudflare Tunnel. When a user asks for something better expressed as a visual UI rather than text, use ClawBoard to render it and send the URL.

## Architecture

```
User sends msg via IM (Telegram/Feishu/Discord)
  → cc-connect forwards to Claude Code
  → Claude Code generates A2UI spec or HTML
  → Posts to ClawBoard API (localhost:9800)
  → ClawBoard renders & serves via cloudflared tunnel
  → Claude Code sends public URL back via IM
  → User clicks URL → sees interactive dashboard
```

## Quick Start

The ClawBoard server must be running. Check and start if needed:
```bash
# Check if running
curl -s http://localhost:9800/api/status

# If not running, start:
bash start.sh
# OR
npm start
```

## How to Publish Pages

### Step 1: Write a spec file (recommended)
```bash
cat > /tmp/clawboard_page.json << 'SPECEOF'
{
  "title": "My Dashboard",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Dashboard", "subtitle": "Overview" } },
      { "type": "stat", "props": { "label": "Users", "value": "1,234", "change": 12.5 } }
    ]}
  ]
}
SPECEOF
```

### Step 2: Publish and get URL
```bash
URL=$(curl -s -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d @/tmp/clawboard_page.json | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "$URL"
```

### Alternative: Publish raw HTML
```bash
URL=$(curl -s -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d '{"html":"<div class=\"p-8\"><h1 class=\"text-3xl font-bold\">Hello</h1></div>","title":"Test"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
```

Raw HTML fragments are automatically wrapped with Tailwind CSS, Alpine.js, and Chart.js.

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

**Media:**
- `text` - Props: `content`, `size`, `bold`
- `code` - Props: `content`, `language`
- `html` - Raw HTML. Props: `content`
- `divider`, `spacer`

**Navigation:**
- `header` - Props: `title`, `subtitle`
- `link` - Props: `href`, `label`

## Platform Delivery (Rich IM Messages)

Instead of just sending a URL, ClawBoard can deliver rich formatted messages directly to IM platforms.

### Telegram Delivery (Auto)

Add `"deliver": { "platform": "telegram" }` to the create request to auto-send a formatted summary to Telegram with an "Open Dashboard" inline button:

```bash
curl -s -X POST http://localhost:9800/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Dashboard",
    "components": [...],
    "deliver": { "platform": "telegram" }
  }'
```

The Telegram message includes:
- Formatted title and subtitle
- Key metrics from `stat` components
- First rows from `table` components
- Inline keyboard button to open the full interactive page

### Deliver an Existing Page

```bash
curl -s -X POST http://localhost:9800/api/pages/<id>/deliver \
  -H "Content-Type: application/json" \
  -d '{ "platform": "telegram" }'
```

### Configuration

Config is auto-detected from cc-connect (`~/.cc-connect/config.toml`) and `CC_SESSION_KEY` env var.
Override via `clawboard.config.json`:
```json
{
  "platforms": {
    "telegram": {
      "botToken": "auto",
      "chatId": "YOUR_CHAT_ID",
      "proxy": "auto"
    }
  }
}
```

Or env vars: `CLAWBOARD_TG_BOT_TOKEN`, `CLAWBOARD_TG_CHAT_ID`, `CLAWBOARD_TG_PROXY`

### Adding New Platforms

To add Feishu, Discord, etc.:
1. Create `src/platforms/<name>.js` with `formatMessage()` and `deliver()`
2. Register in `src/platforms/index.js`
3. Add config in `src/config.js`

## When to Use ClawBoard

Use ClawBoard when the user asks for:
- Dashboards, analytics, or data visualization
- Tables with lots of data
- Charts (line, bar, pie, etc.)
- Reports with visual layout
- Any content where a web page is better than plain text

**For Telegram users**: Always use `deliver: { platform: "telegram" }` to send rich messages inline. The user sees a formatted summary immediately, with a button to open the full interactive dashboard.

**For other platforms**: Include the URL in your response text.

## Example: Full Dashboard

See `templates/dashboard.json` and `templates/analytics.json` for full examples.
