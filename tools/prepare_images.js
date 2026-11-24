// tools/prepare_images.js: makes web-ready COPIES of a client's photos.
// Originals in client/media are only read, never changed.
// For each photo: turns it upright, blurs the listed boxes, crops, makes 1600 and 800 px
// versions (never upscaled) and removes hidden data such as GPS location.
// Results are cached in .cache/images, so unchanged photos are not redone.
//
// Normally the build runs this for you. To run it alone:  node tools/prepare_images.js .

const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawnSync } = require('child_process');

const WIDTHS = [1600, 800];
const DEFAULT_Q = 4;          // JPEG quality for FFmpeg: 2 = best/largest, 31 = worst
const RECIPE = 2;             // raise this if the processing below changes, to refresh the cache

function findFfmpeg() {
  const onPath = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (!onPath.error && onPath.status === 0) return 'ffmpeg';
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(base)) {
    for (const pkg of fs.readdirSync(base).filter(d => /^Gyan\.FFmpeg/i.test(d))) {
      for (const sub of fs.readdirSync(path.join(base, pkg))) {
        const exe = path.join(base, pkg, sub, 'bin', 'ffmpeg.exe');
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  throw new Error('FFmpeg was not found. Install it with:  winget install Gyan.FFmpeg');
}

function runFfmpeg(ffmpeg, args, cwd) {
  const r = spawnSync(ffmpeg, ['-y', '-nostdin', '-v', 'error', ...args], { encoding: 'utf8', cwd, maxBuffer: 1024 * 1024 * 8 });
  if (r.error || r.status !== 0) throw new Error('FFmpeg failed: ' + String((r.error && r.error.message) || r.stderr).trim().slice(0, 600));
}

// Read width and height straight from a JPEG file
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('Could not read the size of ' + file);
}
const pngSize = (file) => { const b = fs.readFileSync(file); return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }; };

const n = (v) => Number(v).toFixed(5);

// Blur happens BEFORE the crop, so blur boxes are always fractions of the whole upright photo.
function filterGraph(p, width) {
  let graph = '[0:v]null[s0]', cur = 's0';
  (p.blur || []).forEach((b, idx) => {
    const i = idx + 1;
    const x0 = Math.max(0, b[0] - 0.4 * b[2]), y0 = Math.max(0, b[1] - 0.5 * b[3]);
    const x1 = Math.min(1, b[0] + 1.4 * b[2]), y1 = Math.min(1, b[1] + 1.5 * b[3]);
    graph += `;[${cur}]split[m${i}][c${i}];[c${i}]crop=w=iw*${n(x1 - x0)}:h=ih*${n(y1 - y0)}:x=iw*${n(x0)}:y=ih*${n(y0)},` +
      `boxblur=lr='min(w,h)/5':lp=3:cr='min(cw,ch)/5':cp=3,format=rgba,` +
      `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(min(min(X,W-1-X),min(Y,H-1-Y))/(0.25*min(W,H)),0,1)'[b${i}];` +
      `[m${i}][b${i}]overlay=x=W*${n(x0)}:y=H*${n(y0)}[s${i}]`;
    cur = 's' + i;
  });
  const steps = [];
  if (p.crop) steps.push(`crop=w=iw*${n(p.crop[2])}:h=ih*${n(p.crop[3])}:x=iw*${n(p.crop[0])}:y=ih*${n(p.crop[1])}`);
  steps.push(`scale='min(${width},iw)':-2:flags=lanczos`);
  return `${graph};[${cur}]${steps.join(',')}[out]`;
}

// Returns { key: { alt, files: [{ file:'images/key-800.jpg', width, height, from:<cache path> }] } }
function prepareImages(clientDir, c, keys, log = () => {}) {
  const ffmpeg = findFfmpeg();
  const cache = path.join(clientDir, '.cache', 'images');
  fs.mkdirSync(cache, { recursive: true });
  const images = {};
  let made = 0, reused = 0;
  for (const key of keys) {
    const p = c.photos[key];
    const src = path.join(clientDir, 'client', 'media', p.file);
    const st = fs.statSync(src);
    const q = p.q || DEFAULT_Q;
    const id = crypto.createHash('sha1').update(JSON.stringify([RECIPE, p.file, st.size, st.mtimeMs, p.crop || null, p.blur || [], q])).digest('hex').slice(0, 16);
    const files = [];
    for (const w of WIDTHS) {
      const out = path.join(cache, `${id}-${w}.jpg`);
      if (fs.existsSync(out)) reused++;
      else {
        runFfmpeg(ffmpeg, ['-i', src, '-filter_complex', filterGraph(p, w), '-map', '[out]', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-frames:v', '1', '-update', '1', '-q:v', String(q), out]);
        made++;
      }
      const size = jpegSize(out);
      if (files.some(f => f.width === size.width)) continue;   // small original: skip the duplicate size
      files.push({ file: `images/${key}-${size.width}.jpg`, width: size.width, height: size.height, from: out });
    }
    images[key] = { alt: p.alt, files };
  }
  log(`Photos: ${keys.length} ready (${made} files made, ${reused} reused).`);
  return images;
}

module.exports = { prepareImages, findFfmpeg, runFfmpeg, jpegSize, pngSize };

if (require.main === module) {
  const dir = path.resolve(process.argv[2] || '.');
  const file = path.join(dir, 'client', 'content.js');
  if (!fs.existsSync(file)) { console.error('No client/content.js in ' + dir); process.exit(1); }
  const c = require(file);
  try { prepareImages(dir, c, Object.keys(c.photos || {}), console.log); }
  catch (e) { console.error(e.message); process.exit(1); }
}
