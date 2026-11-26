// tools/build_site.js: checks client/content.js, then builds the website into site/.
//   node tools/build_site.js .          build a preview (hidden from Google, may show the draft banner)
//   node tools/build_site.js . --live   build for publishing (refuses unless the wording is signed off)
// If anything is wrong it lists the problems in plain English and leaves site/ untouched.

const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto'), os = require('os');
const ENGINE = path.resolve(__dirname, '..', 'engine');
const lib = require(path.join(ENGINE, 'lib'));
const theme = require(path.join(ENGINE, 'themes', 'dark-premium'));
const order = require(path.join(ENGINE, 'order'));
const { createContext, METHODS } = require(path.join(ENGINE, 'context'));
const layout = require(path.join(ENGINE, 'pages', 'layout'));
const homePage = require(path.join(ENGINE, 'pages', 'home'));
const faqPage = require(path.join(ENGINE, 'pages', 'faq'));
const extraPage = require(path.join(ENGINE, 'pages', 'extra'));
const notFoundPage = require(path.join(ENGINE, 'pages', 'notfound'));
const policy = require(path.join(ENGINE, 'pages', 'policy'));
const { prepareImages, findFfmpeg, runFfmpeg, pngSize } = require('./prepare_images');

const SECTION_KEYS = ['hero', 'reassurance', 'services', 'priceTable', 'addons', 'plan', 'work', 'bookingSteps', 'reviews', 'coverage', 'location', 'closing', 'faq'];
const SECTION_ANCHORS = { services: 'services', prices: 'priceTable', addons: 'addons', plan: 'plan', work: 'work', booking: 'bookingSteps', reviews: 'reviews', areas: 'coverage', 'find-us': 'location' };

class Stop extends Error {}
function stop(title, items) {
  console.error(`\nThe build stopped. Nothing in site/ was changed.\n\n${title}\n`);
  items.forEach((m, i) => console.error(`  ${i + 1}. ${m}`));
  console.error('');
  throw new Stop();
}

