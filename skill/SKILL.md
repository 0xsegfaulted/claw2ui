---
name: claw2ui
description: 'Generate interactive web pages (dashboards, charts, tables, reports) and serve them via public URL. Use this skill when the user explicitly asks for data visualization, dashboards, analytics reports, comparison tables, status pages, or web-based content. Also triggers for: "draw me a chart", "make a dashboard", "show me a table", "generate a report", "visualize this data", "render this as a page", "publish a page", "claw2ui". If the response would benefit from charts, sortable tables, or rich layout, **suggest** using Claw2UI and wait for user confirmation before publishing. Chinese triggers: "做个仪表盘", "画个图表", "做个报表", "生成一个页面", "做个dashboard", "数据可视化", "做个网页", "展示数据", "做个表格", "做个图", "发布一个页面", "做个看板". Additional English triggers: "create a webpage", "show analytics", "build a status page", "make a chart", "data overview", "show me stats", "create a board", "render a page", "comparison chart", "trend analysis", "pie chart", "bar chart", "line chart", "KPI dashboard", "metrics overview", "weekly report", "monthly report".'
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
        label: "Install cloudflared (optional, for self-hosted tunnels)"
    sideEffects:
      - "Writes ~/.claw2ui.json (server URL and API token for authentication)"
      - "Publishes page content to a public URL (default: https://0xsegfaulted-claw2ui.hf.space)"
      - "Requires explicit user confirmation before every publish"
    permissions:
      - "network: POST page content to Claw2UI server API"
      - "filesystem: write ~/.claw2ui.json (auth token), /tmp/*.json (temp spec files)"
---

# Claw2UI - Agent-to-UI Bridge

Generate interactive web pages from declarative JSON specs and serve them via a public URL. Pages include Tailwind CSS, Alpine.js, and Chart.js out of the box, with pluggable themes and mobile-responsive layouts.

