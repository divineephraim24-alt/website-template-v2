// tools/make_preview_file.js: packs the built site into ONE .html file to send to a client
// (WhatsApp, email). Photos, video, styles and script are all inside it, and any other pages
// are added at the end of the same file.
//   node tools/make_preview_file.js .
// Output: .tmp/<business-name>-website-preview.html

const fs = require('fs'), path = require('path');
const CLIENT = path.resolve(process.argv[2] || '.');
const SITE = path.join(CLIENT, 'site');
if (!fs.existsSync(path.join(SITE, 'index.html'))) { console.error('No built site found. Run first:  node tools/build_site.js .'); process.exit(1); }
const c = require(path.join(CLIENT, 'client', 'content.js'));
const slug = String(c.business.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
const OUT = path.join(CLIENT, '.tmp', `${slug}-website-preview.html`);

const read = f => fs.readFileSync(path.join(SITE, f), 'utf8');
const mime = { '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
const dataUri = rel => {
  const f = path.join(SITE, rel);
  if (!fs.existsSync(f)) throw new Error('Missing file: ' + rel);
  return `data:${mime[path.extname(f)]};base64,${fs.readFileSync(f).toString('base64')}`;
};

let html = read('index.html');
const others = fs.readdirSync(SITE).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== '404.html');

// 1. Other pages become sections at the end of the same file
let extra = '';
for (const f of others) {
  const p = read(f);
  let main = p.slice(p.indexOf('<main id="main">') + '<main id="main">'.length, p.indexOf('</main>'));
  main = main.replace(/<h2\b/g, '<h3').replace(/<\/h2>/g, '</h3>').replace(/<h1\b/, '<h2').replace(/<\/h1>/, '</h2>');
  extra += `\n<div id="page-${f.replace('.html', '')}">${main}</div>\n`;
}
html = html.replace('</main>', () => extra + '</main>');

// 2. Links between pages become jumps within this file
for (const f of others) html = html.split(`href="${f}"`).join(`href="#page-${f.replace('.html', '')}"`);
html = html.replace(/href="index\.html#/g, 'href="#').replace(/href="index\.html"/g, 'href="#main"');

// 3. Remove things that only matter on the real website
html = html.replace(/\s*<link rel="(canonical|icon|apple-touch-icon|preload)"[^>]*>/g, '')
           .replace(/\s*<meta (property="og:|name="twitter:)[^>]*>/g, '');

// 4. Pack the stylesheet and script inside
const css = read('styles.css').replace(/url\("(fonts\/[^"]+)"\)/g, (m, rel) => `url("${dataUri(rel)}")`);
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
           .replace('<script src="script.js" defer></script>', '')
           .replace('</body>', () => `<script>\n${read('script.js')}\n</script>\n</body>`);

// 5. One size of each photo is enough for a preview
html = html.replace(/\s(srcset|sizes|imagesrcset|imagesizes)="[^"]*"/g, '');

// 6. Pack every photo and video inside
const cache = new Map();
html = html.replace(/\s(src|data-poster|poster)="((?:images|video)\/[^"]+)"/g, (m, attr, rel) => {
  if (!cache.has(rel)) cache.set(rel, dataUri(rel));
  return ` ${attr}="${cache.get(rel)}"`;
});

// 7. A banner so nobody mistakes the file for the live site
const safeDomain = String(c.business.domain).replace(/[<>&"]/g, '');
html = html.replace('<body>', () => `<body>\n<div style="background:#15181D;color:#fff;text-align:center;font:600 14px/1.4 system-ui,sans-serif;padding:8px 16px">Preview of ${safeDomain}, not yet live</div>`);
html = html.replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n  <meta name="viewport"');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
const left = (html.match(/\s(src|poster)="(images|video)\//g) || []).length;
const mb = fs.statSync(OUT).size / 1048576;
console.log(`Made ${OUT}: ${mb.toFixed(1)} MB, ${cache.size} photos/videos packed inside, ${left} unpacked.`);
if (mb > 16) console.log('Note: over 16 MB, so WhatsApp may refuse it. Send it by email link or Google Drive instead.');
if (left) process.exit(1);
