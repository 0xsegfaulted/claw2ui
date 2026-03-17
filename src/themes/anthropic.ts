/**
 * Anthropic Editorial Theme
 *
 * Warm, editorial aesthetic inspired by Anthropic's blog:
 * cream backgrounds, Newsreader serif headings, terracotta accents,
 * generous whitespace, clean surfaces, and subtle transitions.
 */
import type { Theme } from './types';
import type { Component, ColumnDef } from '../types';
import {
  esc, escJs, escJsonInScript, sanitizeHtml,
  VALID_CHART_TYPES, iconName, normalizeDateValue, responsiveGridCols,
} from '../render-utils';

const theme: Theme = {
  meta: {
    name: 'Anthropic Editorial',
    description: 'Warm, refined editorial aesthetic with serif headings and terracotta accents',
    author: 'Claw2UI',
  },

  getDesignCSS,
  getFontsHTML,
  getTailwindConfig,
  getChartDefaultsScript,
  renderComponent,
  formatCell,
  getFooterHTML,
};

export default theme;

/* ------------------------------------------------------------------ */

function getFontsHTML(): string {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&family=Source+Code+Pro:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`;
}

function getTailwindConfig(): string {
  return `{
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          serif: ['Newsreader', 'Georgia', 'serif'],
          mono: ['Source Code Pro', 'monospace'],
        }
      }
    }
  }`;
}

function getChartDefaultsScript(): string {
  return `(function(){
    var d=document.documentElement.classList.contains('dark');
    Chart.defaults.color=d?'#8a8580':'#737373';
    Chart.defaults.borderColor=d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';
    Chart.defaults.font.family="'Source Code Pro',monospace";
    Chart.defaults.font.size=11;
    Chart.defaults.plugins.legend.labels.usePointStyle=true;
    Chart.defaults.elements.bar.borderRadius=4;
    Chart.defaults.elements.line.borderWidth=2;
    Chart.defaults.elements.point.radius=3;
    Chart.defaults.elements.point.hoverRadius=5;
  })();`;
}

function getFooterHTML(): string {
  return `<div class="c2u-footer">
    <div class="c2u-footer-accent"></div><br>
    Powered by Claw2UI
  </div>`;
}

/* ------------------------------------------------------------------ */
/*  Design CSS                                                         */
/* ------------------------------------------------------------------ */

function getDesignCSS(): string {
  return `
    :root {
      --c2u-bg: #faf9f6;
      --c2u-surface: #ffffff;
      --c2u-surface-raised: #ffffff;
      --c2u-border: rgba(0,0,0,0.08);
      --c2u-border-hover: rgba(0,0,0,0.16);
      --c2u-text: #2d2d2d;
      --c2u-text-secondary: #737373;
      --c2u-text-heading: #1a1a1a;
      --c2u-primary: #c4642d;
      --c2u-primary-dim: rgba(196,100,45,0.08);
      --c2u-success: #3d8b6e;
      --c2u-success-dim: rgba(61,139,110,0.1);
      --c2u-warning: #b8860b;
      --c2u-warning-dim: rgba(184,134,11,0.1);
      --c2u-error: #c44b2d;
      --c2u-error-dim: rgba(196,75,45,0.1);
      --c2u-info: #4a7fb5;
      --c2u-info-dim: rgba(74,127,181,0.1);
      --c2u-radius: 12px;
      --c2u-radius-sm: 8px;
      --c2u-transition: 0.2s ease;
    }
    .dark {
      --c2u-bg: #1a1715;
      --c2u-surface: #252220;
      --c2u-surface-raised: #2d2a27;
      --c2u-border: rgba(255,255,255,0.08);
      --c2u-border-hover: rgba(255,255,255,0.16);
      --c2u-text: #d4cfc9;
      --c2u-text-secondary: #8a8580;
      --c2u-text-heading: #f0ece7;
      --c2u-primary: #d98a5c;
      --c2u-primary-dim: rgba(217,138,92,0.12);
      --c2u-success: #5aab8e;
      --c2u-success-dim: rgba(90,171,142,0.12);
      --c2u-warning: #d4a843;
      --c2u-warning-dim: rgba(212,168,67,0.12);
      --c2u-error: #d4735c;
      --c2u-error-dim: rgba(212,115,92,0.12);
      --c2u-info: #6a9fd5;
      --c2u-info-dim: rgba(106,159,213,0.12);
    }
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--c2u-bg);color:var(--c2u-text);min-height:100vh;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.65;margin:0}
    [x-cloak]{display:none!important}
    ::selection{background:var(--c2u-primary-dim);color:var(--c2u-text-heading)}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--c2u-border);border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:var(--c2u-border-hover)}

    .c2u-card{background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius);overflow:hidden;transition:box-shadow var(--c2u-transition)}
    .c2u-card:hover{box-shadow:0 2px 16px rgba(0,0,0,0.06)}
    .dark .c2u-card:hover{box-shadow:0 2px 16px rgba(0,0,0,0.2)}
    .c2u-card-header{padding:clamp(12px,2.5vw,20px) clamp(14px,3vw,24px) clamp(10px,2vw,16px);border-bottom:1px solid var(--c2u-border)}
    .c2u-card-body{padding:clamp(12px,2.5vw,20px) clamp(14px,3vw,24px)}

    .c2u-stat{background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius);padding:clamp(14px,3vw,24px);position:relative;overflow:hidden;transition:box-shadow var(--c2u-transition)}
    .c2u-stat::before{content:'';position:absolute;top:0;left:clamp(14px,3vw,24px);width:24px;height:3px;background:var(--c2u-primary);border-radius:0 0 3px 3px}
    .c2u-stat:hover{box-shadow:0 2px 16px rgba(0,0,0,0.06)}
    .dark .c2u-stat:hover{box-shadow:0 2px 16px rgba(0,0,0,0.2)}
    .c2u-stat-label{font-size:clamp(0.7rem,1.5vw,0.8rem);font-weight:600;color:var(--c2u-text-secondary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:clamp(4px,1vw,8px)}
    .c2u-stat-value{font-family:'Source Code Pro',monospace;font-size:clamp(1.25rem,3vw + 0.25rem,1.75rem);font-weight:700;color:var(--c2u-text-heading);line-height:1.2}
    .c2u-stat-change{font-family:'Source Code Pro',monospace;font-size:0.8rem;font-weight:600;margin-top:clamp(4px,1vw,8px)}
    .c2u-up{color:var(--c2u-success)}
    .c2u-down{color:var(--c2u-error)}
    .c2u-stat-icon{font-size:clamp(1.25rem,2.5vw + 0.5rem,2rem);opacity:0.5;flex-shrink:0;line-height:1}

    .c2u-table-wrap{border-radius:var(--c2u-radius);border:1px solid var(--c2u-border);overflow:hidden}
    .c2u-table{width:100%;border-collapse:collapse}
    .c2u-table thead{background:var(--c2u-surface-raised)}
    .c2u-table th{padding:clamp(8px,1.5vw,12px) clamp(10px,2vw,16px);text-align:left;font-size:clamp(0.65rem,1.2vw,0.7rem);font-weight:700;color:var(--c2u-text-secondary);text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid var(--c2u-border);cursor:pointer;user-select:none;white-space:nowrap;transition:color var(--c2u-transition)}
    .c2u-table th:hover{color:var(--c2u-text-heading)}
    .c2u-table td{padding:clamp(8px,1.5vw,12px) clamp(10px,2vw,16px);font-size:clamp(0.8rem,1.5vw,0.875rem);color:var(--c2u-text);white-space:nowrap;border-bottom:1px solid var(--c2u-border)}
    .c2u-table tbody tr{transition:background var(--c2u-transition)}
    .c2u-table tbody tr:hover{background:var(--c2u-primary-dim)}
    .c2u-table tbody tr:last-child td{border-bottom:none}

    .c2u-search{width:100%;padding:10px 14px 10px 40px;background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius-sm);color:var(--c2u-text);font-family:'Source Sans 3',sans-serif;font-size:0.875rem;outline:none;transition:all var(--c2u-transition)}
    .c2u-search:focus{border-color:var(--c2u-primary);box-shadow:0 0 0 3px var(--c2u-primary-dim)}
    .c2u-search::placeholder{color:var(--c2u-text-secondary)}

    .c2u-badge{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;letter-spacing:0.01em}
    .c2u-badge-success{background:var(--c2u-success-dim);color:var(--c2u-success)}
    .c2u-badge-warning{background:var(--c2u-warning-dim);color:var(--c2u-warning)}
    .c2u-badge-error{background:var(--c2u-error-dim);color:var(--c2u-error)}
    .c2u-badge-info{background:var(--c2u-info-dim);color:var(--c2u-info)}

    .c2u-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;border-radius:var(--c2u-radius-sm);font-family:'Source Sans 3',sans-serif;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all var(--c2u-transition);border:none;outline:none}
    .c2u-btn-primary{background:var(--c2u-primary);color:#fff}
    .c2u-btn-primary:hover{opacity:0.9;transform:translateY(-1px);box-shadow:0 4px 12px var(--c2u-primary-dim)}
    .c2u-btn-secondary{background:var(--c2u-surface);border:1px solid var(--c2u-border);color:var(--c2u-text)}
    .c2u-btn-secondary:hover{border-color:var(--c2u-border-hover);background:var(--c2u-surface-raised)}
    .c2u-btn-danger{background:var(--c2u-error-dim);color:var(--c2u-error)}
    .c2u-btn-danger:hover{background:var(--c2u-error);color:#fff}
    .c2u-btn-outline{background:transparent;border:1px solid var(--c2u-border);color:var(--c2u-text)}
    .c2u-btn-outline:hover{border-color:var(--c2u-primary);color:var(--c2u-primary)}

    .c2u-input{width:100%;padding:10px 14px;background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius-sm);color:var(--c2u-text);font-family:'Source Sans 3',sans-serif;font-size:0.9rem;outline:none;transition:all var(--c2u-transition)}
    .c2u-input:focus{border-color:var(--c2u-primary);box-shadow:0 0 0 3px var(--c2u-primary-dim)}
    .c2u-input::placeholder{color:var(--c2u-text-secondary)}
    .c2u-label{display:block;font-size:0.8rem;font-weight:600;color:var(--c2u-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.04em}

    .c2u-tabs-nav{display:flex;gap:0;border-bottom:1px solid var(--c2u-border);margin-bottom:clamp(16px,3vw,24px);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .c2u-tabs-nav::-webkit-scrollbar{display:none}
    .c2u-tab-btn{padding:clamp(8px,1.5vw,12px) clamp(12px,2.5vw,20px);font-size:clamp(0.8rem,1.5vw,0.875rem);font-weight:500;color:var(--c2u-text-secondary);background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer;transition:all var(--c2u-transition);white-space:nowrap;flex-shrink:0}
    .c2u-tab-btn:hover{color:var(--c2u-text)}
    .c2u-tab-active{color:var(--c2u-primary)!important;border-bottom-color:var(--c2u-primary)!important}

    .c2u-accordion-item{border:1px solid var(--c2u-border);border-radius:var(--c2u-radius-sm);overflow:hidden;transition:border-color var(--c2u-transition)}
    .c2u-accordion-item:hover{border-color:var(--c2u-border-hover)}
    .c2u-accordion-trigger{width:100%;padding:clamp(10px,1.8vw,14px) clamp(12px,2vw,18px);display:flex;justify-content:space-between;align-items:center;text-align:left;background:transparent;border:none;color:var(--c2u-text-heading);font-family:'Source Sans 3',sans-serif;font-size:clamp(0.82rem,1.5vw,0.9rem);font-weight:600;cursor:pointer}
    .c2u-accordion-body{padding:0 clamp(12px,2vw,18px) clamp(10px,2vw,16px)}

    .c2u-code{background:#1e1e1e;border:1px solid var(--c2u-border);border-radius:var(--c2u-radius-sm);padding:clamp(12px,2.5vw,18px) clamp(14px,2.5vw,20px);overflow-x:auto;font-family:'Source Code Pro',monospace;font-size:clamp(0.78rem,1.2vw,0.85rem);line-height:1.65;color:#d4d4d4}

    .c2u-header{margin-bottom:clamp(20px,4vw,32px)}
    .c2u-header-title{font-family:'Newsreader',Georgia,'Times New Roman',serif;font-size:clamp(1.5rem,4vw + 0.25rem,2.25rem);font-weight:400;color:var(--c2u-text-heading);letter-spacing:-0.02em;line-height:1.2;margin:0}
    .c2u-header-subtitle{color:var(--c2u-text-secondary);font-size:1rem;margin-top:8px;line-height:1.5}
    .c2u-header-rule{width:32px;height:2px;background:var(--c2u-primary);border-radius:1px;margin-top:16px}

    .c2u-divider{border:none;height:1px;background:var(--c2u-border);margin:24px 0}

    .c2u-link{color:var(--c2u-primary);text-decoration:none;font-weight:500;border-bottom:1px solid transparent;transition:border-color var(--c2u-transition)}
    .c2u-link:hover{border-bottom-color:var(--c2u-primary)}

    .c2u-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
    .c2u-modal-panel{position:relative;background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius);max-width:min(32rem,calc(100vw - 32px));width:100%;max-height:80vh;overflow-y:auto;padding:clamp(18px,3vw,28px);z-index:10;box-shadow:0 20px 60px rgba(0,0,0,0.15)}
    .c2u-modal-close{position:absolute;top:16px;right:16px;background:none;border:none;color:var(--c2u-text-secondary);font-size:1.25rem;cursor:pointer;transition:color var(--c2u-transition)}
    .c2u-modal-close:hover{color:var(--c2u-text)}

    .c2u-audio{display:flex;align-items:center;gap:12px;background:var(--c2u-surface);border:1px solid var(--c2u-border);border-radius:var(--c2u-radius-sm);padding:12px 16px}

    .c2u-chip{display:inline-flex;align-items:center;padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:500;border:1px solid var(--c2u-border);background:var(--c2u-surface);color:var(--c2u-text);cursor:pointer;transition:all var(--c2u-transition)}
    .c2u-chip:hover{border-color:var(--c2u-primary)}
    .c2u-chip-active{background:var(--c2u-primary-dim);border-color:var(--c2u-primary);color:var(--c2u-primary)}

    .c2u-slider{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:var(--c2u-border);outline:none}
    .c2u-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--c2u-primary);cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.15)}
    .c2u-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--c2u-primary);cursor:pointer;border:none}

    .c2u-checkbox{width:16px;height:16px;border-radius:4px;accent-color:var(--c2u-primary)}
    .c2u-image{border-radius:var(--c2u-radius-sm);max-width:100%}
    .c2u-chart-wrap{position:relative}
    .c2u-prose{color:var(--c2u-text);line-height:1.75}
    .c2u-prose a{color:var(--c2u-primary)}
    .c2u-prose strong{color:var(--c2u-text-heading)}
    .c2u-prose h1,.c2u-prose h2,.c2u-prose h3{font-family:'Newsreader',Georgia,serif;color:var(--c2u-text-heading);font-weight:400}
    .material-icons{vertical-align:middle}

    @keyframes c2u-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .c2u-animate{animation:c2u-fadeUp 0.45s ease forwards;opacity:0}
    .c2u-stagger>*{animation:c2u-fadeUp 0.4s ease forwards;opacity:0}
    .c2u-stagger>*:nth-child(1){animation-delay:.03s}
    .c2u-stagger>*:nth-child(2){animation-delay:.06s}
    .c2u-stagger>*:nth-child(3){animation-delay:.09s}
    .c2u-stagger>*:nth-child(4){animation-delay:.12s}
    .c2u-stagger>*:nth-child(5){animation-delay:.15s}
    .c2u-stagger>*:nth-child(6){animation-delay:.18s}
    .c2u-stagger>*:nth-child(7){animation-delay:.21s}
    .c2u-stagger>*:nth-child(8){animation-delay:.24s}
    .c2u-stagger>*:nth-child(9){animation-delay:.27s}
    .c2u-stagger>*:nth-child(10){animation-delay:.30s}
    .c2u-stagger>*:nth-child(11){animation-delay:.33s}
    .c2u-stagger>*:nth-child(12){animation-delay:.36s}

    .c2u-footer{text-align:center;padding:clamp(20px,4vw,32px) 16px;font-size:0.75rem;color:var(--c2u-text-secondary);letter-spacing:0.05em}
    .c2u-footer-accent{display:inline-block;width:24px;height:2px;background:var(--c2u-primary);border-radius:1px;margin-bottom:12px;opacity:0.5}

    @media(max-width:640px){
      [class*="col-span-"]{grid-column:1/-1}
      .c2u-chart-wrap{max-height:220px}
    }
  `;
}

/* ------------------------------------------------------------------ */
/*  Component Renderer                                                 */
/* ------------------------------------------------------------------ */

function renderComponent(comp: Component): string {
  if (!comp || !comp.type) return '';
  const t = comp.type;
  const p = comp.props || {};
  const children = (comp.children || []).map(renderComponent).join('\n');

  switch (t) {
    case 'container':
      return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 c2u-stagger">${children}</div>`;

    case 'row':
      return `<div class="grid ${responsiveGridCols(p.cols || 12)} gap-${p.gap || 4} mb-6 c2u-stagger">${children}</div>`;

    case 'column':
      return `<div class="col-span-${p.span || 1}">${children}</div>`;

    case 'card':
      return `
        <div class="c2u-card ${p.class || ''}">
          ${p.title ? `<div class="c2u-card-header">
            <h3 style="font-family:'Newsreader',Georgia,serif;font-size:1.1rem;font-weight:500;color:var(--c2u-text-heading);margin:0">${esc(p.title)}</h3>
            ${p.subtitle ? `<p style="color:var(--c2u-text-secondary);font-size:0.85rem;margin-top:4px">${esc(p.subtitle)}</p>` : ''}
          </div>` : ''}
          <div class="c2u-card-body">${children}</div>
        </div>`;

    case 'tabs': {
      const tabs: Array<{ id: string; label: string; children?: Component[] }> = p.tabs || [];
      return `
        <div x-data="{ activeTab: '${escJs(tabs[0]?.id || '')}' }">
          <div class="c2u-tabs-nav">
            ${tabs.map(tab => `
              <button @click="activeTab = '${escJs(tab.id)}'"
                :class="activeTab === '${escJs(tab.id)}' ? 'c2u-tab-active' : ''"
                class="c2u-tab-btn">${esc(tab.label)}</button>
            `).join('')}
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
            <div x-data="{ open: ${i === 0 ? 'true' : 'false'} }" class="c2u-accordion-item">
              <button @click="open = !open" class="c2u-accordion-trigger">
                <span>${esc(item.title)}</span>
                <svg :class="open ? 'rotate-180' : ''" style="width:18px;height:18px;color:var(--c2u-text-secondary);transition:transform 0.2s ease" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div x-show="open" x-transition class="c2u-accordion-body">
                ${(item.children || []).map(renderComponent).join('\n')}
              </div>
            </div>
          `).join('')}
        </div>`;
    }

    case 'stat':
      return `
        <div class="c2u-stat">
          <div class="flex items-center justify-between">
            <div>
              <div class="c2u-stat-label">${esc(p.label || '')}</div>
              <div class="c2u-stat-value">${esc(String(p.value || ''))}</div>
              ${p.change != null ? `<div class="c2u-stat-change ${Number(p.change) >= 0 ? 'c2u-up' : 'c2u-down'}">
                ${Number(p.change) >= 0 ? '\u2191' : '\u2193'} ${esc(String(Math.abs(Number(p.change))))}%
              </div>` : ''}
            </div>
            ${p.icon ? `<div class="c2u-stat-icon">${esc(String(p.icon))}</div>` : ''}
          </div>
        </div>`;

    case 'table': {
      const columns: ColumnDef[] = p.columns || [];
      const rows: Record<string, any>[] = p.rows || [];
      return `
        <div x-data="{ search: '', sort: '', asc: true, page: 0, perPage: ${p.perPage || 10} }" class="overflow-hidden">
          ${p.searchable !== false ? `
          <div class="mb-4 relative">
            <svg style="position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--c2u-text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input x-model="search" type="text" placeholder="Search..." class="c2u-search">
          </div>` : ''}
          <div class="c2u-table-wrap overflow-x-auto">
            <table class="c2u-table">
              <thead><tr>
                ${columns.map(col => `
                  <th @click="sort === '${escJs(col.key)}' ? asc = !asc : (sort = '${escJs(col.key)}', asc = true)">
                    ${esc(col.label || col.key)}
                    <span x-show="sort === '${escJs(col.key)}'" x-text="asc ? ' \u2191' : ' \u2193'" style="color:var(--c2u-primary)"></span>
                  </th>
                `).join('')}
              </tr></thead>
              <tbody>
                ${rows.map((row, i) => `
                  <tr ${p.searchable !== false ? `x-show="${columns.map(c => `String($el.closest('table').querySelectorAll('tbody tr')[${i}]?.textContent || '').toLowerCase().includes(search.toLowerCase())`).join(' || ')} || search === ''"` : ''}>
                    ${columns.map(col => `<td>${formatCell(row[col.key], col)}</td>`).join('')}
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
        <div class="c2u-chart-wrap" style="height:${height}px">
          <canvas id="${chartId}"></canvas>
        </div>
        <script>
          (function(){
            var ctx=document.getElementById('${chartId}').getContext('2d');
            new Chart(ctx,{type:'${chartType}',data:${chartData},options:${chartOptions}});
          })();
        </script>`;
    }

    case 'button': {
      const variantMap: Record<string, string> = {
        secondary: 'c2u-btn-secondary',
        danger: 'c2u-btn-danger',
        outline: 'c2u-btn-outline',
      };
      return `<button class="c2u-btn ${variantMap[p.variant] || 'c2u-btn-primary'}">${esc(p.label || 'Button')}</button>`;
    }

    case 'text-field':
      return `
        <div class="mb-4">
          ${p.label ? `<label class="c2u-label">${esc(p.label)}</label>` : ''}
          <input type="${p.inputType || 'text'}" placeholder="${esc(p.placeholder || '')}" value="${esc(p.value || '')}" class="c2u-input">
        </div>`;

    case 'select':
      return `
        <div class="mb-4">
          ${p.label ? `<label class="c2u-label">${esc(p.label)}</label>` : ''}
          <select class="c2u-input">
            ${(p.options || []).map((opt: any) => `<option value="${esc(opt.value || opt)}">${esc(opt.label || opt)}</option>`).join('')}
          </select>
        </div>`;

    case 'image': {
      const imgSrc = (p.src || '').replace(/^\s*javascript:/i, '');
      return `<img src="${esc(imgSrc)}" alt="${esc(p.alt || '')}" class="c2u-image" loading="lazy">`;
    }

    case 'markdown':
      return `<div class="c2u-prose max-w-none">${sanitizeHtml(p.content || '')}</div>`;

    case 'code':
      return `<pre class="c2u-code"><code class="language-${p.language || 'text'}">${esc(p.content || '')}</code></pre>`;

    case 'html':
      return sanitizeHtml(p.content || '');

    case 'text':
      return `<p class="text-${p.size || 'base'} ${p.class || ''} ${p.bold ? 'font-bold' : ''}" style="${p.class ? '' : 'color:var(--c2u-text)'}">${esc(p.content || '')}</p>`;

    case 'divider':
      return `<hr class="c2u-divider">`;

    case 'spacer':
      return `<div class="h-${p.size || 4}"></div>`;

    case 'header':
      return `
        <div class="c2u-header c2u-animate">
          <h1 class="c2u-header-title">${esc(p.title || '')}</h1>
          ${p.subtitle ? `<p class="c2u-header-subtitle">${esc(p.subtitle)}</p>` : ''}
          <div class="c2u-header-rule"></div>
        </div>`;

    case 'link': {
      const href = (p.href || '#').replace(/^\s*javascript:/i, '#');
      return `<a href="${esc(href)}" target="${p.target || '_blank'}" rel="noopener noreferrer" class="c2u-link">${esc(p.label || p.href || 'Link')}</a>`;
    }

    case 'icon': {
      const iconSize = parseInt(String(p.size), 10) || 24;
      return `<span class="material-icons" style="font-size:${iconSize}px;color:var(--c2u-text-secondary)">${esc(String(iconName(p.name)))}</span>`;
    }

    case 'video': {
      const videoSrc = (p.url || '').replace(/^\s*javascript:/i, '');
      return `
        <video src="${esc(videoSrc)}" controls style="border-radius:var(--c2u-radius-sm);width:100%;max-width:42rem" preload="metadata"
          ${p.poster ? `poster="${esc(p.poster)}"` : ''}>Your browser does not support the video tag.</video>`;
    }

    case 'audio-player':
      return `
        <div class="c2u-audio">
          <audio src="${esc(p.url || '')}" controls class="flex-1 h-10"></audio>
          ${p.description ? `<span style="font-size:0.85rem;color:var(--c2u-text-secondary);flex-shrink:0">${esc(p.description)}</span>` : ''}
        </div>`;

    case 'list':
      return `
        <div class="flex ${p.direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} gap-${p.gap || 2}
          ${p.align === 'center' ? 'items-center' : p.align === 'end' ? 'items-end' : p.align === 'stretch' ? 'items-stretch' : 'items-start'}">
          ${children}
        </div>`;

    case 'modal': {
      const triggerChild = comp.children?.[0] ? renderComponent(comp.children[0]) : `<button class="c2u-btn c2u-btn-primary">${esc(p.triggerLabel || 'Open')}</button>`;
      const contentChildren = (comp.children || []).slice(1).map(renderComponent).join('\n');
      return `
        <div x-data="{ open: false }">
          <div @click="open = true" class="cursor-pointer inline-block">${triggerChild}</div>
          <template x-teleport="body">
            <div x-show="open" x-transition.opacity class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
              <div class="c2u-modal-backdrop" @click="open = false"></div>
              <div class="c2u-modal-panel" @click.stop>
                <button @click="open = false" class="c2u-modal-close">&times;</button>
                ${p.title ? `<h3 style="font-family:'Newsreader',Georgia,serif;font-size:1.15rem;font-weight:500;color:var(--c2u-text-heading);margin:0 0 16px">${esc(p.title)}</h3>` : ''}
                ${contentChildren || '<p style="color:var(--c2u-text-secondary)">Modal content</p>'}
              </div>
            </div>
          </template>
        </div>`;
    }

    case 'checkbox': {
      const cbId = `cb_${Math.random().toString(36).slice(2, 8)}`;
      return `
        <label for="${cbId}" class="flex items-center gap-2 cursor-pointer select-none mb-2">
          <input id="${cbId}" type="checkbox" ${p.value ? 'checked' : ''} class="c2u-checkbox">
          <span style="font-size:0.875rem;color:var(--c2u-text)">${esc(p.label || '')}</span>
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
          <div class="mb-4">
            ${p.label ? `<label class="c2u-label">${esc(p.label)}</label>` : ''}
            <div class="flex flex-wrap gap-2">
              ${options.map(opt => {
                const sel = selected.includes(opt.value);
                return `<button class="c2u-chip ${sel ? 'c2u-chip-active' : ''}">${esc(opt.label || opt.value)}</button>`;
              }).join('\n')}
            </div>
          </div>`;
      }

      return `
        <fieldset class="mb-4">
          ${p.label ? `<legend class="c2u-label">${esc(p.label)}</legend>` : ''}
          <div class="space-y-2">
            ${options.map((opt) => {
              const inputType = isMulti ? 'checkbox' : 'radio';
              const sel = selected.includes(opt.value);
              return `<label class="flex items-center gap-2 cursor-pointer">
                <input type="${inputType}" name="${cpId}" value="${esc(opt.value)}" ${sel ? 'checked' : ''} class="c2u-checkbox">
                <span style="font-size:0.875rem;color:var(--c2u-text)">${esc(opt.label || opt.value)}</span>
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
        <div class="mb-4" x-data="{ val: ${val} }">
          ${p.label ? `<label class="c2u-label">
            ${esc(p.label)} <span style="color:var(--c2u-primary);font-family:'Source Code Pro',monospace" x-text="val"></span>
          </label>` : ''}
          <input id="${sliderId}" type="range" min="${min}" max="${max}" x-model="val" class="c2u-slider">
          <div class="flex justify-between mt-1" style="font-size:0.7rem;color:var(--c2u-text-secondary);font-family:'Source Code Pro',monospace">
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
        <div class="mb-4">
          ${p.label ? `<label for="${dtId}" class="c2u-label">${esc(p.label)}</label>` : ''}
          <input id="${dtId}" type="${inputType}" value="${esc(normalizeDateValue(p.value, inputType))}"
            ${p.min ? `min="${esc(normalizeDateValue(p.min, inputType))}"` : ''} ${p.max ? `max="${esc(normalizeDateValue(p.max, inputType))}"` : ''}
            class="c2u-input">
        </div>`;
    }

    default:
      return `<!-- unknown component: ${t} -->`;
  }
}

/* ------------------------------------------------------------------ */
/*  Cell Formatter                                                     */
/* ------------------------------------------------------------------ */

function formatCell(value: any, col: ColumnDef): string {
  if (value === null || value === undefined) return '-';
  if (col.format === 'currency') return `$${Number(value).toLocaleString()}`;
  if (col.format === 'percent') return `${value}%`;
  if (col.format === 'badge') {
    const badgeColor = col.badgeMap?.[value] || 'info';
    return `<span class="c2u-badge c2u-badge-${badgeColor}">${esc(String(value))}</span>`;
  }
  return esc(String(value));
}
