// collect.js: measures the design of the most-visited websites, for the design reference.
//
//   node docs/design-reference/collect.js <tranco-top.csv> <work-folder> [how-many=1000]
//
// Reads a Tranco ranking (rank,domain per line, from https://tranco-list.eu), skips adult and
// gambling sites, skips country copies of the same site (google.de when google.com is done),
// then opens each homepage at phone and desktop size and measures colours, fonts, text sizes,
// buttons, header, content width and what is on the first screen. Sites that don't load, block
// automated browsers or have no real page (server addresses) are skipped, never worked around.
//
// Writes <work-folder>/sites.jsonl (one line per site) and small screenshots in
// <work-folder>/shots/. It can be stopped and run again: finished sites are not redone.
// Screenshots stay in the work folder: only the summary goes in the toolkit (see summarise.js).

const fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');

const [csvFile, workDir, wantedArg] = process.argv.slice(2);
if (!csvFile || !workDir) { console.error('Usage: node collect.js <tranco-top.csv> <work-folder> [how-many]'); process.exit(1); }
const wanted = Number(wantedArg || 1000);
const maxRank = wanted * 4;          // stop looking after this rank, even if short of the target
const parallel = 6;
const loadTimeoutMs = 25000;
const settleMs = 2500;

// Domains whose name shows adult or gambling content are never opened.
const blockedWords = ['porn', 'xxx', 'sex', 'xvideo', 'xhamster', 'hentai', 'nude', 'nsfw', 'escort', 'onlyfans',
  'chaturbate', 'stripchat', 'bongacams', 'livejasmin', 'cam4', 'camsoda', 'myfreecams', 'erotic', 'adult', 'fap',
  'tube8', 'redtube', 'youporn', 'spankbang', 'eporner', 'rule34', 'e621', 'casino', 'poker', 'gambl', 'bet365',
  'betway', 'betfair', 'williamhill', 'paddypower', 'skybet', 'stake.', 'roobet', '1xbet', 'bet9ja', 'sportybet',
  'betika', 'lottery', 'slots', 'jackpot'];
const isBlockedName = domain => blockedWords.some(w => domain.includes(w)) || /(^|\.)bet[a-z0-9-]*\./.test(domain);

// "google" for google.com, google.co.uk and google.de, so country copies count once.
const brandOf = domain => {
  const parts = domain.split('.');
  const shortSuffix = parts.length > 2 && parts[parts.length - 2].length <= 3 && parts[parts.length - 1].length === 2;
  return parts[parts.length - (shortSuffix ? 3 : 2)] || domain;
};

// The site a visitor actually lands on, e.g. "microsoft" for www.microsoft.com/en-gb/.
const landingOf = url => { try { return brandOf(new URL(url).hostname.replace(/^www\./, '')); } catch { return url; } };

