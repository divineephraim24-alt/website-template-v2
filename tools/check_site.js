// tools/check_site.js: full testing pass for a client's built website in site/.
// Uses Node and the Chrome already on this computer (nothing to install).
//   node tools/check_site.js .          check a preview build
//   node tools/check_site.js . --live   also require everything a live build needs
//
// 1. Page checks: missing files, broken links, duplicate ids, alt text, image sizes, heading
//    order, leftover placeholders, contact links matching content.js, security and SEO files.
// 2. Slow phone: data used, main content time, layout shift, video not downloading early.
// 3. Layout: no sideways scrolling at 320, 390, 768, 1366, 1920 and 200% zoom; tap target sizes.
// 4. Keyboard: every control reachable, visibly focused and not hidden.
// 5. Reduced motion, the 404 page, and nothing blocked by the security policy.

const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
const { spawn } = require('child_process');
const { ukIntl } = require('../engine/lib');

const args = process.argv.slice(2), LIVE = args.includes('--live');
const CLIENT = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const SITE = path.join(CLIENT, 'site');
if (!fs.existsSync(path.join(SITE, 'index.html'))) { console.error('No built site found. Run first:  node tools/build_site.js .'); process.exit(1); }
const c = require(path.join(CLIENT, 'client', 'content.js'));
const k = c.contact, DOMAIN = c.business.domain;

