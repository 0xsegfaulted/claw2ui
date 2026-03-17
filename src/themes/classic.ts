/**
 * Classic Theme
 *
 * The original Claw2UI look: clean Tailwind CSS with blue accents,
 * gray surfaces, and system fonts.
 */
import type { Theme } from './types';
import type { Component, ColumnDef } from '../types';
import {
  esc, escJs, escJsonInScript, sanitizeHtml,
  VALID_CHART_TYPES, iconName, normalizeDateValue, responsiveGridCols,
} from '../render-utils';

const theme: Theme = {
  meta: {
    name: 'Classic',
    description: 'Clean Tailwind CSS with blue accents and system fonts',
    author: 'Claw2UI',
  },

  getDesignCSS() {
    return `
      *,*::before,*::after{box-sizing:border-box}
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; min-height: 100vh; margin: 0; }
      .dark body { background-color: #111827; }
      [x-cloak] { display: none !important; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      .dark ::-webkit-scrollbar-thumb { background: #475569; }
      .c2u-classic-tabs-nav{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .c2u-classic-tabs-nav::-webkit-scrollbar{display:none}
      .c2u-classic-tabs-nav button{white-space:nowrap;flex-shrink:0;padding:clamp(0.5rem,1.5vw,0.75rem) clamp(0.625rem,2vw,1rem);font-size:clamp(0.8rem,1.5vw,0.875rem)}
      .c2u-classic-stat{padding:clamp(0.875rem,3vw,1.25rem)}
      .c2u-classic-stat .text-sm{font-size:clamp(0.7rem,1.5vw,0.875rem)}
      .c2u-classic-stat .text-2xl{font-size:clamp(1.25rem,3vw + 0.25rem,1.5rem)}
      .c2u-classic-stat .text-3xl{font-size:clamp(1.25rem,2.5vw + 0.5rem,1.875rem);flex-shrink:0;max-width:clamp(2rem,8vw,3.5rem);overflow:hidden;text-overflow:ellipsis;line-height:1}
      .c2u-classic-card-header{padding:clamp(0.625rem,2vw,1rem) clamp(0.875rem,2.5vw,1.25rem)}
      .c2u-classic-card-body{padding:clamp(0.625rem,2vw,1rem) clamp(0.875rem,2.5vw,1.25rem)}
      .c2u-classic-header h1{font-size:clamp(1.35rem,4vw + 0.25rem,1.5rem)}
      .c2u-classic-table th{padding:clamp(0.4rem,1.2vw,0.75rem) clamp(0.5rem,1.5vw,1rem);font-size:clamp(0.65rem,1.2vw,0.75rem)}
      .c2u-classic-table td{padding:clamp(0.4rem,1.2vw,0.75rem) clamp(0.5rem,1.5vw,1rem);font-size:clamp(0.78rem,1.5vw,0.875rem)}
      .c2u-classic-code{padding:clamp(0.625rem,2vw,1rem);font-size:clamp(0.78rem,1.2vw,0.875rem)}
      .c2u-classic-modal{padding:clamp(1rem,3vw,1.5rem);max-width:min(32rem,calc(100vw - 2rem))}
      .c2u-classic-accordion-btn{padding:clamp(0.5rem,1.5vw,0.75rem) clamp(0.625rem,1.8vw,1rem);font-size:clamp(0.82rem,1.5vw,0.9375rem)}
      @media(max-width:640px){
        [class*="col-span-"]{grid-column:1/-1}
        .c2u-classic-chart{max-height:220px}
      }
    `;
  },

  getFontsHTML() {
    return `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`;
  },

  getTailwindConfig() {
    return `{ darkMode: 'class', theme: { extend: {} } }`;
  },

  getChartDefaultsScript() {
    return '';
  },

  getFooterHTML() {
    return `<div class="text-center py-4 text-xs text-gray-400 dark:text-gray-600">Powered by Claw2UI</div>`;
  },

  renderComponent,
  formatCell,
};

export default theme;

/* ------------------------------------------------------------------ */

