/**
 * A2UI-inspired renderer: converts declarative JSON component descriptions
 * into self-contained interactive HTML pages.
 *
 * Component types supported:
 *   layout: container, row, column, card, tabs, accordion
 *   data:   stat, table, chart (line, bar, pie, doughnut, radar, area)
 *   input:  button, text-field, select, checkbox, slider
 *   media:  image, markdown, code, html
 *   nav:    header, breadcrumb, link
 */

/**
 * Render a component tree to HTML string
 */
function renderComponent(comp) {
  if (!comp || !comp.type) return '';
  const t = comp.type;
  const p = comp.props || {};
  const children = (comp.children || []).map(renderComponent).join('\n');

  switch (t) {
    // === Layout ===
    case 'container':
      return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">${children}</div>`;

    case 'row':
      return `<div class="grid grid-cols-${p.cols || 12} gap-${p.gap || 4} mb-4">${children}</div>`;

    case 'column':
      return `<div class="col-span-${p.span || 1}">${children}</div>`;

    case 'card':
      return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${p.class || ''}">
          ${p.title ? `<div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${esc(p.title)}</h3>
            ${p.subtitle ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${esc(p.subtitle)}</p>` : ''}
          </div>` : ''}
          <div class="p-5">${children}</div>
        </div>`;

    case 'tabs': {
      const tabs = p.tabs || [];
      const tabId = `tabs_${Math.random().toString(36).slice(2, 8)}`;
      return `
        <div x-data="{ activeTab: '${tabs[0]?.id || ''}' }">
          <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav class="flex space-x-4">
              ${tabs.map(tab => `
                <button @click="activeTab = '${tab.id}'"
                  :class="activeTab === '${tab.id}' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
                  class="px-3 py-2 border-b-2 font-medium text-sm transition-colors">
                  ${esc(tab.label)}
                </button>
              `).join('')}
            </nav>
          </div>
          ${tabs.map(tab => `
            <div x-show="activeTab === '${tab.id}'" x-transition>
              ${(tab.children || []).map(renderComponent).join('\n')}
            </div>
          `).join('')}
        </div>`;
    }

    case 'accordion': {
      const items = p.items || [];
      return `
        <div class="space-y-2">
          ${items.map((item, i) => `
            <div x-data="{ open: ${i === 0 ? 'true' : 'false'} }" class="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button @click="open = !open" class="w-full px-4 py-3 flex justify-between items-center text-left">
                <span class="font-medium text-gray-900 dark:text-white">${esc(item.title)}</span>
                <svg :class="open ? 'rotate-180' : ''" class="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div x-show="open" x-transition class="px-4 pb-3">
                ${(item.children || []).map(renderComponent).join('\n')}
              </div>
            </div>
          `).join('')}
        </div>`;
    }

    // === Data Display ===
    case 'stat':
      return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">${esc(p.label || '')}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${esc(String(p.value || ''))}</p>
              ${p.change ? `<p class="text-sm mt-1 ${Number(p.change) >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${Number(p.change) >= 0 ? '↑' : '↓'} ${esc(String(Math.abs(Number(p.change))))}%
              </p>` : ''}
            </div>
            ${p.icon ? `<div class="text-3xl">${p.icon}</div>` : ''}
          </div>
        </div>`;

    case 'table': {
      const columns = p.columns || [];
      const rows = p.rows || [];
      const tableId = `tbl_${Math.random().toString(36).slice(2, 8)}`;
      return `
        <div x-data="{ search: '', sort: '', asc: true, page: 0, perPage: ${p.perPage || 10} }" class="overflow-hidden">
          ${p.searchable !== false ? `
          <div class="mb-3">
            <input x-model="search" type="text" placeholder="Search..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          </div>` : ''}
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  ${columns.map(col => `
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                        @click="sort === '${col.key}' ? asc = !asc : (sort = '${col.key}', asc = true)">
                      ${esc(col.label || col.key)}
                      <span x-show="sort === '${col.key}'" x-text="asc ? ' ↑' : ' ↓'"></span>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                ${rows.map((row, i) => `
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" ${p.searchable !== false ? `x-show="${columns.map(c => `String($el.closest('table').querySelectorAll('tbody tr')[${i}]?.textContent || '').toLowerCase().includes(search.toLowerCase())`).join(' || ')} || search === ''"` : ''}>
                    ${columns.map(col => `
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 whitespace-nowrap">${formatCell(row[col.key], col)}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    case 'chart': {
      const chartId = `chart_${Math.random().toString(36).slice(2, 8)}`;
      const chartType = p.chartType || 'line';
      const chartData = JSON.stringify(p.data || {});
      const chartOptions = JSON.stringify({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: p.legendPosition || 'top' },
          title: { display: !!p.title, text: p.title || '' },
        },
        ...(p.options || {}),
      });
      return `
        <div style="height: ${p.height || 300}px; position: relative;">
          <canvas id="${chartId}"></canvas>
        </div>
        <script>
          (function() {
            const ctx = document.getElementById('${chartId}').getContext('2d');
            new Chart(ctx, {
              type: '${chartType}',
              data: ${chartData},
              options: ${chartOptions}
            });
          })();
        </script>`;
    }

    // === Input ===
    case 'button':
      return `
        <button class="px-4 py-2 rounded-lg font-medium text-sm transition-colors
          ${p.variant === 'secondary' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' :
            p.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
            p.variant === 'outline' ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700' :
            'bg-blue-600 text-white hover:bg-blue-700'}"
          ${p.onClick ? `onclick="${esc(p.onClick)}"` : ''}>
          ${esc(p.label || 'Button')}
        </button>`;

    case 'text-field':
      return `
        <div class="mb-3">
          ${p.label ? `<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${esc(p.label)}</label>` : ''}
          <input type="${p.inputType || 'text'}" placeholder="${esc(p.placeholder || '')}" value="${esc(p.value || '')}"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
        </div>`;

    case 'select':
      return `
        <div class="mb-3">
          ${p.label ? `<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${esc(p.label)}</label>` : ''}
          <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            ${(p.options || []).map(opt => `<option value="${esc(opt.value || opt)}">${esc(opt.label || opt)}</option>`).join('')}
          </select>
        </div>`;

    // === Media ===
    case 'image': {
      const imgSrc = (p.src || '').replace(/^\s*javascript:/i, '');
      return `<img src="${esc(imgSrc)}" alt="${esc(p.alt || '')}" class="rounded-lg max-w-full" loading="lazy">`;
    }

    case 'markdown':
      return `<div class="prose dark:prose-invert max-w-none">${p.content || ''}</div>`;

    case 'code':
      return `
        <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm"><code class="language-${p.language || 'text'}">${esc(p.content || '')}</code></pre>`;

    case 'html':
      // Sanitize: strip <script> tags and event handlers to prevent XSS
      return sanitizeHtml(p.content || '');

    case 'text':
      return `<p class="text-${p.size || 'base'} ${p.class || 'text-gray-700 dark:text-gray-300'} ${p.bold ? 'font-bold' : ''}">${esc(p.content || '')}</p>`;

    case 'divider':
      return `<hr class="my-4 border-gray-200 dark:border-gray-700">`;

    case 'spacer':
      return `<div class="h-${p.size || 4}"></div>`;

    // === Navigation ===
    case 'header':
      return `
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${esc(p.title || '')}</h1>
          ${p.subtitle ? `<p class="text-gray-500 dark:text-gray-400 mt-1">${esc(p.subtitle)}</p>` : ''}
        </div>`;

    case 'link': {
      const href = (p.href || '#').replace(/^\s*javascript:/i, '#');
      return `<a href="${esc(href)}" target="${p.target || '_blank'}" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${esc(p.label || p.href || 'Link')}</a>`;
    }

    default:
      return `<!-- unknown component: ${t} -->`;
  }
}

function formatCell(value, col) {
  if (value === null || value === undefined) return '-';
  if (col.format === 'currency') return `$${Number(value).toLocaleString()}`;
  if (col.format === 'percent') return `${value}%`;
  if (col.format === 'badge') {
    const colors = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    const badgeColor = col.badgeMap?.[value] || 'info';
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[badgeColor] || colors.info}">${esc(String(value))}</span>`;
  }
  return esc(String(value));
}

function esc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize HTML: strip <script> tags, javascript: URLs, and on* event handlers.
 * Allows safe HTML structure (divs, spans, classes, etc.) but blocks XSS vectors.
 */
function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  return html
    // Remove <script>...</script> tags (including multiline)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove <script ...> opening tags that might not be closed
    .replace(/<script\b[^>]*>/gi, '')
    // Remove on* event handlers (onclick, onerror, onload, etc.)
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"')
    .replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""');
}

/**
 * Render a full page from a component tree
 * @param {object} spec - { title, theme, components: [...] }
 * @returns {string} Full HTML document
 */
function renderPage(spec) {
  const title = spec.title || 'ClawBoard';
  const theme = spec.theme || 'auto'; // 'light', 'dark', 'auto'
  const components = spec.components || [];

  const componentHtml = components.map(renderComponent).join('\n');

  const themeScript = theme === 'auto' ? `
    <script>
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        document.documentElement.classList.toggle('dark', e.matches);
      });
    </script>` : theme === 'dark' ? `
    <script>document.documentElement.classList.add('dark');</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    }
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  ${themeScript}
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    [x-cloak] { display: none !important; }
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .dark ::-webkit-scrollbar-thumb { background: #475569; }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen">
  ${componentHtml}
  <div class="text-center py-4 text-xs text-gray-400 dark:text-gray-600">
    Powered by ClawBoard
  </div>
</body>
</html>`;
}

/**
 * Render raw HTML into a full page with just the base styling
 */
function renderRawPage(html, title = 'ClawBoard') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' }</script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script>
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen">
  ${html}
  <div class="text-center py-4 text-xs text-gray-400 dark:text-gray-600">
    Powered by ClawBoard
  </div>
</body>
</html>`;
}

module.exports = { renderPage, renderRawPage, renderComponent };