let problems = 0, warnings = 0;
const ok = m => console.log('  ok    ' + m);
const bad = m => { problems++; console.log('  FAIL  ' + m); };
const warn = m => { warnings++; console.log('  note  ' + m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- 1. page checks
console.log('\n1. Page checks');
const pages = fs.readdirSync(SITE).filter(f => f.endsWith('.html'));
const external = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join(SITE, page), 'utf8');
  const fails = [];
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupes = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  if (dupes.length) fails.push('duplicate ids: ' + dupes.join(', '));

  const missing = [];
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src|data-poster)="([^"]+)"/g)) {
    const ref = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|tel:|mailto:)/.test(ref)) { if (/^https?:/.test(ref) && !ref.includes(DOMAIN)) external.add(ref.split('?')[0]); continue; }
    const [file, hash] = ref.split('#');
    let target = file === '' ? page : file.replace(/^\//, '');
    if (target === '') target = 'index.html';
    if (!fs.existsSync(path.join(SITE, target))) { missing.push(ref); continue; }
    if (hash) {
      const t = target === page ? html : fs.readFileSync(path.join(SITE, target), 'utf8');
      if (!t.includes(`id="${hash}"`)) missing.push(ref);
    }
  }
  if (missing.length) fails.push('broken links or files: ' + missing.join(', '));

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  if (imgs.some(t => !/\salt="/.test(t))) fails.push('image without alt text');
  if (imgs.some(t => !/\swidth="/.test(t) || !/\sheight="/.test(t))) fails.push('image without width/height');

  const levels = [...html.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
  if (levels.filter(l => l === 1).length !== 1) fails.push('must have exactly one main heading');
  if (levels.some((l, i) => i > 0 && l > levels[i - 1] + 1)) fails.push('skipped heading level');

  if ([...html.matchAll(/<a\b[^>]*href="https:\/\/(?!wa\.me)[^"]*"[^>]*>/g)].some(m => !/target="_blank"/.test(m[0]))) fails.push('external link not opening in a new tab');
  if ([...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].some(m => !/rel="[^"]*noopener/.test(m[0]))) fails.push('new-tab link without noopener');
  if (/\sstyle="/.test(html)) fails.push('inline style attribute (blocked by the security policy)');
  if (html.includes('[[')) fails.push('placeholder text left on the page');
  const visibleText = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  if (/\b(NaN|undefined)\b/.test(visibleText)) fails.push('broken value on the page (shows NaN or undefined): check prices and other numbers in content.js');

  const wa = [...html.matchAll(/href="https:\/\/wa\.me\/(\d+)/g)].map(m => m[1]);
  if (k.whatsapp && k.whatsapp.on ? wa.some(n => n !== ukIntl(k.whatsapp.number)) : wa.length) fails.push('WhatsApp link wrong or switched off');
  const tel = [...html.matchAll(/href="tel:([^"]+)"/g)].map(m => m[1]);
  if (k.phone && k.phone.on ? tel.some(t => t !== '+' + ukIntl(k.phone.number)) : tel.length) fails.push('phone link wrong or switched off');
  const mail = [...html.matchAll(/href="mailto:([^"?]+)/g)].map(m => m[1]);
  if (k.email && k.email.on ? mail.some(a => a !== k.email.address) : mail.length) fails.push('email link wrong or switched off');
  if (!(k.booking && k.booking.on) && k.booking && k.booking.url && !k.booking.url.includes('[[') && html.includes(k.booking.url)) fails.push('booking link shown while switched off');

  const hasBanner = html.includes('class="draft-banner"');
  if (!!c.status.wordingDraft !== hasBanner) fails.push('draft banner does not match status.wordingDraft');
  if (LIVE && (hasBanner || (page !== '404.html' && /name="robots" content="noindex"/.test(html)))) fails.push('still marked as draft or hidden from Google');
  fails.length ? fails.forEach(f => bad(`${page}: ${f}`)) : ok(`${page}: links, images, headings and contact details all correct`);
}

const headersText = fs.readFileSync(path.join(SITE, '_headers'), 'utf8');
for (const h of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Cross-Origin-Opener-Policy'])
  if (!headersText.includes(h + ':')) bad(`_headers is missing ${h}`);
ok('security headers file has all 7 headers');
const hasVideo = fs.existsSync(path.join(SITE, 'video'));
hasVideo === fs.existsSync(path.join(SITE, '_worker.js')) ? ok(hasVideo ? 'iPhone video worker included' : 'no video, so no worker needed') : bad('video and _worker.js do not match');
if (LIVE) {
  fs.existsSync(path.join(SITE, 'sitemap.xml')) ? ok('sitemap.xml present') : bad('sitemap.xml missing');
  /:project\.pages\.dev/.test(headersText) && !/^\/\*[\s\S]*?X-Robots-Tag[\s\S]*?^\/images/m.test(headersText) ? ok('live site can be indexed; pages.dev address hidden from Google') : bad('indexing rules in _headers are wrong for a live build');
} else {
  /X-Robots-Tag: noindex/.test(headersText) ? ok('preview is hidden from Google') : bad('preview is not hidden from Google');
}
// Secrets, forms, cookies and policies (every file the site publishes)
const allFiles = [];
(function walk(d) { for (const n of fs.readdirSync(d, { withFileTypes: true })) { if (n.name === '.git') continue; const p = path.join(d, n.name); n.isDirectory() ? walk(p) : allFiles.push(p); } })(SITE);
const textFiles = allFiles.filter(f => /\.(html|js|css|json|txt|xml)$/.test(f) || path.basename(f) === '_headers');
const SECRET_PATTERNS = [
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key'], [/\bsk-[A-Za-z0-9_-]{20,}/, 'OpenAI-style secret key'], [/\bsk_live_[0-9A-Za-z]{10,}/, 'Stripe secret key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'], [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'], [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'], [/\b(api[_-]?key|secret|password|access[_-]?token)\s*[:=]\s*["'][^"'\s]{8,}["']/i, 'key or password written in the code'],
];
const leaks = [];
for (const f of textFiles) { const t = fs.readFileSync(f, 'utf8'); for (const [re, what] of SECRET_PATTERNS) if (re.test(t)) leaks.push(`${what} in ${path.relative(SITE, f)}`); }
leaks.length ? leaks.forEach(l => bad(`possible secret in the published site: ${l}. Remove it and change (rotate) that key.`)) : ok('no API keys, tokens or passwords in the published files');

const htmlAll = pages.map(p => [p, fs.readFileSync(path.join(SITE, p), 'utf8')]);
const forms = htmlAll.filter(([, h]) => /<form\b/i.test(h)).map(([p]) => p);
forms.length ? bad(`contact form found on ${forms.join(', ')}. The toolkit has no spam protection or form handling: add both (e.g. Cloudflare Turnstile) before using forms`) : ok('no forms, so no spam protection needed');
const scriptsText = textFiles.filter(f => /\.(html|js)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const trackers = ['document.cookie', 'googletagmanager.com', 'google-analytics.com', 'gtag(', 'fbq(', 'connect.facebook.net', 'hotjar', 'clarity.ms'].filter(s => scriptsText.includes(s));
trackers.length ? bad(`cookies or tracking found (${trackers.join(', ')}). Add a cookie consent banner first, and update the privacy text`) : ok('no cookies or tracking, so no cookie banner needed');

const home = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
const policyChecks = [['Privacy', /href="[^"]*(privacy\.html|faq\.html#privacy)"/], ['Terms and conditions', /href="[^"]*terms\.html"/], ['Refunds and cancellations', /href="[^"]*refunds\.html"/]];
for (const [name, re] of policyChecks) re.test(home) ? ok(`${name} linked from every page footer`) : (LIVE ? bad : warn)(`no ${name} page linked in the footer (see "policies" in content.js)`);

const robotsTxt = fs.existsSync(path.join(SITE, 'robots.txt')) ? fs.readFileSync(path.join(SITE, 'robots.txt'), 'utf8') : '';
if (!robotsTxt) bad('robots.txt missing');
else if (/^\s*Disallow:\s*\/\s*$/m.test(robotsTxt)) bad('robots.txt blocks Google from the whole site');
else if (LIVE && !/^Sitemap:\s*https:\/\//m.test(robotsTxt)) bad('robots.txt does not point to the sitemap');
else ok(LIVE ? 'robots.txt lets Google in and points to the sitemap' : 'robots.txt does not block Google');

if (external.size) { console.log('\n  External links (open these by hand on the phone checklist):'); [...external].forEach(u => console.log('        ' + u)); }

// ---------------------------------------------------------------- test server
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
const headerRules = [];
{
  let cur = null;
  for (const line of headersText.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; headerRules.push(cur); }
    else if (cur) { const i = line.indexOf(':'); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
}
const headersFor = (url) => {
  const h = {};
  for (const { pattern: p, headers } of headerRules) if (p.startsWith('/') && (p.endsWith('*') ? url.startsWith(p.slice(0, -1)) : url === p)) Object.assign(h, headers);
  delete h['Strict-Transport-Security'];
  if (h['Content-Security-Policy']) h['Content-Security-Policy'] = h['Content-Security-Policy'].replace('; upgrade-insecure-requests', '');   // the test server is plain http
  return h;
};
const server = http.createServer((q, r) => {
  const url = decodeURIComponent(q.url.split('?')[0]);
  let p = url.endsWith('/') ? url + 'index.html' : url;
  if (!path.extname(p)) p += '.html';                // clean addresses, like Cloudflare Pages
  const f = path.join(SITE, p);
  if (!f.startsWith(SITE) || !fs.existsSync(f) || !fs.statSync(f).isFile()) {
    r.writeHead(404, { 'Content-Type': 'text/html', ...headersFor(url) });
    return fs.createReadStream(path.join(SITE, '404.html')).pipe(r);
  }
  const head = { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', ...headersFor(url) };
  const size = fs.statSync(f).size, range = /bytes=(\d*)-(\d*)/.exec(q.headers.range || '');
  if (range) {
    const start = range[1] ? +range[1] : 0, end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
    r.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(f, { start, end }).pipe(r);
  }
  r.writeHead(200, { ...head, 'Content-Length': size });
  fs.createReadStream(f).pipe(r);
});

const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(p => fs.existsSync(p));

async function browserChecks(PORT) {
  if (!CHROME) { bad('Chrome or Edge not found, so browser checks did not run'); return; }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'site-check-'));
  const dport = 9800 + Math.floor(Math.random() * 150);
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--mute-audio', `--remote-debugging-port=${dport}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  try {
    let targets;
    for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${dport}/json/list`)).json(); if (targets.some(t => t.type === 'page')) break; } catch {} await sleep(200); }
    const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });
    let id = 0; const pending = new Map(), listeners = new Set();
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listeners.forEach(l => l(m)); };
    const send = (method, params = {}) => new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
    const evalJs = async e => { const x = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return x.result && x.result.result ? x.result.result.value : undefined; };
    const go = async (url, settle = 500) => {
      const loaded = new Promise(r => { const l = m => { if (m.method === 'Page.loadEventFired') { listeners.delete(l); r(); } }; listeners.add(l); });
      await send('Page.navigate', { url }); await Promise.race([loaded, sleep(45000)]); await sleep(settle);
    };
    const size = (width, height, mobile, scale = 2) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile, screenWidth: width, screenHeight: height });

    await send('Page.enable'); await send('Network.enable', { maxTotalBufferSize: 0 }); await send('Log.enable'); await send('Runtime.enable');
    const blocked = [], jsErrors = [];
    listeners.add(m => {
      const t = (m.params && ((m.params.entry && m.params.entry.text) || (m.params.args && m.params.args.map(a => a.value).join(' ')))) || '';
      if (/Content Security Policy|Refused to/i.test(t)) blocked.push(t.slice(0, 160));
      if (m.method === 'Runtime.exceptionThrown') jsErrors.push(String(m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text).slice(0, 160));
    });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lcp=0;window.__cls=0;
      new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});` });

    const live = pages.filter(p => p !== '404.html').sort((a, b) => (b === 'index.html') - (a === 'index.html'));
    const base = `http://127.0.0.1:${PORT}/`;

    // ---- 2. slow phone
    console.log('\n2. Simulated phone on slow 4G');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await size(390, 844, true);
    let bytes = 0, files = []; const byUrl = new Map();
    listeners.add(m => {
      if (m.method === 'Network.requestWillBeSent') { byUrl.set(m.params.requestId, m.params.request.url); files.push(m.params.request.url); }
      if (m.method === 'Network.loadingFinished') bytes += m.params.encodedDataLength;
    });
    for (const page of live) {
      bytes = 0; files = [];
      await go(base + (page === 'index.html' ? '' : page), 2500);
      const lcp = await evalJs('window.__lcp'), cls = await evalJs('window.__cls'), kb = Math.round(bytes / 1024);
      const line = `${page}: ${kb} KB, main content ${(lcp / 1000).toFixed(1)} s, layout shift ${cls.toFixed(3)}`;
      if (kb > 1536) bad(`${page}: first screen downloads ${kb} KB (target under 1.5 MB)`);
      else if (cls > 0.1) bad(`${page}: layout shift ${cls.toFixed(3)} (target under 0.1)`);
      else if (lcp > 2500) warn(line + ' (good is under 2.5 s)');
      else ok(line);
      if (files.some(f => f.endsWith('.mp4'))) bad(`${page}: video downloaded before being played`);
    }
    await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await send('Emulation.setCPUThrottlingRate', { rate: 1 });

    if (hasVideo) {
      await go(base, 400); files = [];
      await evalJs('(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}})()');
      await sleep(600);
      files.some(f => f.endsWith('.mp4')) ? bad('video downloaded without being played') : ok('video waits until it is played');
      await evalJs(`(async()=>{const b=document.querySelector('.film-play');b.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,200));b.click();})()`);
      await sleep(2500);
      const v = await evalJs(`(()=>{const v=document.getElementById('main-video');return {t:v.currentTime,c:v.controls,h:document.querySelector('.film-play').hidden}})()`);
      v && v.t > 0 && v.c && v.h ? ok('pressing play starts the video and shows controls') : bad('play button test: ' + JSON.stringify(v));
    }

    // ---- 3. layout
    console.log('\n3. Layout at every screen size');
    const SIZES = [[320, 640, true], [390, 844, true], [768, 1024, true], [1366, 768, false], [1920, 1080, false], [683, 384, false]];
    for (const [w, h, mobile] of SIZES) {
      await size(w, h, mobile, 1);
      const fails = [];
      for (const page of [...live, '404.html']) {
        await go(base + (page === 'index.html' ? '' : page), 120);
        const r = await evalJs(`(()=>{
          const vw=document.documentElement.clientWidth, wide=document.documentElement.scrollWidth>vw;
          const over=[...document.querySelectorAll('main *, header *, footer *')].filter(e=>{ if(e.closest('.table-wrap,.reviews')) return false; const b=e.getBoundingClientRect(); return b.width>0 && b.right>vw+1 && getComputedStyle(e).position!=='fixed'; }).slice(0,2).map(e=>e.tagName+'.'+e.className);
          const small=[...document.querySelectorAll('.btn,.header-quick,.bar-alt,.film-play,.header-nav a,.footer-list a,summary,.brand')].filter(e=>{ const b=e.getBoundingClientRect(); const s=getComputedStyle(e); return b.width>0 && s.visibility!=='hidden' && s.display!=='none' && (b.height<43.5 || b.width<43.5); }).slice(0,3).map(e=>(e.className||e.tagName)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
          return {wide,over,small};
        })()`);
        if (r.wide) fails.push(`${page}: sideways scroll ${r.over.join(', ')}`);
        if (r.small.length) fails.push(`${page}: tap target too small: ${r.small.join(', ')}`);
      }
      fails.length ? fails.forEach(f => bad(`${w}x${h} ${f}`)) : ok(`${w}x${h}: no sideways scrolling, tap targets at least 44px`);
    }

    // ---- 4. keyboard + 5. reduced motion
    console.log('\n4. Keyboard and reduced motion');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    for (const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]) {
      await size(w, h, mobile, 1);
      for (const page of live) {
        await go(base + (page === 'index.html' ? '' : page), 300);
        await evalJs('document.activeElement && document.activeElement.blur(); scrollTo(0,0)');
        const issues = new Set(); let count = 0;
        for (let i = 0; i < 160; i++) {
          await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
          await sleep(35);
          const f = await evalJs(`(()=>{
            const e=document.activeElement; if(!e||e===document.body) return {end:true};
            window.__seen=window.__seen||new WeakSet(); if(window.__seen.has(e)) return {end:true}; window.__seen.add(e);
            const s=getComputedStyle(e), b=e.getBoundingClientRect();
            const name=(e.tagName+' '+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,28));
            const outline=(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none';
            const X=Math.min(Math.max(b.left+b.width/2,1),innerWidth-2), Y=Math.min(Math.max(b.top+Math.min(b.height,60)/2,1),innerHeight-2);
            const off=b.bottom<=0||b.top>=innerHeight||b.right<=0||b.left>=innerWidth||b.width===0;
            const t=document.elementFromPoint(X,Y);
            const covered=!off&&!(t&&(t===e||e.contains(t)||t.contains(e)));
            return {name,outline,off,covered,by:t?t.tagName+'.'+t.className:''};
          })()`);
          if (!f || f.end) { if (count) break; continue; }
          count++;
          if (!f.outline) issues.add(`no visible focus on ${f.name}`);
          if (f.off) issues.add(`off screen: ${f.name}`);
          if (f.covered) issues.add(`hidden behind ${f.by}: ${f.name}`);
        }
        issues.size ? [...issues].slice(0, 5).forEach(m => bad(`${w}px ${page}: ${m}`)) : ok(`${w}px ${page}: all ${count} controls reachable, focused and visible`);
      }
    }
    await size(390, 844, true, 1);
    await go(base, 300);
    const motion = await evalJs(`(()=>{const longest=[...document.querySelectorAll('*')].map(e=>{const s=getComputedStyle(e);return Math.max(...(s.animationName!=='none'?s.animationDuration:'0s').split(',').map(parseFloat),...s.transitionDuration.split(',').map(parseFloat))}).reduce((a,b)=>Math.max(a,b),0);return {smooth:getComputedStyle(document.documentElement).scrollBehavior==='smooth',longest}})()`);
    !motion.smooth && motion.longest <= 0.02 ? ok('reduced motion respected (no smooth scroll or animation)') : bad('reduced motion not respected: ' + JSON.stringify(motion));

    // ---- final
    console.log('\n5. Final checks');
    const nf = await fetch(base + 'some-old-page'), nfHtml = await nf.text();
    nf.status === 404 && nfHtml.includes('doesn&#39;t exist') || nf.status === 404 && nfHtml.includes("doesn't exist") ? ok('a wrong address shows the 404 page') : bad('404 page not served');
    blocked.length ? bad('blocked by the security policy: ' + [...new Set(blocked)].join(' | ')) : ok('nothing blocked by the security policy');
    jsErrors.length ? bad('script errors: ' + [...new Set(jsErrors)].join(' | ')) : ok('no script errors');
    ws.close();
  } finally { chrome.kill(); await sleep(400); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} }
}

server.listen(0, '127.0.0.1', () => {
  browserChecks(server.address().port).catch(e => bad('browser checks crashed: ' + e.message)).finally(() => {
    server.close();
    console.log(`\nResult: ${problems} problem(s), ${warnings} note(s).`);
    process.exit(problems ? 1 : 0);
  });
});