// Runs inside the page and returns the measurements for one screen size.
function measurePage() {
  const vw = innerWidth, vh = innerHeight;
  const style = el => getComputedStyle(el);
  const isShown = el => { const r = el.getBoundingClientRect(), s = style(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05; };
  const isClear = c => !c || c === 'transparent' || /rgba\(\d+, \d+, \d+, 0\)$/.test(c);
  const backgroundOf = el => { while (el) { const c = style(el).backgroundColor; if (!isClear(c)) return c; el = el.parentElement; } return 'rgb(255, 255, 255)'; };
  const median = list => { const s = list.filter(n => Number.isFinite(n)).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const mostCommon = (list, top = 1) => { const n = {}; list.forEach(v => { if (v) n[v] = (n[v] || 0) + 1; }); return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, top).map(e => e[0]); };
  const firstFont = f => (f || '').split(',')[0].replace(/["']/g, '').trim();
  const px = v => parseFloat(v) || 0;

  // Main text: elements with their own run of words, weighted by how much text they hold.
  const textEls = [...document.querySelectorAll('p, li, td, dd, span, a, div, article, section')]
    .filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 25) && isShown(e)).slice(0, 500);
  const sizeWeight = {}, fontWeight = {}, colourWeight = {}, lineHeights = [];
  textEls.forEach(e => {
    const s = style(e), chars = e.textContent.trim().length;
    sizeWeight[s.fontSize] = (sizeWeight[s.fontSize] || 0) + chars;
    fontWeight[firstFont(s.fontFamily)] = (fontWeight[firstFont(s.fontFamily)] || 0) + chars;
    colourWeight[s.color] = (colourWeight[s.color] || 0) + chars;
    if (s.lineHeight !== 'normal') lineHeights.push(px(s.lineHeight) / px(s.fontSize));
  });
  const heaviest = w => Object.entries(w).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Biggest heading on the first screen.
  const headings = [...document.querySelectorAll('h1, h2, [class*=title], [class*=headline]')]
    .filter(e => isShown(e) && e.getBoundingClientRect().top < vh && e.textContent.trim().length > 2);
  const bigHeading = headings.sort((a, b) => px(style(b).fontSize) - px(style(a).fontSize))[0];

  // Buttons and links.
  const buttons = [...document.querySelectorAll('button, [role=button], input[type=submit], a[class*=btn], a[class*=button], a[class*=cta]')]
    .filter(e => isShown(e) && e.getBoundingClientRect().height >= 20).slice(0, 80);
  const buttonFills = buttons.map(b => style(b).backgroundColor).filter(c => !isClear(c));
  const linkColours = [...document.querySelectorAll('a')].filter(isShown).slice(0, 200).map(a => style(a).color);

  // Header: the bar touching the top of the page.
  const top = document.elementFromPoint(vw / 2, 8);
  const header = top && (top.closest('header, nav, [role=banner], [class*=header], [id*=header]') || null);
  const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : null;
  const navLinksShown = [...document.querySelectorAll('header a, nav a')].filter(a => isShown(a) && a.getBoundingClientRect().top < 150).length;
  const hasMenuButton = !![...document.querySelectorAll('button, [role=button], a')].find(b => isShown(b) && b.getBoundingClientRect().top < 150 && /menu|navigation|hamburger/i.test((b.getAttribute('aria-label') || '') + ' ' + (b.className || '') + ' ' + (b.id || '')));

  // Content width: how wide paragraphs of text are allowed to get.
  const paraWidths = [...document.querySelectorAll('p')].filter(p => isShown(p) && p.textContent.trim().length > 80).slice(0, 60).map(p => Math.round(p.getBoundingClientRect().width));
  const containerWidths = [...document.querySelectorAll('main, [class*=container], [class*=wrapper], [class*=content]')].filter(isShown).slice(0, 60)
    .map(e => Math.round(e.getBoundingClientRect().width)).filter(w => w < vw - 20 && w > 300);

  // First screen: is there a large picture or video, and is the main heading visible?
  const media = [...document.querySelectorAll('img, video, picture, [style*=background-image]')].filter(isShown).map(e => e.getBoundingClientRect())
    .filter(r => r.top < vh && r.width * r.height > vw * vh * 0.2);

  const rating = (document.querySelector('meta[name=rating]')?.content || '').toLowerCase();
  const adultLabel = /adult|rta-5042|mature/.test(rating) || document.documentElement.innerHTML.includes('RTA-5042-1996-1400-1577-RTA');

  return {
    title: document.title.slice(0, 120), lang: document.documentElement.lang || null, adultLabel,
    textChars: (document.body.innerText || '').length,
    bodyBackground: backgroundOf(document.querySelector('main') || document.body),
    pageBackground: backgroundOf(document.elementFromPoint(vw / 2, vh * 0.6)),
    headerBackground: header ? backgroundOf(header) : null,
    textColour: heaviest(colourWeight), bodyFont: heaviest(fontWeight), bodySize: heaviest(sizeWeight) ? px(heaviest(sizeWeight)) : null,
    lineHeight: median(lineHeights),
    headingFont: bigHeading ? firstFont(style(bigHeading).fontFamily) : null,
    headingSize: bigHeading ? px(style(bigHeading).fontSize) : null,
    headingWeight: bigHeading ? Number(style(bigHeading).fontWeight) : null,
    buttonCount: buttons.length, buttonHeight: median(buttons.map(b => b.getBoundingClientRect().height)),
    buttonRadius: median(buttons.map(b => px(style(b).borderTopLeftRadius))),
    buttonTextSize: median(buttons.map(b => px(style(b).fontSize))),
    buttonFills: mostCommon(buttonFills, 3), linkColour: mostCommon(linkColours)[0] || null,
    headerHeight, navLinksShown, hasMenuButton, paragraphWidth: median(paraWidths), containerWidth: median(containerWidths),
    bigMediaOnFirstScreen: media.length > 0, headingOnFirstScreen: !!bigHeading,
    pageScreens: Math.round(document.documentElement.scrollHeight / vh * 10) / 10,
    sidewaysScroll: document.documentElement.scrollWidth > vw + 2,
  };
}

async function measureSite(browser, domain, rank) {
  const sizes = { phone: devices['iPhone 13'], desktop: { viewport: { width: 1366, height: 900 } } };
  const result = { rank, domain, measuredOn: new Date().toISOString().slice(0, 10) };
  for (const [name, options] of Object.entries(sizes)) {
    const context = await browser.newContext({ ...options, locale: 'en-GB', ignoreHTTPSErrors: false });
    const page = await context.newPage();
    try {
      const response = await page.goto('https://' + domain + '/', { waitUntil: 'domcontentloaded', timeout: loadTimeoutMs });
      if (!response || response.status() >= 400) throw new Error('status ' + (response ? response.status() : 'none'));
      await page.waitForTimeout(settleMs);
      let m;
      try { m = await page.evaluate(measurePage); }
      catch (e) {   // the page moved on to another address while loading: wait, then measure once more
        if (!/context was destroyed|navigation/i.test(e.message)) throw e;
        await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(settleMs);
        m = await page.evaluate(measurePage);
      }
      if (m.adultLabel) { result.skipped = 'adult label'; await context.close(); return result; }
      if (m.textChars < 60) throw new Error('no real page');
      result.finalUrl = page.url();
      result[name] = m;
      await page.screenshot({ path: path.join(workDir, 'shots', `${rank}-${domain}-${name}.jpg`), type: 'jpeg', quality: 55 });
    } catch (e) {
      result.skipped = String(e.message || e).split('\n')[0].slice(0, 120);
      await context.close();
      return result;
    }
    await context.close();
  }
  return result;
}

async function main() {
  fs.mkdirSync(path.join(workDir, 'shots'), { recursive: true });
  const outFile = path.join(workDir, 'sites.jsonl');
  const done = new Map();
  if (fs.existsSync(outFile)) fs.readFileSync(outFile, 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); done.set(r.domain, r); });
  const usable = () => [...done.values()].filter(r => r.phone && r.desktop).length;
  const finishedOk = [...done.values()].filter(r => r.phone && r.desktop);
  const seenBrands = new Set(finishedOk.map(r => brandOf(r.domain)));
  const seenLandings = new Set(finishedOk.map(r => landingOf(r.finalUrl)));

  const queue = fs.readFileSync(csvFile, 'utf8').split('\n').slice(0, maxRank).map(l => l.trim().split(','))
    .filter(([rank, domain]) => domain && !done.has(domain)).map(([rank, domain]) => ({ rank: Number(rank), domain }));

  const browser = await chromium.launch();
  let next = 0;
  async function worker() {
    while (next < queue.length && usable() < wanted) {
      const { rank, domain } = queue[next++];
      let r;
      if (isBlockedName(domain)) r = { rank, domain, skipped: 'blocked name' };
      else if (seenBrands.has(brandOf(domain))) r = { rank, domain, skipped: 'same site as one already measured' };
      else {
        seenBrands.add(brandOf(domain));
        r = await measureSite(browser, domain, rank).catch(e => ({ rank, domain, skipped: 'error ' + e.message }));
        if (!(r.phone && r.desktop)) seenBrands.delete(brandOf(domain));
        else if (seenLandings.has(landingOf(r.finalUrl))) r = { rank, domain, skipped: 'lands on a site already measured: ' + r.finalUrl };
        else seenLandings.add(landingOf(r.finalUrl));
      }
      done.set(domain, r);
      fs.appendFileSync(outFile, JSON.stringify(r) + '\n');
      if (r.phone && r.desktop) process.stdout.write(`${usable()}/${wanted} usable (rank ${rank} ${domain})\n`);
    }
  }
  await Promise.all(Array.from({ length: parallel }, worker));
  await browser.close();
  console.log(`Finished: ${usable()} usable sites measured.`);
}

main();
