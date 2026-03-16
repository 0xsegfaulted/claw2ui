---
name: claw2ui
description: 'Generate interactive web pages (dashboards, charts, tables, reports) and serve them via public URL. Use this skill whenever the user asks for data visualization, dashboards, analytics reports, comparison tables, status pages, or ANY content that would be better presented as a web page than plain text. Also triggers for: "draw me a chart", "make a dashboard", "show me a table", "generate a report", "visualize this data", "render this as a page", "publish a page", "claw2ui". Even if the user doesn''t explicitly ask for a web page, if the response would benefit from charts, sortable tables, or rich layout, use Claw2UI proactively.'
---

# Claw2UI - Agent-to-UI Bridge

Generate interactive web pages from declarative JSON specs and serve them via cloudflared tunnel. Pages include Tailwind CSS, Alpine.js, and Chart.js out of the box.

## Project Location

> **IMPORTANT**: Update the path below to match your Claw2UI installation.

```
# If installed globally via npm:
# Run `npm root -g` to find the path, then append /claw2ui
# Example: /usr/local/lib/node_modules/claw2ui

# If cloned from source:
# Use the path where you cloned the repo
# Example: /home/user/projects/claw2ui

CLAWBOARD_DIR="<YOUR_CLAWBOARD_PATH>"
```

## CLI Tool

All operations go through the `claw2ui` CLI. Run from anywhere after `npm install -g claw2ui`.

### Commands

```bash
# Server lifecycle
claw2ui status                          # Check if server is running
claw2ui start                           # Start server + tunnel
claw2ui start --no-tunnel               # Start without tunnel (localhost only)

# Publish a page
claw2ui publish --spec-file /tmp/page.json --title "Dashboard"
claw2ui publish --html "<h1>Hello</h1>" --title "Test"
claw2ui publish --ttl 3600000 --spec-file /tmp/page.json --title "Temp"     # With TTL (ms)

# Manage pages
claw2ui list                            # List all pages
claw2ui delete <page-id>                # Delete a page
```

### Fixed Domain (Named Tunnel)

If you have a Cloudflare domain configured:

```bash
export CLAWBOARD_TUNNEL_NAME=claw2ui
export CLAWBOARD_TUNNEL_URL=https://board.yourdomain.com
claw2ui start
```

This gives a permanent URL that never changes across restarts.

## Workflow

### Step 1: Ensure Server is Running

```bash
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

### Step 3: Publish

```bash
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Dashboard"
```

Outputs the public URL.

### Step 4: Share the URL

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
