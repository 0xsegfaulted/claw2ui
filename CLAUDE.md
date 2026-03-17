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
# From TypeScript DSL (preferred — less tokens, supports logic)
claw2ui publish --spec-file /tmp/dashboard.ts --title "Dashboard"

# From JSON spec
claw2ui publish --spec-file /tmp/page.json --title "Dashboard"

# Raw HTML
claw2ui publish --html "<h1>Hello</h1>" --title "Test"

# With TTL (auto-expire)
claw2ui publish --spec-file /tmp/page.json --title "Temp" --ttl 3600000

# With a specific theme
claw2ui publish --spec-file /tmp/page.json --title "Report" --style anthropic

# List available themes
claw2ui themes

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
  "style": "anthropic",
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
- `markdown` - Rich text with standard markdown syntax. Props: `content` (markdown string). Preferred for rich text content.
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

Use Claw2UI when the user explicitly asks for:
- Dashboards, analytics, or data visualization
- Tables with lots of data
- Charts (line, bar, pie, etc.)
- Reports with visual layout
- Any content where a web page is better than plain text

If the user hasn't explicitly asked but the response would benefit from a web page, **suggest** it and wait for confirmation before publishing.

## Data Safety

**Pages are served via public URLs.** Before publishing:
- Never include secrets, credentials, API keys, PII, or internal endpoints
- Always confirm with the user before publishing
- Use `--ttl` for temporary/sensitive data so pages auto-expire

Include the URL in your response text. The API also returns platform-specific formatted summaries in `response.formats` that you can use for richer IM messages.

## TypeScript DSL (Preferred)

Write `.ts` files instead of JSON — fewer tokens, supports loops/conditionals, and auto-detected by `--spec-file`.

```typescript
import { page, container, header, row, stat, card, chart, table, col, badge, dataset } from "claw2ui/dsl"

export default page("Sales Dashboard", [
  container(
    header("Sales", "Q1 2026"),
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

### DSL Functions

**Page**: `page(title, components[], opts?)` — opts: `{ theme?, style? }`

**Layout** (accept `...children`):
- `container(...children)`, `row(cols, ...children)`, `column(span, ...children)`
- `card(title, ...children)`, `list(direction, ...children)`, `modal(title, ...children)`

**Special containers**:
- `tabs(tab("id","Label",...children), tab(...))` — `tab()` is a helper, not a component
- `accordion(section("Title",...children), section(...))` — `section()` is a helper

**Data display** (positional + opts):
- `stat(label, value, opts?)` — opts: `{ change?, icon? }`
- `chart(chartType, data, opts?)` — opts: `{ height?, options?, legendPosition?, title? }`
- `table(columns, rows, opts?)` — opts: `{ searchable?, perPage? }`

**Input**: `button(label, variant?)`, `textField(label?, opts?)`, `select(label, options)`, `checkbox(label, value?)`, `choicePicker(label, options, opts?)`, `slider(label, opts?)`, `dateTimeInput(label, opts?)`

**Media**: `markdown(content)`, `text(content, opts?)`, `code(content, language?)`, `html(content)`, `icon(name, size?)`, `image(src, alt?)`, `video(url, poster?)`, `audioPlayer(url, description?)`, `divider()`, `spacer(size?)`

**Navigation**: `header(title, subtitle?)`, `link(href, label?, target?)`

**Helpers**: `dataset(label, data[], opts?)`, `col(key, label?, format?)`, `badge(key, label, map)`, `months(n)`

### DSL Supports Logic (JSON Cannot)

```typescript
// Loops
const services = ["nginx", "postgres", "redis"]
row(3, ...services.map(s => stat(s, "Running")))

// Conditionals
container(
  header("Report"),
  data.length > 0 ? card("Trend", chart("line", chartData)) : text("No data"),
)
```

## Example: Full Dashboard

See `templates/dashboard.ts` (DSL) and `templates/dashboard.json` (JSON) for full examples.

## HF Space Deployment

### Deploy Procedure

```bash
# 1. Prepare a clean deploy directory (only the files Dockerfile needs)
rm -rf /tmp/claw2ui-hf && mkdir -p /tmp/claw2ui-hf
cp package.json package-lock.json tsconfig.json Dockerfile /tmp/claw2ui-hf/
cp -r src /tmp/claw2ui-hf/src
cp -r bin /tmp/claw2ui-hf/bin
cp -r templates /tmp/claw2ui-hf/templates

# 2. Add HF Space README with required YAML frontmatter
cat > /tmp/claw2ui-hf/README.md << 'EOF'
---
title: Claw2UI
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

Agent-to-UI bridge.
EOF

# 3. Upload (--delete "*" removes stale files from previous deploys)
hf upload <username>/claw2ui /tmp/claw2ui-hf . --type space --delete "*" --commit-message "deploy: <description>"

# 4. Wait ~3-4 minutes for build, then verify
curl -s https://<username>-claw2ui.hf.space/api/status
```

### Known Pitfalls

1. **README.md must have HF YAML frontmatter** — Without `sdk: docker` in the frontmatter, the Space enters `CONFIG_ERROR` with "Missing configuration in README". The project's own README.md does NOT have this frontmatter, so you must write a separate one for the deploy directory.

2. **Directory structure must be preserved** — The Dockerfile expects `src/`, `bin/`, `templates/` as directories. If the upload flattens the structure (files end up at root instead of in subdirectories), `COPY src/ src/` fails and `tsc` compilation errors out with `BUILD_ERROR`. Always use `cp -r src /tmp/deploy/src` (not `cp -r src/ /tmp/deploy/`) and verify with `ls /tmp/deploy/` before uploading.

3. **Don't upload the entire repo** — Only upload what Docker needs: `package.json`, `package-lock.json`, `tsconfig.json`, `Dockerfile`, `src/`, `bin/`, `templates/`, and the HF-specific `README.md`. Uploading everything (including `node_modules/`, `dist/`, `.claude/`, `test/`) wastes time and can cause conflicts.

4. **Use `--delete "*"` to clean stale files** — Without this flag, old files from previous deploys remain on the Space. If directory structure changed between deploys, leftover flat files can confuse the build.

5. **Pages are rendered at publish time** — Deploying new code (themes, components, renderer) does NOT update existing pages. Already-published pages keep their original HTML. To update a page, it must be re-published.

6. **Build takes 3-4 minutes** — `npm ci` + `tsc` on free tier `cpu-basic`. Check status with:
   ```bash
   curl -s -H "Authorization: Bearer $(cat ~/.cache/huggingface/token)" \
     "https://huggingface.co/api/spaces/<username>/claw2ui/runtime"
   ```
   Stages: `BUILDING` → `RUNNING` (success) or `BUILD_ERROR` (check `errorMessage`).

7. **Space Secrets are set via HF web UI** — `CLAWBOARD_TOKEN`, `CLAWBOARD_PUBLIC_URL` are required. `HF_TOKEN` + `CLAWBOARD_BACKUP_REPO` are optional (for persistence across restarts). Secrets survive redeploys — you only set them once.
