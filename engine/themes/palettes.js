// engine/themes/palettes.js: the colour palettes every client site chooses from.
//
// Set one in content.js:  brand: { palette: 'velvet-forest', ... }
// Each palette colours the whole site (page, alternate sections, cards, text, buttons, the
// reassurance strip and the footer), not just one accent. They come from the owner's reference
// boards in docs/colour-palettes/ (moods: luxury, uptown modern, hip hop, 90s).
//
// Readability is automatic: text colours are checked against WCAG contrast (4.5 for text,
// 3 for outlines), and any colour that would be hard to read is moved to the nearest readable
// shade. So a palette can use neon or pastel colours without breaking the site.
//
// To add a palette: copy one below, give it a new name and mood, and pick its seven colours.
//   mode    'dark' or 'light' (how the page background feels)
//   bg      page background            alt    alternate section background
//   card    cards and panels           ink    main text
//   accent  buttons and links          strip  the reassurance strip under the top section
//   foot    the footer background

const LIBRARY = {
  // ---------- Luxury ----------
  'wine-and-stone': { mood: 'luxury', mode: 'light', source: 'luxuary 163247',
    bg: '#EFE9E1', alt: '#E4DCD2', card: '#F8F5F0', ink: '#322D29', accent: '#72383D', strip: '#D1C7BD', foot: '#322D29' },
  'velvet-forest': { mood: 'luxury', mode: 'dark', source: 'luxuary 163510',
    bg: '#1E3226', alt: '#243A2D', card: '#2A4234', ink: '#F8EDC3', accent: '#CCB363', strip: '#C27E35', foot: '#15241B' },
  'navy-and-gold': { mood: 'luxury', mode: 'dark', source: 'luxuary 163331',
    bg: '#1F3345', alt: '#253B50', card: '#2C4359', ink: '#EFEDE4', accent: '#C78F57', strip: '#89ABAA', foot: '#0B1620' },

  // ---------- Uptown modern ----------
  'fresh': { mood: 'uptown modern', mode: 'light', source: 'luxuary/UPTOWN MODERN 163549',
    bg: '#EFE9E1', alt: '#D0D5CE', card: '#FFFFFF', ink: '#290907', accent: '#6E8658', strip: '#73A1B2', foot: '#290907' },
  'sage-and-peach': { mood: 'uptown modern', mode: 'light', source: 'UPTOWN MODERN 163356',
    bg: '#FEF9F5', alt: '#FCE6D0', card: '#FFFFFF', ink: '#30302E', accent: '#3E4B4A', strip: '#7B9080', foot: '#30302E' },
  'indigo-and-honey': { mood: 'uptown modern', mode: 'light', source: 'UPTOWN MODERN 124823',
    bg: '#FFF9E8', alt: '#FFEDAD', card: '#FFFFFF', ink: '#24163D', accent: '#5A3786', strip: '#A7B0FE', foot: '#3A2460' },

  // ---------- Hip hop ----------
  'street-neon': { mood: 'hip hop', mode: 'dark', source: 'HIPHOP 125219',
    bg: '#231F20', alt: '#2B2627', card: '#342E2F', ink: '#F7F7F2', accent: '#7BF004', strip: '#FC05B8', foot: '#0AA9E0' },
  'graffiti-night': { mood: 'hip hop', mode: 'dark', source: 'HIPHOP 125145',
    bg: '#0F0E0B', alt: '#1A1815', card: '#23201C', ink: '#EFEEEB', accent: '#E68C32', strip: '#56B2AC', foot: '#664D49' },
  'purple-and-gold': { mood: 'hip hop', mode: 'dark', source: 'HIPHOP 125242',
    bg: '#2A0B40', alt: '#35104F', card: '#41155F', ink: '#FFF8E0', accent: '#FFDF01', strip: '#A134BE', foot: '#2825B9' },

  // ---------- 90s ----------
  'fresh-prince': { mood: '90s', mode: 'light', source: '90s vibe 130103',
    bg: '#FFFDF0', alt: '#E3FAFA', card: '#FFFFFF', ink: '#1E0B2E', accent: '#8A2BE2', strip: '#FF1493', foot: '#00CED1' },
  'retro-mint': { mood: '90s', mode: 'light', source: '90s vibe 130129',
    bg: '#F3FFF9', alt: '#E6F6FF', card: '#FFFFFF', ink: '#1F1236', accent: '#49297E', strip: '#00DB96', foot: '#E10086' },
  'retro-sunset': { mood: '90s', mode: 'light', source: '90s vibe 130532',
    bg: '#FBF3E4', alt: '#F5E3BC', card: '#FFFFFF', ink: '#2B1020', accent: '#AD3A6D', strip: '#3A7D9D', foot: '#7F2F75' },
};