// ------------------------------------------------------------------ load content.js
function codeOnly(line) {           // a line without its // comment, ignoring // inside quotes
  let q = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = ''; }
    else if (ch === '"' || ch === "'" || ch === '`') q = ch;
    else if (ch === '/' && line[i + 1] === '/') return line.slice(0, i).trim();
  }
  return line.trim();
}
function explainSyntax(err, src, file) {
  const lines = src.split(/\r?\n/);
  const m = /:(\d+)\r?\n/.exec(String(err.stack));
  const at = m ? +m[1] : 0;
  const show = (l) => `line ${l}:   ${(lines[l - 1] || '').trim()}`;
  let prev = at - 1;
  while (prev > 0 && !codeOnly(lines[prev - 1])) prev--;
  const before = prev > 0 ? codeOnly(lines[prev - 1]) : '';
  const msg = err.message;
  let help;
  if (/end of input/i.test(msg)) help = 'A closing bracket } or ] is missing somewhere. Check that every { and [ has a partner, usually near the last thing you edited.';
  else if (/Invalid or unexpected token|unterminated/i.test(msg)) help = `A quote mark is probably missing on ${show(at)}\n     Text must start and end with the same quote. If the text has an apostrophe, wrap it in "double quotes".`;
  else if (before && !/[,{[(]$/.test(before)) help = `Add a comma at the end of ${show(prev)}`;
  else if (at) help = `Something is out of place on ${show(at)}\n     Look for a stray bracket, or a missing quote mark or comma.`;
  else help = msg;
  stop(`${path.basename(file)} has a typing mistake:`, [help]);
}
function loadContent(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { module: { exports: {} } };
  sandbox.exports = sandbox.module.exports;
  try { vm.runInNewContext(src, sandbox, { filename: file, timeout: 2000 }); }
  catch (e) {
    if (e && e.name === 'SyntaxError') explainSyntax(e, src, file);
    stop('content.js could not be read:', [e.message]);
  }
  return { c: JSON.parse(JSON.stringify(sandbox.module.exports)), src };
}

// ------------------------------------------------------------------ what is in use
function usedPhotos(c) {
  const s = c.sections, keys = new Set(), add = (k) => { if (k) keys.add(k); };
  [['hero', 'hero'], ['plan', 'plan'], ['bookingSteps', 'bookingSteps'], ['coverage', 'coverage'], ['location', 'location'], ['closing', 'closing'], ['faq', 'faq']]
    .forEach(([sw, k]) => { if (s[sw] && c[k]) add(c[k].photo); });
  if (s.work) {
    const w = c.work;
    if (w.video && w.video.file) add(w.video.poster);
    (w.beforeAfter || []).forEach(p => { add(p.before); add(p.after); });
    (w.gallery || []).forEach(t => add(t.photo));
  }
  (c.extraPages || []).filter(p => p.on).forEach(p => {
    add(p.photo);
    (p.blocks || []).filter(b => b.type === 'photos').forEach(b => (b.photos || []).forEach(add));
  });
  return [...keys];
}

// ------------------------------------------------------------------ validation
const isHolder = (v) => typeof v === 'string' && v.includes('[[');
const blank = (v) => v == null || String(v).trim() === '';

function findPlaceholders(c, src) {
  const found = [];
  const walk = (v, where) => {
    if (typeof v === 'string') {
      for (const m of v.matchAll(/\[\[(.+?)\]\]/g)) {
        const raw = m[0], count = src.split(raw).length - 1;
        const line = count === 1 ? src.slice(0, src.indexOf(raw)).split('\n').length : 0;
        found.push(`${where}: still says "${m[1]}"${line ? ` (line ${line})` : ''}`);
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where} → item ${i + 1}`));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${where} → ${k}`));
  };
  ['status', 'business', 'social', 'brand', 'seo'].forEach(k => walk(c[k], k));
  METHODS.forEach(m => { if (c.contact && c.contact[m] && c.contact[m].on) walk(c.contact[m], `contact → ${m}`); });
  SECTION_KEYS.forEach(k => { if (c.sections && c.sections[k]) walk(c[k], k); });
  (c.extraPages || []).forEach((p, i) => { if (p.on) walk(p, `extra page ${i + 1}`); });
  policy.policiesOn(c).forEach(p => walk(c.policies[p.key], `policies → ${p.key}`));
  if (policy.privacyMode(c) === 'page') walk(c.faq.privacy, 'faq → privacy (used for the privacy page)');
  usedPhotos(c).forEach(k => { if (c.photos && c.photos[k]) walk(c.photos[k], `photo "${k}"`); });
  return found;
}

function validate(c, clientDir, live) {
  const e = [], w = [];
  const media = (f) => path.join(clientDir, 'client', 'media', f);
  for (const k of ['status', 'business', 'contact', 'brand', 'seo', 'sections']) if (!c[k] || typeof c[k] !== 'object') e.push(`The "${k}" part is missing from content.js. Copy it back from client-starter/content.js.`);
  if (e.length) return { e, w };
  c.social = c.social || {}; c.photos = c.photos || {}; c.extraPages = c.extraPages || [];
  const on = c.sections, b = c.business, k = c.contact;
  const need = (name) => { if (on[name] && (!c[name] || typeof c[name] !== 'object')) { e.push(`The "${name}" section is switched on but its content is missing.`); return false; } return !!on[name]; };

  // Wording sign-off
  if (c.status.wordingDraft === false && blank(c.status.wordingSignedOff)) e.push('wordingDraft is false but wordingSignedOff is empty. Record who approved the wording, how and when.');
  if (live && c.status.wordingDraft !== false) e.push('This is a live build but the wording is still marked as draft. Get the client\'s written sign-off, record it in PLAN.md and in status.wordingSignedOff, then set wordingDraft to false.');
  if (live && blank(c.status.wordingSignedOff)) e.push('This is a live build but status.wordingSignedOff is empty.');

  // Business
  if (blank(b.name)) e.push('business.name is empty.');
  if (!isHolder(b.domain) && !/^(?!www\.)([a-z0-9-]+\.)+[a-z]{2,}$/.test(String(b.domain || ''))) e.push(`business.domain "${b.domain}" isn't valid. Use just the domain, like example.co.uk (no https:// and no www).`);
  if (!/^[A-Z][A-Za-z]+$/.test(String(b.type || ''))) e.push(`business.type "${b.type}" isn't a Google business type. Use one like LocalBusiness, Plumber or HairSalon.`);
  if (!['I', 'we'].includes(b.voice)) e.push(`business.voice must be 'I' or 'we' (it says "${b.voice}").`);
  if (!['sole-trader', 'limited'].includes(b.legalForm)) e.push(`business.legalForm must be 'sole-trader' or 'limited' (it says "${b.legalForm}").`);
  if (b.legalForm === 'limited') {
    const co = b.company || {};
    [['name', 'company name'], ['number', 'company number'], ['registeredIn', 'where it is registered'], ['registeredOffice', 'registered office address']]
      .forEach(([f, t]) => { if (blank(co[f])) e.push(`This is a limited company, so the footer needs the ${t} (business.company.${f}).`); });
  }

  // Contact
  const methodsOn = METHODS.filter(m => k[m] && k[m].on);
  if (!methodsOn.length) e.push('No contact method is switched on. Turn on at least one of WhatsApp, phone, email or booking.');
  else if (!methodsOn.includes(k.main)) e.push(`The main button is "${k.main}" but that contact method is switched off. Switch it on, or set contact.main to one of: ${methodsOn.join(', ')}.`);
  for (const m of ['whatsapp', 'phone']) {
    if (!(k[m] && k[m].on) || isHolder(k[m].number)) continue;
    if (blank(k[m].number)) e.push(`${m} is switched on but has no number.`);
    else if (!/^44[1-9]\d{8,9}$/.test(lib.ukIntl(k[m].number))) e.push(`The ${m} number "${k[m].number}" doesn't look like a UK number. Write it like 07700 900123.`);
  }
  if (k.email && k.email.on && !isHolder(k.email.address) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(k.email.address || ''))) e.push(`The email address "${k.email.address}" isn't valid.`);
  if (k.booking && k.booking.on && !isHolder(k.booking.url) && !/^https:\/\/\S+\.\S+/.test(String(k.booking.url || ''))) e.push(`The booking link "${k.booking.url}" must be a full address starting with https://`);
  for (const s of ['instagram', 'facebook', 'tiktok', 'googleReviews', 'googleLeaveReview']) {
    const u = c.social[s];
    if (u && !isHolder(u) && !/^https:\/\/\S+\.\S+/.test(u)) e.push(`The ${s} link "${u}" must be a full address starting with https://`);
  }

  // Brand
  const br = c.brand;
  if (br.palette) {
    if (!theme.LIBRARY[br.palette]) e.push(`brand.palette "${br.palette}" isn't a palette. Choose one of: ${Object.keys(theme.LIBRARY).join(', ')} (see docs/colour-palettes/README.md).`);
  } else if (!['dark', 'light'].includes(br.mode)) e.push(`brand.mode must be 'dark' or 'light' (it says "${br.mode}").`);
  const layouts = ['split', 'overlay', 'centered', 'mirror', 'editorial'];
  if (br.layout && !layouts.includes(br.layout)) e.push(`brand.layout must be one of: ${layouts.join(', ')} (see docs/06-layouts.md). It says "${br.layout}".`);
  order.orderProblems(br.order).forEach(m => e.push(m));
  // Every site must look different: compare palette, layout and section order with the
  // other client folders next to this one.
  const mine = order.designSignature(c), parent = path.dirname(clientDir);
  for (const name of fs.readdirSync(parent)) {
    const other = path.join(parent, name), file = path.join(other, 'client', 'content.js');
    if (other === clientDir || !fs.existsSync(file)) continue;
    let theirs;
    try { delete require.cache[require.resolve(file)]; theirs = order.designSignature(require(file)); } catch { continue; }
    if (theirs.palette !== mine.palette || theirs.layout !== mine.layout) continue;
    if (theirs.order === mine.order) (live ? e : w).push(`This site would look the same as "${name}": same palette (${mine.palette}), layout (${mine.layout}) and section order. Change brand.palette, brand.layout or brand.order (see docs/06-layouts.md).`);
    else w.push(`Same palette and layout as "${name}" (${mine.palette}, ${mine.layout}), with a different section order. If it's in the same area, change the palette or layout too.`);
  }
  if (!theme.FONTS[br.font]) e.push(`brand.font must be one of: ${Object.keys(theme.FONTS).join(', ')}.`);
  if (!theme.CORNERS[br.corners]) e.push(`brand.corners must be one of: ${Object.keys(theme.CORNERS).join(', ')}.`);
  if (br.palette) { /* the palette sets the accent and checks readability itself */ }
  else if (!/^#[0-9a-fA-F]{6}$/.test(String(br.accent || ''))) e.push(`brand.accent "${br.accent}" isn't a colour code. Use six digits like #2F6FDE.`);
  else if (theme.PALETTES[br.mode]) {
    const p = theme.accentProblem(br.accent, br.mode);
    if (p) e.push(`The accent colour ${br.accent} is too hard to read on a ${br.mode} background (contrast ${p.ratio.toFixed(1)}, needs 4.5). The nearest readable shade is ${p.suggestion}.`);
  }
  if (br.logo && !isHolder(br.logo) && !fs.existsSync(media(br.logo))) e.push(`The logo file "${br.logo}" isn't in client/media.`);
  if (br.fontFile) {
    if (!fs.existsSync(media(br.fontFile))) e.push(`The font file "${br.fontFile}" isn't in client/media.`);
    if (!/\.woff2$/i.test(br.fontFile)) e.push('brand.fontFile must be a .woff2 file.');
    if (blank(br.fontName)) e.push('brand.fontName is needed when a font file is used.');
  }

  // SEO
  if (!isHolder(c.seo.title)) { if (blank(c.seo.title)) e.push('seo.title is empty.'); else if (c.seo.title.length > 65) w.push(`seo.title is ${c.seo.title.length} characters; Google may cut it off after about 60.`); }
  if (!isHolder(c.seo.description)) { if (blank(c.seo.description)) e.push('seo.description is empty.'); else if (c.seo.description.length > 165) w.push(`seo.description is ${c.seo.description.length} characters; Google may cut it off after about 155.`); }

  // Service mode
  if (!['mobile', 'premises', 'both'].includes(c.serviceMode)) e.push(`serviceMode must be 'mobile', 'premises' or 'both' (it says "${c.serviceMode}").`);
  if (['mobile', 'both'].includes(c.serviceMode) && !on.coverage) e.push(`serviceMode is "${c.serviceMode}", so switch on the "coverage" section (where you work).`);
  if (['premises', 'both'].includes(c.serviceMode) && !on.location) e.push(`serviceMode is "${c.serviceMode}", so switch on the "location" section (address and hours).`);
  if (c.serviceMode === 'mobile' && on.location) e.push('serviceMode is "mobile" but the "location" section is on. Switch it off, or use serviceMode \'both\'.');
  if (c.serviceMode === 'premises' && on.coverage) e.push('serviceMode is "premises" but the "coverage" section is on. Switch it off, or use serviceMode \'both\'.');

  // Sections
  if (!on.hero) e.push('The "hero" section must stay on: it holds the page\'s main heading.');
  if (need('hero')) {
    if (blank(c.hero.heading)) e.push('hero.heading is empty.');
    const h = c.hero.secondary;
    if (h && h.label) {
      const target = String(h.href || '').replace(/^#/, '');
      if (!String(h.href || '').startsWith('#') || !SECTION_ANCHORS[target]) e.push(`hero.secondary.href "${h.href}" must be one of: ${Object.keys(SECTION_ANCHORS).map(a => '#' + a).join(', ')}.`);
      else if (!on[SECTION_ANCHORS[target]]) e.push(`The second hero button links to ${h.href}, but the "${SECTION_ANCHORS[target]}" section is off. Change the link, or clear its label.`);
    }
  }
  if (need('reassurance')) {
    if (!(c.reassurance.items || []).length) e.push('The "reassurance" section is on but has no items.');
    (c.reassurance.items || []).forEach((i, n) => { if (i.icon && !lib.ICON_NAMES.includes(i.icon)) e.push(`reassurance item ${n + 1}: unknown icon "${i.icon}". Use one of: home, pin, card, check, clock, star, shield, sparkle, van, leaf, heart.`); });
  }
  const checkPrice = (v, where) => {
    if (typeof v === 'number') { if (!(v > 0)) e.push(`${where}: the price is ${v}. Enter the real price.`); }
    else if (typeof v === 'string' && /^\s*£?\s*\d/.test(v)) e.push(`${where}: write the price as a plain number with no quotes or £ sign, like 45 (it says "${v}").`);
    else if (typeof v === 'string' && !blank(v)) e.push(`${where}: the price must be a plain number like 45 (it says "${v}"). If there is no fixed price, set price to null and put the words in priceText.`);
    else if (blank(v)) e.push(`${where}: the price is empty.`);
  };
  const checkTable = (t, name) => {
    if (!(t.columns || []).length || !(t.rows || []).length) { e.push(`${name}: the table needs at least one column and one row.`); return; }
    t.rows.forEach((r, i) => {
      const prices = r.prices || [];
      if (prices.length !== t.columns.length) e.push(`${name}, row "${r.label || i + 1}": has ${prices.length} price(s) but the table has ${t.columns.length} column(s).`);
      prices.forEach((p, j) => checkPrice(p, `${name}, row "${r.label || i + 1}", column ${j + 1}`));
    });
  };
  if (need('services')) {
    if (!(c.services.items || []).length) e.push('The "services" section is on but has no services.');
    (c.services.items || []).forEach((s, i) => {
      if (blank(s.name)) e.push(`Service ${i + 1} has no name.`);
      if (s.price != null && s.price !== '') checkPrice(s.price, `Service "${s.name}"`);
    });
  }
  if (need('priceTable')) checkTable(c.priceTable, 'Price table');
  if (need('addons')) {
    if (!(c.addons.items || []).length) e.push('The "addons" section is on but has no add-ons.');
    (c.addons.items || []).forEach(a => { if (a.price != null && a.price !== '') checkPrice(a.price, `Add-on "${a.name}"`); else if (blank(a.priceText)) e.push(`Add-on "${a.name}" needs a price or priceText.`); });
  }
  if (need('plan') && c.plan.table && (c.plan.table.rows || []).length) checkTable(c.plan.table, 'Plan table');
  if (need('work')) {
    const w2 = c.work, v = w2.video && w2.video.file ? w2.video : null;
    if (!v && !(w2.beforeAfter || []).length && !(w2.gallery || []).length) e.push('The "work" section is on but has no video or photos.');
    if (v) {
      const f = media(v.file);
      if (!/\.mp4$/i.test(v.file)) e.push(`The video "${v.file}" must be an .mp4 file.`);
      if (!fs.existsSync(f)) e.push(`The video "${v.file}" isn't in client/media.`);
      else if (fs.statSync(f).size > 25 * 1048576) e.push(`The video "${v.file}" is ${(fs.statSync(f).size / 1048576).toFixed(0)} MB. Cloudflare Pages allows 25 MB per file, so compress it first.`);
      else if (fs.statSync(f).size > 15 * 1048576) w.push(`The video "${v.file}" is ${(fs.statSync(f).size / 1048576).toFixed(0)} MB, which is slow on phones. Aim for under 15 MB.`);
      if (blank(v.description)) e.push('The video needs a description (work.video.description) for screen readers.');
    }
  }
  if (need('bookingSteps') && !(c.bookingSteps.steps || []).length) e.push('The "bookingSteps" section is on but has no steps.');
  if (need('reviews')) {
    if (!(c.reviews.items || []).length) e.push('The "reviews" section is on but has no reviews.');
    if (c.reviews.consentConfirmed !== true) e.push('Reviews are on but reviews.consentConfirmed is not true. Only show reviews once each customer has agreed to their name and town being used.');
    (c.reviews.items || []).forEach((r, i) => { if (blank(r.text) || blank(r.name)) e.push(`Review ${i + 1} needs its text and a name.`); });
  }
  if (need('coverage') && !(c.coverage.areas || []).length && blank(c.coverage.intro)) e.push('The "coverage" section needs some areas or an intro.');
  if (need('location')) {
    const l = c.location;
    ['line1', 'town', 'postcode'].forEach(f => { if (blank(l[f])) e.push(`The address needs location.${f}.`); });
    if (l.postcode && !isHolder(l.postcode) && !/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(l.postcode.trim())) e.push(`The postcode "${l.postcode}" doesn't look right. Write it like SW1A 1AA.`);
    if (l.mapUrl && !/^https:\/\//.test(l.mapUrl)) e.push('location.mapUrl must start with https://');
    if (!(l.hours || []).length) e.push('The "location" section needs opening hours.');
    const time = /^([01]\d|2[0-3]):[0-5]\d$/;
    (l.hours || []).forEach((h, i) => {
      if (!lib.parseDays(h.days)) e.push(`Opening hours row ${i + 1}: days "${h.days}" isn't valid. Use e.g. 'Mo-Fr', 'Sa' or 'Mo,We,Fr'.`);
      if (h.closed) return;
      if (!time.test(h.open || '') || !time.test(h.close || '')) e.push(`Opening hours row ${i + 1}: use the 24-hour clock with a colon, like '09:00' and '17:30'.`);
      else if (h.open >= h.close) e.push(`Opening hours row ${i + 1}: the closing time ${h.close} isn't after the opening time ${h.open}.`);
    });
  }
  if (need('closing') && blank(c.closing.heading)) e.push('closing.heading is empty.');
  if (need('faq')) {
    if (!(c.faq.groups || []).some(g => (g.items || []).length)) e.push('The FAQ page is on but has no questions.');
    (c.faq.groups || []).forEach(g => (g.items || []).forEach(i => { if (blank(i.q) || blank(i.a)) e.push(`An FAQ in "${g.heading || 'questions'}" is missing its question or answer.`); }));
  }

  // Policies: privacy, terms and conditions, refunds
  if (!c.policies || typeof c.policies !== 'object') w.push('There is no "policies" part in content.js, so the site has no terms or refund policy. Copy it from client-starter/content.js and fill it in from the client\'s answers.');
  else {
    if (c.policies.privacy && !(c.faq && (c.faq.privacy || []).length)) e.push('policies.privacy is on but faq.privacy is empty. Write the privacy points in faq.privacy (they are used for the privacy page).');
    if (!c.policies.privacy && !(c.sections.faq && c.faq && (c.faq.privacy || []).length)) w.push('The site has no privacy policy. Switch on policies.privacy, or the FAQ page with its privacy section.');
    for (const def of policy.POLICIES) {
      const p = c.policies[def.key];
      if (!p || !p.on) { w.push(`The ${def.label.toLowerCase()} page is switched off (policies.${def.key}).`); continue; }
      if (!(p.sections || []).length) e.push(`policies.${def.key} is on but has no sections. Add the client's ${def.label.toLowerCase()}, or switch it off.`);
      (p.sections || []).forEach((s, i) => { if (blank(s.text)) e.push(`policies.${def.key}, section ${i + 1}${s.heading ? ` ("${s.heading}")` : ''}: the text is empty.`); });
    }
  }

  // Extra pages
  const slugs = new Set(['index', 'faq', '404', 'privacy', 'terms', 'refunds']);
  c.extraPages.filter(p => p.on).forEach((p, i) => {
    const name = `Extra page ${i + 1}${p.title ? ` ("${p.title}")` : ''}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(p.slug || ''))) e.push(`${name}: the slug "${p.slug}" must be lower-case words with dashes, like 'our-menu'.`);
    else if (slugs.has(p.slug)) e.push(`${name}: the slug "${p.slug}" is already used.`);
    else slugs.add(p.slug);
    if (blank(p.title)) e.push(`${name}: needs a title.`);
    if (!(p.blocks || []).length) e.push(`${name}: needs at least one block.`);
    (p.blocks || []).forEach((bl, j) => {
      const at = `${name}, block ${j + 1}`;
      if (!['text', 'list', 'prices', 'photos'].includes(bl.type)) e.push(`${at}: type must be text, list, prices or photos.`);
      if (bl.type === 'text' && blank(bl.text)) e.push(`${at}: the text is empty.`);
      if (bl.type === 'list' && !(bl.items || []).length) e.push(`${at}: the list is empty.`);
      if (bl.type === 'prices') { if (!(bl.items || []).length) e.push(`${at}: the price list is empty.`); (bl.items || []).forEach(a => { if (a.price != null && a.price !== '') checkPrice(a.price, `${at}, "${a.name}"`); }); }
      if (bl.type === 'photos' && !(bl.photos || []).length) e.push(`${at}: no photos listed.`);
    });
  });

  // Photos
  for (const key of usedPhotos(c)) {
    const p = c.photos[key];
    if (!p) { e.push(`The photo "${key}" is used on the page but isn't listed under "photos".`); continue; }
    if (!/^[A-Za-z0-9_-]+$/.test(key)) e.push(`The photo name "${key}" can only use letters, numbers, dashes and underscores.`);
    if (blank(p.file)) e.push(`Photo "${key}" has no file.`);
    else if (!fs.existsSync(media(p.file))) e.push(`Photo "${key}": the file "${p.file}" isn't in client/media.`);
    if (blank(p.alt)) e.push(`Photo "${key}" needs a description (alt) for screen readers and Google.`);
    const box = (v) => Array.isArray(v) && v.length === 4 && v.every(x => typeof x === 'number' && x >= 0 && x <= 1) && v[2] > 0 && v[3] > 0 && v[0] + v[2] <= 1.0001 && v[1] + v[3] <= 1.0001;
    if (p.crop && !box(p.crop)) e.push(`Photo "${key}": crop must be [left, top, width, height] as fractions between 0 and 1.`);
    (p.blur || []).forEach((bx, i) => { if (!box(bx)) e.push(`Photo "${key}": blur box ${i + 1} must be [left, top, width, height] as fractions between 0 and 1.`); });
  }
  return { e, w };
}

// ------------------------------------------------------------------ logo, favicons, link preview image
function brandFiles(c, clientDir, images, outDir, ffmpeg) {
  const imgDir = path.join(outDir, 'images');
  fs.mkdirSync(imgDir, { recursive: true });
  let logo = null, logoFile = null;
  if (c.brand.logo) {
    logoFile = path.join(clientDir, 'client', 'media', c.brand.logo);
    for (const h of [128, 256]) runFfmpeg(ffmpeg, ['-i', logoFile, '-vf', `scale=-2:${h}:flags=lanczos,format=rgba`, '-map_metadata', '-1', '-frames:v', '1', '-update', '1', path.join(imgDir, `logo-${h}.png`)]);
    const s = pngSize(path.join(imgDir, 'logo-128.png'));
    logo = { w128: s.width, h128: s.height };
    const square = (n) => `scale=${n}:${n}:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=${n}:${n}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`;
    runFfmpeg(ffmpeg, ['-i', logoFile, '-vf', square(32), '-map_metadata', '-1', '-frames:v', '1', '-update', '1', path.join(outDir, 'favicon-32.png')]);
    runFfmpeg(ffmpeg, ['-i', logoFile, '-vf', square(180), '-map_metadata', '-1', '-frames:v', '1', '-update', '1', path.join(outDir, 'apple-touch-icon.png')]);
    runFfmpeg(ffmpeg, ['-i', logoFile, '-vf', square(48), '-map_metadata', '-1', '-frames:v', '1', '-update', '1', '-f', 'ico', path.join(outDir, 'favicon.ico')]);
  }

  // Link preview image, 1200 x 630
  const chosen = theme.paletteFor(c.brand), p = chosen.vars, work = fs.mkdtempSync(path.join(os.tmpdir(), 'site-og-'));
  try {
    const name = c.business.name, tag = c.business.tagline || '';
    fs.writeFileSync(path.join(work, 'name.txt'), name);
    fs.writeFileSync(path.join(work, 'tag.txt'), tag);
    const heroImg = c.sections.hero && c.hero.photo && images[c.hero.photo];
    const room = heroImg ? 660 : 1080;
    const fit = (text, max) => Math.max(20, Math.min(max, Math.floor(room / (Math.max(text.length, 1) * 0.56))));
    const args = ['-f', 'lavfi', '-i', `color=c=${p.bg}:s=1200x630:r=1`];
    let graph = '', cur = '0:v', idx = 1;
    if (heroImg) {
      args.push('-i', heroImg.files[0].from);
      graph += `[${idx}:v]scale=420:630:force_original_aspect_ratio=increase,crop=420:630[h];[${cur}][h]overlay=780:0[a];`;
      cur = 'a'; idx++;
    }
    if (logoFile) {
      args.push('-i', logoFile);
      graph += `[${idx}:v]scale=-2:120,format=rgba[l];[${cur}][l]overlay=60:70[b];`;
      cur = 'b'; idx++;
    }
    const bold = "fontfile='C\\:/Windows/Fonts/segoeuib.ttf'", reg = "fontfile='C\\:/Windows/Fonts/segoeui.ttf'";
    graph += `[${cur}]drawbox=x=60:y=268:w=90:h=5:color=${chosen.button}:t=fill,drawtext=${bold}:textfile=name.txt:fontcolor=${p.ink}:fontsize=${fit(name, 60)}:x=60:y=295`;
    if (tag) graph += `,drawtext=${reg}:textfile=tag.txt:fontcolor=${p.muted}:fontsize=${fit(tag, 30)}:x=60:y=385`;
    graph += '[out]';
    runFfmpeg(ffmpeg, [...args, '-filter_complex', graph, '-map', '[out]', '-map_metadata', '-1', '-frames:v', '1', '-update', '1', '-q:v', '3', path.join(imgDir, 'og-image.jpg')], work);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
  return logo;
}

// ------------------------------------------------------------------ _headers, robots, sitemap
function headersFile(live, video) {
  const hash = crypto.createHash('sha256').update(layout.INLINE_JS).digest('base64');
  const csp = `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self'; img-src 'self'; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests`;
  let out = `# Made by tools/build_site.js. Don't edit by hand.
/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
${live ? '' : '  X-Robots-Tag: noindex\n'}
/images/*
  Cache-Control: public, max-age=604800
`;
  if (video) out += `
/video/*
  Cache-Control: public, max-age=604800
`;
  if (live) out += `
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
`;
  return out;
}

// ------------------------------------------------------------------ build
function build(clientDir, live) {
  const file = path.join(clientDir, 'client', 'content.js');
  if (!fs.existsSync(file)) stop('No content file found:', [`Expected ${file}. Run this from a client folder, like:  node tools/build_site.js .`]);
  const { c, src } = loadContent(file);

  if (c.sections && c.contact) {
    const holders = findPlaceholders(c, src);
    if (holders.length) stop(`${holders.length} placeholder(s) still need filling in, or their section switching off, in client/content.js:`, holders);
  }
  const { e, w } = validate(c, clientDir, live);
  if (e.length) stop(`${e.length} thing(s) to fix in client/content.js:`, e);

  const ffmpeg = findFfmpeg();
  const images = prepareImages(clientDir, c, usedPhotos(c), console.log);

  // Everything is checked: build into a temporary folder, then swap into site/
  const outDir = path.join(clientDir, 'site'), temp = path.join(clientDir, '.tmp', 'site-build');
  fs.rmSync(temp, { recursive: true, force: true });
  fs.mkdirSync(path.join(temp, 'images'), { recursive: true });

  for (const im of Object.values(images)) for (const f of im.files) fs.copyFileSync(f.from, path.join(temp, f.file));
  const logo = brandFiles(c, clientDir, images, temp, ffmpeg);

  const video = c.sections.work && c.work.video && c.work.video.file ? c.work.video : null;
  let videoName = '', videoPoster = '';
  if (video) {
    videoName = path.basename(video.file).toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    fs.mkdirSync(path.join(temp, 'video'));
    fs.copyFileSync(path.join(clientDir, 'client', 'media', video.file), path.join(temp, 'video', videoName));
    if (video.poster && images[video.poster]) videoPoster = [...images[video.poster].files].sort((a, b) => a.width - b.width)[0].file;
    for (const f of ['_worker.js', '_routes.json']) fs.copyFileSync(path.join(ENGINE, 'assets', f), path.join(temp, f));
  }
  if (c.brand.fontFile) {
    fs.mkdirSync(path.join(temp, 'fonts'));
    fs.copyFileSync(path.join(clientDir, 'client', 'media', c.brand.fontFile), path.join(temp, 'fonts', path.basename(c.brand.fontFile)));
  }

  fs.writeFileSync(path.join(temp, 'styles.css'), theme.themeCss(c.brand, c.contact.main === 'whatsapp') + '\n' + fs.readFileSync(path.join(ENGINE, 'assets', 'styles.css'), 'utf8'));
  fs.copyFileSync(path.join(ENGINE, 'assets', 'script.js'), path.join(temp, 'script.js'));

  const base = { logo, themeColor: theme.paletteFor(c.brand).vars['head-bg'], videoName, videoPoster };
  const ctx = (file2, extra = {}) => createContext(c, images, { ...base, file: file2, ...extra });
  const write = (name, html) => fs.writeFileSync(path.join(temp, name), html);
  const urls = ['/'];
  write('index.html', homePage(ctx('index.html', { isHome: true })));
  if (c.sections.faq) { write('faq.html', faqPage(ctx('faq.html'))); urls.push('/faq'); }
  for (const p of c.extraPages.filter(x => x.on)) { write(p.slug + '.html', extraPage(ctx(p.slug + '.html'), p)); urls.push('/' + p.slug); }
  if (policy.privacyMode(c) === 'page') { write('privacy.html', policy.privacyPage(ctx('privacy.html'))); urls.push('/privacy'); }
  for (const def of policy.policiesOn(c)) { write(def.slug + '.html', policy.policyPage(ctx(def.slug + '.html'), def)); urls.push('/' + def.slug); }
  write('404.html', notFoundPage(ctx('404.html', { is404: true })));

  const site = 'https://' + c.business.domain;
  write('robots.txt', live ? `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n');
  if (live) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('_headers', headersFile(live, !!video));

  // Swap: clear site/ except its .git folder, then move the new files in
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of fs.readdirSync(outDir)) if (name !== '.git') fs.rmSync(path.join(outDir, name), { recursive: true, force: true });
  for (const name of fs.readdirSync(temp)) fs.cpSync(path.join(temp, name), path.join(outDir, name), { recursive: true });
  fs.rmSync(temp, { recursive: true, force: true });

  w.forEach(m => console.log('Note: ' + m));
  console.log(`Built ${urls.length + 1} page(s) into site/ as ${live ? 'a LIVE build' : 'a PREVIEW (hidden from Google)'}.${c.status.wordingDraft ? ' Draft wording banner is showing.' : ''}`);
}

if (require.main === module) {
  const args = process.argv.slice(2), live = args.includes('--live');
  const dir = path.resolve(args.find(a => !a.startsWith('--')) || '.');
  try { build(dir, live); }
  catch (err) {
    if (!(err instanceof Stop)) { console.error('\nThe build failed: ' + err.message + '\n'); }
    process.exit(1);
  }
}
module.exports = { build, validate, usedPhotos };
