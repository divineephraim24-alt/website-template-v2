// summarise.js: turns the measurements from collect.js into the design reference files.
//
//   node docs/design-reference/summarise.js <work-folder> [how-many=1000]
//
// Reads <work-folder>/sites.jsonl, keeps the top sites (by rank) that were measured on both
// phone and desktop, and writes, next to this script:
//   data/sites.csv  one row per site with the main measurements
//   NUMBERS.md      the patterns in plain numbers (text sizes, colours, buttons, layout)
// The advice in README.md is written by hand from NUMBERS.md.

const fs = require('fs'), path = require('path');
const [workDir, wantedArg] = process.argv.slice(2);
if (!workDir) { console.error('Usage: node summarise.js <work-folder> [how-many]'); process.exit(1); }
const wanted = Number(wantedArg || 1000);
const here = __dirname;

// Sites removed by hand (see excluded.txt): never counted or listed.
const excluded = new Set(fs.readFileSync(path.join(here, 'excluded.txt'), 'utf8').split('\n')
  .filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim().split(/\s+/)[0]));
const sites = fs.readFileSync(path.join(workDir, 'sites.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
  .filter(r => r.phone && r.desktop && !excluded.has(r.domain)).sort((a, b) => a.rank - b.rank).slice(0, wanted);
const total = sites.length;

// ---------- small helpers ----------
const nums = list => list.filter(n => typeof n === 'number' && Number.isFinite(n)).sort((a, b) => a - b);
const pick = (list, q) => { const s = nums(list); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : null; };
const round = (n, d = 0) => n == null ? '-' : Number(n.toFixed(d));
const share = (count, of = total) => `${Math.round(count / of * 100)}%`;
const spread = (list, unit = ' px') => `${round(pick(list, 0.5))}${unit} (most between ${round(pick(list, 0.25))} and ${round(pick(list, 0.75))}${unit})`;
const rgbOf = c => /^rgba?\(/.test(c || '') ? c.match(/[\d.]+/g).slice(0, 3).map(Number) : null;   // other formats (oklab etc.) are skipped
const luminance = c => { const v = rgbOf(c); return v ? (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 : null; };
const hslOf = c => {
  const v = rgbOf(c); if (!v) return null;
  const [r, g, b] = v.map(x => x / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};
const colourFamily = c => {
  const x = hslOf(c); if (!x) return null;
  if (x.s < 0.15 || x.l < 0.08 || x.l > 0.95) return x.l < 0.5 ? 'black or dark grey' : 'white or light grey';
  const h = x.h;
  return h < 15 || h >= 345 ? 'red' : h < 45 ? 'orange' : h < 70 ? 'yellow or gold' : h < 160 ? 'green' : h < 195 ? 'teal' : h < 255 ? 'blue' : h < 290 ? 'purple' : 'pink';
};
const tally = (list, top = 10) => {
  const n = {}; list.filter(Boolean).forEach(v => { n[v] = (n[v] || 0) + 1; });
  return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, top);
};
const systemFonts = /^(-apple-system|blinkmacsystemfont|system-ui|ui-sans-serif|segoe ui|roboto|helvetica|helvetica neue|arial|sans-serif|sf pro|\.sf|san francisco)/i;
const serifFonts = /(serif|georgia|times|garamond|merriweather|playfair|lora|baskerville|caslon|bodoni|didot|tiempos|charter|cambria|libre baskerville|source serif|noto serif|pt serif|domine|crimson|spectral)/i;
const isSerif = f => f && serifFonts.test(f) && !/sans/i.test(f);
const cornerStyle = r => r == null ? null : r <= 2 ? 'sharp (0 to 2 px)' : r <= 12 ? 'soft (3 to 12 px)' : 'round (13 px or more, including pill)';

const P = sites.map(s => s.phone), D = sites.map(s => s.desktop);

// ---------- data/sites.csv ----------
const columns = ['rank', 'domain', 'finalUrl', 'measuredOn',
  'desktop.bodyBackground', 'desktop.pageBackground', 'desktop.textColour', 'desktop.bodyFont', 'desktop.headingFont', 'phone.bodySize', 'desktop.bodySize',
  'phone.headingSize', 'desktop.headingSize', 'desktop.headingWeight', 'desktop.lineHeight', 'phone.buttonHeight', 'desktop.buttonRadius',
  'desktop.buttonFills', 'desktop.linkColour', 'phone.headerHeight', 'desktop.headerHeight', 'phone.hasMenuButton',
  'desktop.paragraphWidth', 'desktop.containerWidth', 'phone.bigMediaOnFirstScreen', 'desktop.bigMediaOnFirstScreen', 'phone.pageScreens', 'phone.sidewaysScroll'];
const cell = v => { const t = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
const valueAt = (s, key) => key.split('.').reduce((o, k) => (o == null ? null : o[k]), s);
fs.mkdirSync(path.join(here, 'data'), { recursive: true });
fs.writeFileSync(path.join(here, 'data', 'sites.csv'), [columns.join(','), ...sites.map(s => columns.map(c => cell(valueAt(s, c))).join(','))].join('\n') + '\n');

// ---------- NUMBERS.md ----------
const darkCount = D.filter(d => luminance(d.bodyBackground || d.pageBackground) < 0.35).length;
const pureBlackText = D.filter(d => { const v = rgbOf(d.textColour); return v && v.every(x => x === 0); }).length;
const softText = D.filter(d => { const l = luminance(d.textColour); const v = rgbOf(d.textColour); return l != null && l < 0.35 && !(v && v.every(x => x === 0)); }).length;
const fonts = D.map(d => d.bodyFont);
const customFontCount = fonts.filter(f => f && !systemFonts.test(f)).length;
const serifBody = fonts.filter(isSerif).length, serifHeading = D.filter(d => isSerif(d.headingFont)).length;
const accents = D.map(d => (d.buttonFills || []).map(colourFamily).find(f => f && !/grey/.test(f)) || null);
const accentKnown = accents.filter(Boolean).length;
const radii = D.map(d => cornerStyle(d.buttonRadius));
const phoneButtons = P.map(p => p.buttonHeight).filter(Boolean);
const row = ([name, n], of = total) => `| ${name} | ${n} | ${share(n, of)} |`;

const md = `# The numbers

Measured from the **${total} most-visited different websites** in the Tranco ranking (list ${process.env.TRANCO_ID || 'see README'}),
on ${sites[0]?.measuredOn || ''}, at phone size (iPhone 13, 390 px wide) and desktop size (1366 px wide).
Made by \`summarise.js\`. Don't edit by hand: run it again instead.

"Most between X and Y" means the middle half of sites fall in that range.

## Colours
- Light pages: **${share(total - darkCount)}**. Dark pages: **${share(darkCount)}**.
- Main text in pure black (#000): ${share(pureBlackText)}. In a dark grey or softened black: ${share(softText)}.
- Main button colour (where a site has filled buttons, ${accentKnown} sites):

| Colour family | Sites | Share |
|---|---|---|
${tally(accents).map(r => row(r, accentKnown)).join('\n')}

## Text
- Body text size, phone: **${spread(P.map(p => p.bodySize))}**. Desktop: **${spread(D.map(d => d.bodySize))}**.
- Line spacing (line height ÷ text size): **${round(pick(D.map(d => d.lineHeight), 0.5), 2)}** (most between ${round(pick(D.map(d => d.lineHeight), 0.25), 2)} and ${round(pick(D.map(d => d.lineHeight), 0.75), 2)}).
- Biggest heading on the first screen, phone: **${spread(P.map(p => p.headingSize))}**. Desktop: **${spread(D.map(d => d.headingSize))}**.
- Heading weight: ${tally(D.map(d => d.headingWeight && (d.headingWeight >= 600 ? 'bold (600+)' : d.headingWeight >= 500 ? 'medium (500)' : 'regular (400 or less)'))).map(([k, n]) => `${k} ${share(n)}`).join(', ')}.
- Paragraph width on desktop: **${spread(D.map(d => d.paragraphWidth))}**.

## Fonts
- Use their own (brand or web) font for body text: **${share(customFontCount)}**. Use the device's built-in fonts: ${share(total - customFontCount)}.
- Serif body text: ${share(serifBody)}. Serif main heading: ${share(serifHeading)}.
- Most common body fonts:

| Font | Sites | Share |
|---|---|---|
${tally(fonts, 15).map(r => row(r)).join('\n')}

## Buttons
- Corner style of buttons:

| Corners | Sites | Share |
|---|---|---|
${tally(radii).map(r => row(r, radii.filter(Boolean).length)).join('\n')}

- Button height on phone: **${spread(phoneButtons)}**. At least 44 px (easy to tap): ${share(phoneButtons.filter(h => h >= 44).length, phoneButtons.length)}.
- Button text size on desktop: **${spread(D.map(d => d.buttonTextSize))}**.

## Layout
- Header height, phone: **${spread(P.map(p => p.headerHeight).filter(h => h && h < 300))}**. Desktop: **${spread(D.map(d => d.headerHeight).filter(h => h && h < 300))}**.
- Phone menu behind a menu button: **${share(P.filter(p => p.hasMenuButton).length)}**.
- Main content width on desktop: **${spread(D.map(d => d.containerWidth))}**.
- A large picture or video on the first screen, phone: ${share(P.filter(p => p.bigMediaOnFirstScreen).length)}. Desktop: ${share(D.filter(d => d.bigMediaOnFirstScreen).length)}.
- A clear heading on the first screen, phone: ${share(P.filter(p => p.headingOnFirstScreen).length)}.
- Page length on phone: **${spread(P.map(p => p.pageScreens), ' screens')}**.
- Pages that scroll sideways on a phone (a fault): ${share(P.filter(p => p.sidewaysScroll).length)}.
`;
fs.writeFileSync(path.join(here, 'NUMBERS.md'), md);
console.log(`Summarised ${total} sites into NUMBERS.md and data/sites.csv`);
