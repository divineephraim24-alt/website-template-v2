// _worker.js: a small piece of code Cloudflare Pages runs for the VIDEOS ONLY (see _routes.json).
// It is not published as a file.
//
// Why: Safari (iPhone, iPad, Mac) only plays video if the server can send it in parts
// ("range requests", answered with "206 Partial Content"). Cloudflare Pages always sends the
// whole file instead, so this code reads the video and sends back just the part asked for.
// Every other page, photo and file is served by Pages as normal, with the _headers settings.

const VIDEO_HEADERS = {
  'Cache-Control': 'public, max-age=604800',            // keep for a week (same as _headers)
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000',
  'Accept-Ranges': 'bytes',                              // tells Safari partial downloads work
};

export default {
  async fetch(request, env) {
    try {
      return await serveVideo(request, env);
    } catch (err) {
      // If anything goes wrong, fall back to the normal whole-file answer rather than failing.
      return env.ASSETS.fetch(request);
    }
  },
};

async function serveVideo(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

  // Ask Pages for the whole file (without the Range header), keeping "has it changed?" checks.
  const plain = new Headers(request.headers);
  plain.delete('Range');
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET', headers: plain }));

  const headers = new Headers(VIDEO_HEADERS);
  for (const name of ['Content-Type', 'ETag', 'Last-Modified']) {
    const v = asset.headers.get(name);
    if (v) headers.set(name, v);
  }
  if (asset.status === 304) return new Response(null, { status: 304, headers });
  if (!asset.ok) return asset;                           // e.g. a missing video: pass the 404 through

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const range = request.headers.get('Range');

  // No range asked for: send the whole video.
  if (!range) {
    headers.set('Content-Length', String(size));
    return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
  }

  // One range, in any of the three standard forms: "bytes=0-1023", "bytes=1024-", "bytes=-500".
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start, end;
  if (m && m[1] !== '') {
    start = Number(m[1]);
    end = m[2] !== '' ? Math.min(Number(m[2]), size - 1) : size - 1;
  } else if (m && m[2] !== '') {
    const suffix = Number(m[2]);
    start = Math.max(size - suffix, 0);
    end = size - 1;
  }
  if (start === undefined || start > end || start >= size) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });   // the range asked for doesn't exist
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), { status: 206, headers });
}