// ---------- colour maths (WCAG contrast) ----------
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

// The most readable of the palette's ink, white or near-black on a background.
const textOn = (bgColour, ink) => ['#FFFFFF', '#111111', ink].sort((a, b) => contrast(b, bgColour) - contrast(a, bgColour))[0];

// Move a colour towards `target` until it reaches `ratio` against every background.
function readable(colour, backgrounds, ratio, target) {
  for (let t = 0; t <= 1.0001; t += .02) {
    const c = mix(colour, target, Math.min(t, 1));
    if (backgrounds.every(b => contrast(c, b) >= ratio)) return c;
  }
  return target;
}

// Turns a palette's seven colours into the full set of theme variables.
function buildPalette(name) {
  const p = LIBRARY[name];
  if (!p) return null;
  const surfaces = [p.bg, p.alt, p.card];
  const strongest = textOn(p.bg, p.ink);           // white or near-black: the direction for fixes
  const ink = readable(p.ink, surfaces, 7, strongest);
  const muted = readable(mix(ink, p.bg, .35), surfaces, 4.6, ink);
  const accentText = readable(p.accent, surfaces, 4.6, strongest);
  const band = (fill) => {
    const t = textOn(fill, ink);
    return { ink: t, muted: readable(mix(t, fill, .25), [fill], 4.6, t), line: mix(t, fill, .78) };
  };
  const strip = band(p.strip), foot = band(p.foot);
  const [r, g, b] = rgb(p.bg), [ir, ig, ib] = rgb(ink);
  return {
    mode: p.mode, mood: p.mood, accentButton: p.accent, accentText,
    vars: {
      bg: p.bg, 'bg-alt': p.alt, card: p.card, line: mix(ink, p.bg, .82), ink, muted, outline: readable(mix(ink, p.bg, .5), [p.bg], 3, ink),
      'head-bg': p.bg, 'head-ink': ink, 'head-muted': muted, 'head-line': mix(ink, p.bg, .82),
      'hero-bg': p.bg, 'hero-ink': ink, 'hero-muted': muted, 'hero-fade': `${r}, ${g}, ${b}`,
      'strip-bg': p.strip, 'strip-ink': strip.ink, 'strip-muted': strip.muted, 'strip-line': strip.line,
      'foot-bg': p.foot, 'foot-ink': foot.ink, 'foot-muted': foot.muted, 'foot-line': foot.line,
      'bar-bg': `rgba(${r}, ${g}, ${b}, .95)`, 'bar-line': mix(ink, p.bg, .82), hover: `rgba(${ir}, ${ig}, ${ib}, .07)`,
    },
  };
}

// Button colours: the palette's own accent, with white or dark text, darkened only if neither reads.
function buttonColours(fill) {
  for (let t = 0; t <= 1.0001; t += .04) {
    const c = mix(fill, '#000000', Math.min(t, 1));
    if (contrast('#FFFFFF', c) >= 4.5) return { bg: c, ink: '#FFFFFF' };
    if (t === 0 && contrast('#111111', c) >= 4.5) return { bg: c, ink: '#111111' };
  }
  return { bg: '#000000', ink: '#FFFFFF' };
}

module.exports = { LIBRARY, buildPalette, buttonColours, contrast };
