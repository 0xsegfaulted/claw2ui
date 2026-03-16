---
name: claw2ui
description: 'Generate interactive web pages (dashboards, charts, tables, reports) and serve them via public URL. Use this skill when the user explicitly asks for data visualization, dashboards, analytics reports, comparison tables, status pages, or web-based content. Also triggers for: "draw me a chart", "make a dashboard", "show me a table", "generate a report", "visualize this data", "render this as a page", "publish a page", "claw2ui". If the response would benefit from charts, sortable tables, or rich layout, suggest using Claw2UI and wait for user confirmation before publishing.'
license: MIT
metadata:
  openclaw:
    emoji: "📊"
    requires:
      bins:
        - node
        - claw2ui
      optionalBins:
        - cloudflared
      env:
        - name: CLAWBOARD_TUNNEL_NAME
          required: false
          description: "Cloudflare named tunnel ID (only for fixed-domain setup)"
        - name: CLAWBOARD_TUNNEL_URL
          required: false
          description: "Public URL for named tunnel (e.g. https://board.yourdomain.com)"
    install:
      - id: claw2ui-npm
        kind: npm
        package: claw2ui
        bins: ["claw2ui"]
        label: "Install Claw2UI CLI (npm install -g claw2ui)"
        verify: "https://github.com/0xsegfaulted/claw2ui"
      - id: cloudflared-brew
        kind: brew
        formula: cloudflared
        bins: ["cloudflared"]
        label: "Install cloudflared (optional, for fixed-domain tunnels)"
---

# Claw2UI - Agent-to-UI Bridge

Generate interactive web pages from declarative JSON specs and serve them via cloudflared tunnel. Pages include Tailwind CSS, Alpine.js, and Chart.js out of the box.