> **Source**: [GitHub](https://github.com/0xsegfaulted/claw2ui) · [npm](https://www.npmjs.com/package/claw2ui) · [HF Space](https://huggingface.co/spaces/0xsegfaulted/claw2ui) · License: MIT

## Data Safety & User Confirmation

**Every published page is accessible via a public URL. Never publish without explicit user approval.**

- **Always confirm with the user** before publishing — describe what will be published and wait for explicit "yes"/"go ahead". Silent publishing is never acceptable
- **Never include** secrets, credentials, API keys, tokens, PII, or internal endpoints in page content
- **Sanitize** all user-provided data before embedding — the `html` component is sanitized server-side, but avoid passing raw untrusted input to other components
- **Use TTL** for ephemeral or sensitive data so pages auto-expire: `--ttl 3600000` (1 hour)
- **Review content** before publishing — check that no sensitive information leaks through table rows, stat values, or chart labels

## Setup

Claw2UI uses the public server at `https://0xsegfaulted-claw2ui.hf.space` by default. No local server needed.

```bash
npm install -g claw2ui
claw2ui register --server https://0xsegfaulted-claw2ui.hf.space
# Done! Token saved to ~/.claw2ui.json automatically.
```

> **Self-hosting**: To run your own Claw2UI server (local, Docker, or HF Space), see the [self-hosting guide](ref/self-hosting.md).

## Workflow

### Step 1: Ensure Connection

```bash
# Register once (token saved to ~/.claw2ui.json)
claw2ui register --server https://0xsegfaulted-claw2ui.hf.space
```

### Step 2: Build the A2UI Spec

Write a `.ts` DSL file (preferred) or JSON spec to a temp file. Always wrap content in a `container`.

**TypeScript DSL (preferred — fewer tokens, supports logic):**

```bash
cat > /tmp/claw2ui_page.ts << 'SPECEOF'
import { page, container, header, row, stat, card, chart, table, col, badge, dataset } from "claw2ui/dsl"

export default page("Page Title", [
  container(
    header("Title", "Description"),
    row(3,
      stat("Metric 1", "100", { change: 5.2, icon: "trending_up" }),
      stat("Metric 2", "200"),
      stat("Metric 3", "300"),
    ),
  ),
], { style: "anthropic" })
SPECEOF
```

**JSON spec:**

```bash
cat > /tmp/claw2ui_page.json << 'SPECEOF'
{
  "title": "Page Title",
  "style": "anthropic",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Title", "subtitle": "Description" } },
      ...more components...
    ]}
  ]
}
SPECEOF
```

#### Available Themes (`style` field)

| Theme | Description |
|-------|-------------|
| `anthropic` | **(default)** Warm editorial aesthetic — Newsreader serif headings, terracotta accents, cream backgrounds |
| `classic` | Original Tailwind look — blue accents, system fonts, gray surfaces |

Omit `style` to use the default (`anthropic`). Use `claw2ui themes` to list all available themes at runtime.

### Step 3: Confirm with User

Before publishing, tell the user what will be published and confirm they want to proceed. The page will be accessible via a **public URL**. Example:

> "I've prepared a dashboard with [summary of content]. Ready to publish it to a public URL? (Use `--ttl 3600000` for auto-expiry in 1 hour.)"

### Step 4: Publish

Only after user confirmation:

```bash
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Dashboard"
# For sensitive/temporary data, always set a TTL:
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Dashboard" --ttl 3600000
# With a specific theme:
claw2ui publish --spec-file /tmp/claw2ui_page.json --title "Report" --style anthropic
```

Outputs the public URL.

### Step 5: Share the URL

Include the URL in your response to the user.

## CLI Commands

```bash
# Connection
claw2ui register --server <url>         # Self-service registration
claw2ui init --server <url> --token <t> # Manual config

# Publish
claw2ui publish --spec-file <file.ts> --title "Title"    # From TS DSL (preferred)
claw2ui publish --spec-file <file.json> --title "Title"  # From JSON spec
claw2ui publish --html "<h1>Hi</h1>" --title "Test"      # Raw HTML
claw2ui publish --spec-file <file> --style anthropic     # With theme
claw2ui publish --spec-file <file> --ttl 3600000         # With TTL (ms)

# Themes
claw2ui themes                          # List available themes

# Manage pages
claw2ui list                            # List all pages
claw2ui delete <page-id>               # Delete a page
claw2ui status                          # Check server status
```

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
- `stat` - KPI metric card. Props: `label`, `value`, `change` (percent, positive = green), `icon` (Material Icon name e.g. "payments", "group")
  - Great for key metrics at the top of a dashboard
  - Put 3-4 stats in a `row` with `cols: 3` or `cols: 4`

- `table` - Searchable, sortable table. Props:
  - `columns: [{ key: "name", label: "Name", format?: "currency"|"percent"|"badge" }]`
  - `rows: [{ name: "value", ... }]`
  - For badge format, add `badgeMap: { "Active": "success", "Down": "error" }`

- `chart` - Chart.js chart. Props:
  - `chartType`: `"line"`, `"bar"`, `"pie"`, `"doughnut"`, `"radar"`, `"polarArea"`, `"bubble"`, `"scatter"`
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
- `markdown` - Rich text with standard markdown syntax (headings, bold, lists, links, code blocks, etc.). Props: `content` (markdown string). Preferred for rich text content.
- `icon` - Material Icon. Props: `name` (e.g. "settings", "search"), `size` (px)
- `text` - Text paragraph. Props: `content`, `size` (`"sm"`, `"base"`, `"lg"`, `"xl"`), `bold` (boolean)
- `code` - Code block. Props: `content`, `language`
- `markdown` - Markdown content (sanitized). Props: `content`
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

### TypeScript DSL (preferred)

```typescript
import { page, container, header, row, stat, card, chart, table, col, badge, dataset } from "claw2ui/dsl"

export default page("Sales Dashboard", [
  container(
    header("Sales Dashboard", "Q1 2026 Overview"),
    row(3,
      stat("Revenue", "$1.2M", { change: 15.3, icon: "payments" }),
      stat("Orders", "8,432", { change: 8.1, icon: "shopping_cart" }),
      stat("Customers", "2,847", { change: -2.5, icon: "group" }),
    ),
    card("Revenue Trend",
      chart("line", {
        labels: ["Jan", "Feb", "Mar"],
        datasets: [dataset("Revenue", [320000, 410000, 480000], {
          borderColor: "#3b82f6", tension: 0.3,
        })],
      }, { height: 280 }),
    ),
    card("Top Products",
      table(
        [col("product", "Product"), col("revenue", "Revenue", "currency"),
         badge("status", "Status", { Active: "success", "Low Stock": "warning" })],
        [
          { product: "Widget Pro", revenue: 450000, status: "Active" },
          { product: "Gadget X", revenue: 320000, status: "Low Stock" },
        ],
      ),
    ),
  ),
], { style: "anthropic" })
```

### JSON spec

```json
{
  "title": "Sales Dashboard",
  "style": "anthropic",
  "components": [
    { "type": "container", "children": [
      { "type": "header", "props": { "title": "Sales Dashboard", "subtitle": "Q1 2026 Overview" } },
      { "type": "row", "props": { "cols": 3, "gap": 4 }, "children": [
        { "type": "stat", "props": { "label": "Revenue", "value": "$1.2M", "change": 15.3, "icon": "payments" } },
        { "type": "stat", "props": { "label": "Orders", "value": "8,432", "change": 8.1, "icon": "shopping_cart" } },
        { "type": "stat", "props": { "label": "Customers", "value": "2,847", "change": -2.5, "icon": "group" } }
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