function renderComponent(comp: Component): string {
  if (!comp || !comp.type) return '';
  const t = comp.type;
  const p = comp.props || {};
  const children = (comp.children || []).map(renderComponent).join('\n');

  switch (t) {
    case 'container':
      return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">${children}</div>`;

    case 'row':
      return `<div class="grid ${responsiveGridCols(p.cols || 12)} gap-${p.gap || 4} mb-4">${children}</div>`;

    case 'column':
      return `<div class="col-span-${p.span || 1}">${children}</div>`;

    case 'card':
      return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${p.class || ''}">
          ${p.title ? `<div class="c2u-classic-card-header px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${esc(p.title)}</h3>
            ${p.subtitle ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${esc(p.subtitle)}</p>` : ''}
          </div>` : ''}
          <div class="c2u-classic-card-body p-5">${children}</div>
        </div>`;

    case 'tabs': {
      const tabs: Array<{ id: string; label: string; children?: Component[] }> = p.tabs || [];
      return `
        <div x-data="{ activeTab: '${escJs(tabs[0]?.id || '')}' }">
          <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav class="c2u-classic-tabs-nav flex space-x-4">
              ${tabs.map(tab => `
                <button @click="activeTab = '${escJs(tab.id)}'"
                  :class="activeTab === '${escJs(tab.id)}' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
                  class="px-3 py-2 border-b-2 font-medium text-sm transition-colors">${esc(tab.label)}</button>
              `).join('')}
            </nav>
          </div>
          ${tabs.map(tab => `
            <div x-show="activeTab === '${escJs(tab.id)}'" x-transition>
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
              <button @click="open = !open" class="c2u-classic-accordion-btn w-full px-4 py-3 flex justify-between items-center text-left">
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

    case 'stat':
      return `
        <div class="c2u-classic-stat bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">${esc(p.label || '')}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${esc(String(p.value || ''))}</p>
              ${p.change ? `<p class="text-sm mt-1 ${Number(p.change) >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${Number(p.change) >= 0 ? '\u2191' : '\u2193'} ${esc(String(Math.abs(Number(p.change))))}%
              </p>` : ''}
            </div>
            ${p.icon ? `<div class="text-3xl">${esc(String(p.icon))}</div>` : ''}
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
            <table class="c2u-classic-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  ${columns.map(col => `
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                        @click="sort === '${escJs(col.key)}' ? asc = !asc : (sort = '${escJs(col.key)}', asc = true)">
                      ${esc(col.label || col.key)}
                      <span x-show="sort === '${escJs(col.key)}'" x-text="asc ? ' \u2191' : ' \u2193'"></span>
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
      const chartType = VALID_CHART_TYPES.includes(p.chartType) ? p.chartType : 'line';
      const chartData = escJsonInScript(JSON.stringify(p.data || {}));
      const chartOptions = escJsonInScript(JSON.stringify({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: p.legendPosition || 'top' },
          title: { display: !!p.title, text: p.title || '' },
        },
        ...(p.options || {}),
      }));
      const height = parseInt(String(p.height), 10) || 300;
      return `
        <div class="c2u-classic-chart" style="height: ${height}px; position: relative;">
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

    case 'button': {
      const variants: Record<string, string> = {
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
      };
      const variantClass = variants[p.variant] || 'bg-blue-600 text-white hover:bg-blue-700';
      return `<button class="px-4 py-2 rounded-lg font-medium text-sm transition-colors ${variantClass}">${esc(p.label || 'Button')}</button>`;
    }

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

    case 'image': {
      const imgSrc = (p.src || '').replace(/^\s*javascript:/i, '');
      return `<img src="${esc(imgSrc)}" alt="${esc(p.alt || '')}" class="rounded-lg max-w-full" loading="lazy">`;
    }

    case 'markdown':
      return `<div class="prose dark:prose-invert max-w-none">${sanitizeHtml(p.content || '')}</div>`;

    case 'code':
      return `<pre class="c2u-classic-code bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm"><code class="language-${p.language || 'text'}">${esc(p.content || '')}</code></pre>`;

    case 'html':
      return sanitizeHtml(p.content || '');

    case 'text':
      return `<p class="text-${p.size || 'base'} ${p.class || 'text-gray-700 dark:text-gray-300'} ${p.bold ? 'font-bold' : ''}">${esc(p.content || '')}</p>`;

    case 'divider':
      return `<hr class="my-4 border-gray-200 dark:border-gray-700">`;

    case 'spacer':
      return `<div class="h-${p.size || 4}"></div>`;

    case 'header':
      return `
        <div class="c2u-classic-header mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${esc(p.title || '')}</h1>
          ${p.subtitle ? `<p class="text-gray-500 dark:text-gray-400 mt-1">${esc(p.subtitle)}</p>` : ''}
        </div>`;

    case 'link': {
      const href = (p.href || '#').replace(/^\s*javascript:/i, '#');
      return `<a href="${esc(href)}" target="${p.target || '_blank'}" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${esc(p.label || p.href || 'Link')}</a>`;
    }

    case 'icon': {
      const iconSize = parseInt(String(p.size), 10) || 24;
      return `<span class="material-icons text-gray-600 dark:text-gray-400" style="font-size:${iconSize}px">${esc(String(iconName(p.name)))}</span>`;
    }

    case 'video': {
      const videoSrc = (p.url || '').replace(/^\s*javascript:/i, '');
      return `<video src="${esc(videoSrc)}" controls class="rounded-lg w-full max-w-2xl" preload="metadata" ${p.poster ? `poster="${esc(p.poster)}"` : ''}>Your browser does not support the video tag.</video>`;
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
      const triggerChild = comp.children?.[0] ? renderComponent(comp.children[0]) : `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg">${esc(p.triggerLabel || 'Open')}</button>`;
      const contentChildren = (comp.children || []).slice(1).map(renderComponent).join('\n');
      return `
        <div x-data="{ open: false }">
          <div @click="open = true" class="cursor-pointer inline-block">${triggerChild}</div>
          <template x-teleport="body">
            <div x-show="open" x-transition.opacity class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
              <div class="fixed inset-0 bg-black/50" @click="open = false"></div>
              <div class="c2u-classic-modal relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 z-10" @click.stop>
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
          <input id="${cbId}" type="checkbox" ${p.value ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
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
                const sel = selected.includes(opt.value);
                return `<button class="px-3 py-1.5 rounded-full text-sm border transition-colors ${sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'}">${esc(opt.label || opt.value)}</button>`;
              }).join('\n')}
            </div>
          </div>`;
      }

      return `
        <fieldset class="mb-3">
          ${p.label ? `<legend class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${esc(p.label)}</legend>` : ''}
          <div class="space-y-1.5">
            ${options.map((opt) => {
              const inputType = isMulti ? 'checkbox' : 'radio';
              const sel = selected.includes(opt.value);
              return `<label class="flex items-center gap-2 cursor-pointer">
                <input type="${inputType}" name="${cpId}" value="${esc(opt.value)}" ${sel ? 'checked' : ''} class="w-4 h-4 ${isMulti ? 'rounded' : ''} border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
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
          <input id="${dtId}" type="${inputType}" value="${esc(normalizeDateValue(p.value, inputType))}"
            ${p.min ? `min="${esc(normalizeDateValue(p.min, inputType))}"` : ''} ${p.max ? `max="${esc(normalizeDateValue(p.max, inputType))}"` : ''}
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
