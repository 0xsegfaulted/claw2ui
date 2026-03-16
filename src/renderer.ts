/**
 * A2UI-inspired renderer: converts declarative JSON component descriptions
 * into self-contained interactive HTML pages.
 *
 * Component types supported:
 *   layout: container, row, column, card, tabs, accordion, list, modal
 *   data:   stat, table, chart (line, bar, pie, doughnut, radar, area)
 *   input:  button, text-field, select, checkbox, choice-picker, slider, date-time-input
 *   media:  icon, image, video, audio-player, markdown, code, html, text, divider, spacer
 *   nav:    header, link
 */
import type { Component, PageSpec, ColumnDef } from './types';

/**
 * Render a component tree to HTML string
 */
export function renderComponent(comp: Component): string {
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
      const tabs: Array<{ id: string; label: string; children?: Component[] }> = p.tabs || [];
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
      const items: Array<{ title: string; children?: Component[] }> = p.items || [];
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
                ${Number(p.change) >= 0 ? '\u2191' : '\u2193'} ${esc(String(Math.abs(Number(p.change))))}%
              </p>` : ''}
            </div>
            ${p.icon ? `<div class="text-3xl">${p.icon}</div>` : ''}
          </div>
        </div>`;

    case 'table': {
      const columns: ColumnDef[] = p.columns || [];
      const rows: Record<string, any>[] = p.rows || [];
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
                      <span x-show="sort === '${col.key}'" x-text="asc ? ' \u2191' : ' \u2193'"></span>
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
            ${(p.options || []).map((opt: any) => `<option value="${esc(opt.value || opt)}">${esc(opt.label || opt)}</option>`).join('')}
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

    // === A2UI Standard Components ===

    case 'icon':
      return `<span class="material-icons text-gray-600 dark:text-gray-400" style="font-size:${p.size || 24}px">${iconName(p.name)}</span>`;

    case 'video': {
      const videoSrc = (p.url || '').replace(/^\s*javascript:/i, '');
      return `
        <video src="${esc(videoSrc)}" controls class="rounded-lg w-full max-w-2xl" preload="metadata"
          ${p.poster ? `poster="${esc(p.poster)}"` : ''}>
          Your browser does not support the video tag.
        </video>`;
    }

    case 'audio-player':
      return `
        <div class="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <audio src="${esc(p.url || '')}" controls class="flex-1 h-10"></audio>
          ${p.description ? `<span class="text-sm text-gray-600 dark:text-gray-400 shrink-0">${esc(p.description)}</span>` : ''}
        </div>`;

    case 'list':
      return `
        <div class="flex ${p.direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} gap-${p.gap || 2}
          ${p.align === 'center' ? 'items-center' : p.align === 'end' ? 'items-end' : p.align === 'stretch' ? 'items-stretch' : 'items-start'}">
          ${children}
        </div>`;

    case 'modal': {
      const modalId = `modal_${Math.random().toString(36).slice(2, 8)}`;
      const triggerChild = comp.children?.[0] ? renderComponent(comp.children[0]) : `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg">${esc(p.triggerLabel || 'Open')}</button>`;
      const contentChildren = (comp.children || []).slice(1).map(renderComponent).join('\n');
      return `
        <div x-data="{ open: false }">
          <div @click="open = true" class="cursor-pointer inline-block">${triggerChild}</div>
          <template x-teleport="body">
            <div x-show="open" x-transition.opacity class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
              <div class="fixed inset-0 bg-black/50" @click="open = false"></div>
              <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 z-10" @click.stop>
                <button @click="open = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
                ${p.title ? `<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${esc(p.title)}</h3>` : ''}
                ${contentChildren || '<p class="text-gray-500">Modal content</p>'}
              </div>
            </div>
          </template>
        </div>`;
    }

    case 'checkbox': {
      const cbId = `cb_${Math.random().toString(36).slice(2, 8)}`;
      return `
        <label for="${cbId}" class="flex items-center gap-2 cursor-pointer select-none mb-2">
          <input id="${cbId}" type="checkbox" ${p.value ? 'checked' : ''}
            class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
          <span class="text-sm text-gray-700 dark:text-gray-300">${esc(p.label || '')}</span>
        </label>`;
    }

    case 'choice-picker': {
      const cpId = `cp_${Math.random().toString(36).slice(2, 8)}`;
      const options: Array<{ label: string; value: string }> = p.options || [];
      const selected: string[] = Array.isArray(p.value) ? p.value : [];
      const isMulti = p.variant === 'multipleSelection';
      const isChips = p.displayStyle === 'chips';

      if (isChips) {
        return `
          <div class="mb-3">
            ${p.label ? `<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${esc(p.label)}</label>` : ''}
            <div class="flex flex-wrap gap-2">
              ${options.map(opt => {
                const isSelected = selected.includes(opt.value);
                return `<button class="px-3 py-1.5 rounded-full text-sm border transition-colors
                  ${isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'}">${esc(opt.label || opt.value)}</button>`;
              }).join('\n')}
            </div>
          </div>`;
      }

      return `
        <fieldset class="mb-3">
          ${p.label ? `<legend class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${esc(p.label)}</legend>` : ''}
          <div class="space-y-1.5">
            ${options.map((opt, i) => {
              const inputType = isMulti ? 'checkbox' : 'radio';
              const isSelected = selected.includes(opt.value);
              return `<label class="flex items-center gap-2 cursor-pointer">
                <input type="${inputType}" name="${cpId}" value="${esc(opt.value)}" ${isSelected ? 'checked' : ''}
                  class="w-4 h-4 ${isMulti ? 'rounded' : ''} border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700 dark:text-gray-300">${esc(opt.label || opt.value)}</span>
              </label>`;
            }).join('\n')}
          </div>
        </fieldset>`;
    }

    case 'slider': {
      const sliderId = `slider_${Math.random().toString(36).slice(2, 8)}`;
      const min = p.min ?? 0;
      const max = p.max ?? 100;
      const val = p.value ?? Math.round((min + max) / 2);
      return `
        <div class="mb-3" x-data="{ val: ${val} }">
          ${p.label ? `<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${esc(p.label)} <span class="text-blue-600 dark:text-blue-400 font-semibold" x-text="val"></span>
          </label>` : ''}
          <input id="${sliderId}" type="range" min="${min}" max="${max}" x-model="val"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600">
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>${min}</span><span>${max}</span>
          </div>
        </div>`;
    }

    case 'date-time-input': {
      const dtId = `dt_${Math.random().toString(36).slice(2, 8)}`;
      const enableDate = p.enableDate !== false;
      const enableTime = p.enableTime === true;
      let inputType = 'date';
      if (enableDate && enableTime) inputType = 'datetime-local';
      else if (!enableDate && enableTime) inputType = 'time';

      return `
        <div class="mb-3">
          ${p.label ? `<label for="${dtId}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${esc(p.label)}</label>` : ''}
          <input id="${dtId}" type="${inputType}" value="${esc(p.value || '')}"
            ${p.min ? `min="${esc(p.min)}"` : ''} ${p.max ? `max="${esc(p.max)}"` : ''}
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
        </div>`;
    }

    default:
      return `<!-- unknown component: ${t} -->`;
  }
}

function formatCell(value: any, col: ColumnDef): string {
  if (value === null || value === undefined) return '-';
  if (col.format === 'currency') return `$${Number(value).toLocaleString()}`;
  if (col.format === 'percent') return `${value}%`;
  if (col.format === 'badge') {
    const colors: Record<string, string> = {
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

/** Map A2UI camelCase icon names to Material Icons snake_case */
function iconName(name: string | { path: string }): string {
  if (typeof name === 'object' && name.path) return name.path;
  if (typeof name !== 'string') return 'help';
  // Convert camelCase to snake_case for Material Icons
  return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function esc(str: string): string {
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
 */
function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<script\b[^>]*>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"')
    .replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""');
}

/**
 * Render a full page from a component tree
 */
export function renderPage(spec: PageSpec): string {
  const title = spec.title || 'ClawBoard';
  const theme = spec.theme || 'auto';
  const components = spec.components || [];
  const description = generateDescription(components);

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
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
export function renderRawPage(html: string, title: string = 'ClawBoard'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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

function generateDescription(components: Component[]): string {
  if (!Array.isArray(components)) return 'Interactive page powered by ClawBoard';
  const flat = flattenForDesc(components);
  const stats = flat.filter(c => c.type === 'stat').length;
  const charts = flat.filter(c => c.type === 'chart').length;
  const tables = flat.filter(c => c.type === 'table').length;
  const parts: string[] = [];
  if (stats) parts.push(`${stats} metric${stats > 1 ? 's' : ''}`);
  if (charts) parts.push(`${charts} chart${charts > 1 ? 's' : ''}`);
  if (tables) parts.push(`${tables} table${tables > 1 ? 's' : ''}`);
  if (parts.length === 0) return 'Interactive page powered by ClawBoard';
  return `Dashboard with ${parts.join(', ')} - powered by ClawBoard`;
}

function flattenForDesc(components: Component[]): Component[] {
  const result: Component[] = [];
  for (const comp of components) {
    result.push(comp);
    if (comp.children) result.push(...flattenForDesc(comp.children));
    if (comp.props?.tabs) {
      for (const tab of comp.props.tabs) {
        if (tab.children) result.push(...flattenForDesc(tab.children));
      }
    }
    if (comp.props?.items) {
      for (const item of comp.props.items) {
        if (item.children) result.push(...flattenForDesc(item.children));
      }
    }
  }
  return result;
}