> **Source & verification**: [GitHub](https://github.com/0xsegfaulted/claw2ui) · [npm](https://www.npmjs.com/package/claw2ui) · License: MIT

## Data Safety

**Every published page is accessible via a public URL.** Follow these rules:

- **Never include** secrets, credentials, API keys, tokens, PII, or internal endpoints in page content
- **Sanitize** all user-provided data before embedding it in pages — the `html` component is sanitized server-side, but avoid passing raw untrusted input to other components
- **Always confirm with the user** before publishing. Do not publish pages without explicit user approval
- **Use TTL** for ephemeral or sensitive data so pages auto-expire: `--ttl 3600000` (1 hour)
- **Review content** before publishing — check that no sensitive information leaks through table rows, stat values, or chart labels

## Setup

Claw2UI supports two modes: **remote** (connect to an existing server) and **local** (run your own server).

### Remote Mode (Recommended for most users)

Connect to a shared Claw2UI server. No tunnel or server setup needed.

```bash
npm install -g claw2ui
claw2ui register --server https://board.claw2ui.win
# Done! Token saved to ~/.claw2ui.json automatically.
```

If you received a token manually from the server admin:

```bash
claw2ui init --server https://board.claw2ui.win --token <your-token>
```

### Local Mode (Run your own server)

Clone the repo or install globally, then start the server:

```bash
claw2ui status                          # Check if server is running
claw2ui start                           # Start server + tunnel
claw2ui start --no-tunnel               # Start without tunnel (localhost only)
```

#### Fixed Domain (Named Tunnel)

For a permanent URL instead of random quick tunnels. **Requires**: Cloudflare account + `cloudflared`.

```bash
# One-time setup:
# cloudflared tunnel login
# cloudflared tunnel create claw2ui
# cloudflared tunnel route dns claw2ui board.yourdomain.com

export CLAWBOARD_TUNNEL_NAME=claw2ui
export CLAWBOARD_TUNNEL_URL=https://board.yourdomain.com
claw2ui start
```

#### Server Admin: Token Management

Generate tokens for other users to connect to your server:

```bash
claw2ui token create                    # Generate a new token (run from project dir)
claw2ui token list                      # List all config tokens
claw2ui token revoke <token>            # Remove a config token
```

Registered tokens (from `/api/register`) can be managed via the admin API:

```bash
# List registered tokens (requires admin token)
curl -H "Authorization: Bearer <admin-token>" https://board.example.com/api/tokens

# Revoke by short ID
curl -X POST -H "Authorization: Bearer <admin-token>" https://board.example.com/api/tokens/<id>/revoke
```

## CLI Tool

All operations go through the `claw2ui` CLI. Install via `npm install -g claw2ui` ([npm registry](https://www.npmjs.com/package/claw2ui)).

### Commands

```bash
# Connection (remote users)
claw2ui register --server <url>         # Self-service registration with a remote server
claw2ui init --server <url> --token <t> # Manual remote server config

# Publish a page
claw2ui publish --spec-file /tmp/page.json --title "Dashboard"
claw2ui publish --html "<h1>Hello</h1>" --title "Test"
claw2ui publish --ttl 3600000 --spec-file /tmp/page.json --title "Temp"     # With TTL (ms)

# Manage pages (admin/privileged only)
claw2ui list                            # List all pages
claw2ui delete <page-id>                # Delete a page

# Server lifecycle (local mode only)
claw2ui status                          # Check if server is running
claw2ui start                           # Start server + tunnel

# Token management (server admin only, run from project dir)
claw2ui token create                    # Generate a new config token
claw2ui token list                      # List config tokens
claw2ui token revoke <token>            # Remove a config token
```

## Workflow

### Step 1: Ensure Connection

```bash
# Remote: register once (token saved to ~/.claw2ui.json)
claw2ui register --server https://board.claw2ui.win

# Local: ensure server is running
claw2ui status
# If not running:
claw2ui start
```

### Step 2: Build the A2UI Spec

Write the spec to a temp file. Always wrap content in a `container`.

```bash
cat > /tmp/claw2ui_page.json << 'SPECEOF'
{
  "title": "Page Title",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Title", "subtitle": "Description" } },
      ...more components...
    ]}
  ]
}
SPECEOF
```

### Step 3: Confirm with User

Before publishing, tell the user what will be published and confirm they want to proceed. The page will be accessible via a **public URL**. Example:

> "I've prepared a dashboard with [summary of content]. Ready to publish it to a public URL? (Use `--ttl 3600000` for auto-expiry in 1 hour.)"

### Step 4: Publish

Only after user confirmation:

```bash
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Dashboard"
# For sensitive/temporary data, always set a TTL:
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Dashboard" --ttl 3600000
```

Outputs the public URL.

### Step 5: Share the URL

Include the URL in your response to the user.

## Available Components

### Layout
- `container` - Always use as the outermost wrapper. Centers content with max-width.
- `row` - Grid row. Props: `cols` (number of columns, e.g. 3), `gap` (spacing)
- `column` - Grid column. Props: `span` (how many columns to occupy)
- `card` - Card with border/shadow. Props: `title`, `subtitle`
- `tabs` - Tabbed sections. Props: `tabs: [{ id: "t1", label: "Tab 1", children: [...] }]`
- `accordion` - Collapsible sections. Props: `items: [{ title: "Section", children: [...] }]`
- `list` - Flex list. Props: `direction` (vertical/horizontal), `gap`, `align`
- `modal` - Dialog popup. Props: `title`. First child = trigger button, rest = content.

### Data Display
- `stat` - KPI metric card. Props: `label`, `value`, `change` (percent, positive = green), `icon` (emoji)
  - Great for key metrics at the top of a dashboard
  - Put 3-4 stats in a `row` with `cols: 3` or `cols: 4`

- `table` - Searchable, sortable table. Props:
  - `columns: [{ key: "name", label: "Name", format?: "currency"|"percent"|"badge" }]`
  - `rows: [{ name: "value", ... }]`
  - For badge format, add `badgeMap: { "Active": "success", "Down": "error" }`

- `chart` - Chart.js chart. Props:
  - `chartType`: `"line"`, `"bar"`, `"pie"`, `"doughnut"`, `"radar"`
  - `height`: pixels (default 300)
  - `data`: standard Chart.js data format:
    ```json
    {
      "labels": ["Jan", "Feb", "Mar"],
      "datasets": [{
        "label": "Revenue",
        "data": [100, 200, 150],
        "borderColor": "#3b82f6",
        "backgroundColor": "rgba(59, 130, 246, 0.1)",
        "tension": 0.3,
        "fill": true
      }]
    }
    ```

### Input
- `button` - Props: `label`, `variant` (`"primary"`, `"secondary"`, `"danger"`, `"outline"`)
- `text-field` - Props: `label`, `placeholder`, `value`
- `select` - Props: `label`, `options: [{ value: "a", label: "Option A" }]`
- `checkbox` - Props: `label`, `value` (boolean)
- `choice-picker` - Single/multi select. Props: `label`, `options: [{value, label}]`, `value: [selected]`, `variant` (mutuallyExclusive/multipleSelection), `displayStyle` (checkbox/chips)
- `slider` - Range slider. Props: `label`, `min`, `max`, `value`
- `date-time-input` - Date/time picker. Props: `label`, `value` (ISO 8601), `enableDate`, `enableTime`, `min`, `max`

### Media & Text
- `icon` - Material Icon. Props: `name` (e.g. "settings", "search"), `size` (px)
- `text` - Text paragraph. Props: `content`, `size` (`"sm"`, `"base"`, `"lg"`, `"xl"`), `bold` (boolean)
- `code` - Code block. Props: `content`, `language`
- `html` - Raw HTML (sanitized). Props: `content`
- `image` - Props: `src`, `alt`
- `video` - Video player. Props: `url`, `poster`
- `audio-player` - Audio player. Props: `url`, `description`
- `divider` - Horizontal line
- `spacer` - Vertical space. Props: `size` (Tailwind spacing units, e.g. 4)

### Navigation
- `header` - Page header. Props: `title`, `subtitle`
- `link` - Hyperlink. Props: `href`, `label`

## Design Patterns

### Dashboard Layout
```
container
  header (title + subtitle)
  row cols=3
    stat (metric 1)
    stat (metric 2)
    stat (metric 3)
  card (title: "Trend")
    chart (line chart)
  card (title: "Details")
    table (data table)
```

### Report Layout
```
container
  header
  text (summary paragraph)
  tabs
    tab "Overview"
      row cols=2
        stat, stat
      chart
    tab "Details"
      table
    tab "Analysis"
      text (analysis content)
```

### Comparison Layout
```
container
  header
  row cols=2
    card "Option A"
      stat, stat, text
    card "Option B"
      stat, stat, text
  table (detailed comparison)
```

## Example: Complete Dashboard

```json
{
  "title": "Sales Dashboard",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Sales Dashboard", "subtitle": "Q1 2026 Overview" } },
      { "type": "row", "props": { "cols": 3, "gap": 4 }, "children": [
        { "type": "stat", "props": { "label": "Revenue", "value": "$1.2M", "change": 15.3, "icon": "💰" } },
        { "type": "stat", "props": { "label": "Orders", "value": "8,432", "change": 8.1, "icon": "📦" } },
        { "type": "stat", "props": { "label": "Customers", "value": "2,847", "change": -2.5, "icon": "👥" } }
      ]},
      { "type": "card", "props": { "title": "Revenue Trend" }, "children": [
        { "type": "chart", "props": {
          "chartType": "line", "height": 280,
          "data": {
            "labels": ["Jan", "Feb", "Mar"],
            "datasets": [{ "label": "Revenue", "data": [320000, 410000, 480000], "borderColor": "#3b82f6", "tension": 0.3, "fill": false }]
          }
        }}
      ]},
      { "type": "card", "props": { "title": "Top Products" }, "children": [
        { "type": "table", "props": {
          "columns": [
            { "key": "product", "label": "Product" },
            { "key": "revenue", "label": "Revenue", "format": "currency" },
            { "key": "status", "label": "Status", "format": "badge", "badgeMap": { "Active": "success", "Low Stock": "warning" } }
          ],
          "rows": [
            { "product": "Widget Pro", "revenue": 450000, "status": "Active" },
            { "product": "Gadget X", "revenue": 320000, "status": "Low Stock" }
          ]
        }}
      ]}
    ]}
  ]
}
```
