// engine/themes/dark-premium.js: the look of the site, driven by content.js "brand".
// With brand.palette set, the whole site is coloured from that palette (see palettes.js).
// Without it, the older plain dark or light palette is used with one accent colour.
const palettes = require('./palettes');

const PALETTES = {
  dark: {
    bg: '#050507', 'bg-alt': '#0B0D11', card: '#121419', line: '#262A31', ink: '#EEF0F2', muted: '#A7AEB7', outline: '#7E8792',
    'head-bg': '#050507', 'head-ink': '#EEF0F2', 'head-muted': '#A7AEB7', 'head-line': '#262A31',
    'hero-bg': '#050507', 'hero-ink': '#FFFFFF', 'hero-muted': '#C4CAD1', 'hero-fade': '5, 5, 7',
    'strip-bg': '#121419', 'strip-ink': '#EEF0F2', 'strip-muted': '#A7AEB7', 'strip-line': '#262A31',
    'foot-bg': '#050507', 'foot-ink': '#EEF0F2', 'foot-muted': '#A7AEB7', 'foot-line': '#262A31',
    'bar-bg': 'rgba(5, 5, 7, .94)', 'bar-line': '#262A31', hover: 'rgba(238, 240, 242, .07)',
  },
  light: {
    bg: '#FFFFFF', 'bg-alt': '#F4F5F7', card: '#FFFFFF', line: '#DDE1E6', ink: '#15181D', muted: '#535B66', outline: '#737B87',
    'head-bg': '#FFFFFF', 'head-ink': '#15181D', 'head-muted': '#535B66', 'head-line': '#DDE1E6',
    'hero-bg': '#FFFFFF', 'hero-ink': '#15181D', 'hero-muted': '#535B66', 'hero-fade': '255, 255, 255',
    'strip-bg': '#F4F5F7', 'strip-ink': '#15181D', 'strip-muted': '#535B66', 'strip-line': '#DDE1E6',
    'foot-bg': '#15181D', 'foot-ink': '#F2F3F5', 'foot-muted': '#B3B9C1', 'foot-line': '#30343B',
    'bar-bg': 'rgba(255, 255, 255, .96)', 'bar-line': '#DDE1E6', hover: 'rgba(21, 24, 29, .05)',
  },
};

const FONTS = {
  modern: { body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', head: 'inherit', weight: 700, spacing: '-0.01em' },
  classic: { body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', head: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif', weight: 600, spacing: '0' },
  friendly: { body: 'ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI", Roboto, Arial, sans-serif', head: 'ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Trebuchet MS", "Segoe UI", sans-serif', weight: 700, spacing: '0' },
};
const CORNERS = {
  sharp: { sm: '3px', md: '4px', lg: '6px', btn: '4px' },
  soft: { sm: '6px', md: '10px', lg: '14px', btn: '10px' },
  round: { sm: '10px', md: '16px', lg: '24px', btn: '999px' },
};

// Colour contrast (WCAG)
const rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const hex = (c) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const darken = (h, t) => mix(h, '#000000', t);

// The nearest shade of the accent that is readable on every background it's used on
function fixAccent(accent, mode) {
  const p = PALETTES[mode], target = mode === 'dark' ? '#FFFFFF' : '#000000';
  for (let t = 0; t <= 1; t += .02) {
    const c = mix(accent, target, t);
    if ([p.bg, p['bg-alt'], p.card].every(b => contrast(c, b) >= 4.6)) return c;
  }
  return target;
}
function accentProblem(accent, mode) {
  const p = PALETTES[mode];
  const worst = Math.min(...[p.bg, p['bg-alt'], p.card].map(b => contrast(accent, b)));
  return worst >= 4.5 ? null : { ratio: worst, suggestion: fixAccent(accent, mode) };
}

// The colours a site uses: its named palette, or the older plain palette plus accent.
function paletteFor(brand) {
  const named = brand.palette && palettes.buildPalette(brand.palette);
  if (named) return { mode: named.mode, vars: named.vars, accent: named.accentText, button: named.accentButton };
  const mode = brand.mode === 'light' ? 'light' : 'dark';
  return { mode, vars: PALETTES[mode], accent: brand.accent, button: brand.accent };
}

function themeCss(brand, usesWhatsAppButton) {
  const chosen = paletteFor(brand), mode = chosen.mode;
  const p = chosen.vars, f = FONTS[brand.font] || FONTS.modern, r = CORNERS[brand.corners] || CORNERS.soft;
  const accent = chosen.accent;
  // Main button: WhatsApp keeps an accessible green; other methods use the palette's accent
  const button = usesWhatsAppButton ? { bg: '#0B7A55', ink: '#FFFFFF' } : palettes.buttonColours(chosen.button);
  const btnBg = button.bg, btnInk = button.ink;
  const footAccent = contrast(accent, p['foot-bg']) >= 4.5 ? accent : p['foot-muted'];
  const stripAccent = contrast(accent, p['strip-bg']) >= 3 ? accent : p['strip-ink'];
  const vars = { ...p, accent, 'btn-bg': btnBg, 'btn-hover': darken(btnBg, .14), 'btn-ink': btnInk, 'foot-accent': footAccent, 'strip-accent': stripAccent,
    font: f.body, 'font-head': brand.fontFile ? `"${brand.fontName}", ${f.body}` : (f.head === 'inherit' ? f.body : f.head), 'head-weight': f.weight, 'head-spacing': f.spacing,
    'r-sm': r.sm, 'r-md': r.md, 'r-lg': r.lg, 'r-btn': r.btn };
  const lines = Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const face = brand.fontFile ? `@font-face { font-family: "${brand.fontName}"; src: url("fonts/${brand.fontFile.split('/').pop()}") format("woff2"); font-display: swap; font-weight: 400 800; }\n` : '';
  return `/* Generated from content.js "brand". Change colours and style there, not here. */\n${face}:root {\n  color-scheme: ${mode};\n${lines}\n}\n`;
}

module.exports = { PALETTES, FONTS, CORNERS, contrast, accentProblem, themeCss, paletteFor, LIBRARY: palettes.LIBRARY };
