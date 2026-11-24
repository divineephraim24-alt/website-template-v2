// screenshot.js
// Takes screenshots of a website page at real phone and desktop sizes, using the Chrome
// already installed on this computer (no extra installs). Also reports sideways scrolling,
// which should never happen on a phone.
//
// Usage (from the project folder):
//   node tools/screenshot.js <page.html> <output-folder> [name:width:height[:full|:yNNN]] ...
// Example:
//   node tools/screenshot.js site/index.html .tmp/shots phone:390:844 phone-full:390:844:full desktop:1366:900 phone-down:390:844:y1500
//
// "full" captures the whole page top to bottom (the screen size still sets the layout).
// "yNNN" scrolls NNN pixels down the page first, then captures the screen.
// "#id" or "#id+NNN" scrolls to that section (plus NNN px), then captures the screen.

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const [pageArg, outDir, ...shotArgs] = process.argv.slice(2);
if (!pageArg || !outDir || shotArgs.length === 0) {
  console.log('Usage: node tools/screenshot.js <page.html> <output-folder> name:width:height[:full] ...');
  process.exit(1);
}
const chromePath = CHROME_PATHS.find(p => fs.existsSync(p));
if (!chromePath) { console.error('Chrome or Edge not found.'); process.exit(1); }

// a web address (e.g. http://localhost:8080/) or a local file
const url = /^https?:/.test(pageArg) ? pageArg : 'file:///' + path.resolve(pageArg).replace(/\\/g, '/');
const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'site-shot-'));
fs.mkdirSync(outDir, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  try {
    // wait for Chrome's remote-control port
    let targets;
    for (let i = 0; i < 50; i++) {
      try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; }
      catch { await sleep(200); }
    }
    const page = targets && targets.find(t => t.type === 'page');
    if (!page) throw new Error('Could not connect to Chrome.');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map(); const listeners = [];
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
      else if (msg.method) listeners.forEach(l => l(msg));
    };
    const send = (method, params = {}) => new Promise(res => {
      const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
    });
    const waitFor = method => new Promise(res => {
      const l = msg => { if (msg.method === method) { listeners.splice(listeners.indexOf(l), 1); res(msg); } };
      listeners.push(l);
    });

    await send('Page.enable');
    for (const spec of shotArgs) {
      const [name, w, h, full] = spec.split(':');
      const width = +w, height = +h, mobile = width < 900;
      // Pin the screen size and orientation: without this, tall full-page captures sometimes
      // came out rotated (width and height swapped).
      const orientation = width < height ? { type: 'portraitPrimary', angle: 0 } : { type: 'landscapePrimary', angle: 0 };
      await send('Emulation.setDeviceMetricsOverride', {
        width, height, deviceScaleFactor: 1, mobile,
        screenWidth: width, screenHeight: height, screenOrientation: orientation,
      });
      const loaded = waitFor('Page.loadEventFired');
      await send('Page.navigate', { url });
      await loaded;
      await sleep(1200);   // let images and background videos settle

      const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
      if (full && full.startsWith('y')) {
        await evalJs(`window.scrollTo(0, ${parseInt(full.slice(1), 10)}); 0`);
        await sleep(1500);   // let scroll-triggered things (WhatsApp bar, videos) react
      }
      if (full && full.startsWith('#')) {
        // "#id" (optionally "#id+NNN"): scroll so that section's top is at the top of the screen, plus NNN px
        const [sel, extra] = full.split('+');
        await evalJs(`(() => { const el = document.querySelector('${sel}'); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY + ${parseInt(extra || '0', 10)}); return 0; })()`);
        await sleep(1500);
      }
      if (full === 'full') {
        // scroll down the page step by step so photos that load on scroll appear, then back to the top
        await evalJs(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); })()`);
        await sleep(1500);
      }
      const scrollW = await evalJs('document.documentElement.scrollWidth');
      const pageH = await evalJs('document.documentElement.scrollHeight');

      const params = { format: 'png' };
      if (full === 'full') {
        params.captureBeyondViewport = true;
        params.clip = { x: 0, y: 0, width, height: pageH, scale: 1 };
      }
      const shot = await send('Page.captureScreenshot', params);
      const png = Buffer.from(shot.result.data, 'base64');
      // Safety check: a PNG stores its width and height at bytes 16-23. They must match what we asked for.
      const gotW = png.readUInt32BE(16), gotH = png.readUInt32BE(20);
      const wantH = full === 'full' ? pageH : height;
      if (gotW !== width || Math.abs(gotH - wantH) > 2) {
        throw new Error(`${name}: capture came out ${gotW}x${gotH}, expected ${width}x${wantH} (not saved)`);
      }
      const file = path.join(outDir, `${name}.png`);
      fs.writeFileSync(file, png);
      const sideways = scrollW > width ? `SIDEWAYS SCROLL: page is ${scrollW}px wide` : 'no sideways scroll';
      console.log(`${name}: ${width}x${height}${full === 'full' ? ` (full page ${pageH}px)` : ''} -> ${file}  [${sideways}]`);

      // Tap-target check: every visible link/button should be at least 44 x 44 px
      // (links inside a sentence of text are allowed to be smaller, as WCAG permits).
      const small = await evalJs(`(() => {
        const out = [];
        document.querySelectorAll('a[href], button, [role=button], summary').forEach(el => {
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || el.closest('[hidden]')) return;
          if (el.closest('p') && el.closest('p').textContent.trim().length > el.textContent.trim().length + 20) return; // inline text link
          if (el.classList.contains('skip-link')) return;
          if (r.width < 44 || r.height < 44) out.push((el.getAttribute('aria-label') || el.textContent.trim()).slice(0, 40) + ' (' + Math.round(r.width) + 'x' + Math.round(r.height) + ')');
        });
        return out;
      })()`);
      console.log(small.length ? `  small tap targets: ${small.join('; ')}` : '  tap targets: all at least 44x44');
    }
    ws.close();
  } finally {
    chrome.kill();
    await sleep(300);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
