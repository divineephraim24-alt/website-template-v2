const { esc, icon, keepEnd } = require('../lib');

// Work out tile widths so a grid of N columns never has a gap
function fit(tiles, cols) {
  const spans = tiles.map(t => Math.min(t.wide ? 2 : 1, cols));
  let col = 0, last = -1;
  spans.forEach((s, i) => {
    if (col + s > cols) { spans[last] += cols - col; col = 0; }
    col += s; last = i;
    if (col === cols) col = 0;
  });
  if (col > 0 && last >= 0) spans[last] += cols - col;
  return spans;
}
const handle = (url) => { const m = /instagram\.com\/([^/?#]+)/.exec(url || ''); return m ? '@' + m[1] : ''; };

module.exports = (x) => {
  const w = x.c.work, video = w.video && w.video.file ? w.video : null;
  const pairs = w.beforeAfter || [], gallery = w.gallery || [];
  const ba = pairs.length ? `<div class="ba-grid" role="group" aria-label="Before and after photos">${pairs.map(p => `
          <div class="ba-pair">
            <figure class="ba-half">${x.photo(p.before, { sizes: '(min-width: 900px) 320px, 50vw' })}<figcaption class="ba-label">Before</figcaption></figure>
            <figure class="ba-half">${x.photo(p.after, { sizes: '(min-width: 900px) 320px, 50vw' })}<figcaption class="ba-label">After</figcaption></figure>
          </div>`).join('')}
        </div>` : '';
  const vid = video ? `<figure class="feature-video">
          <video id="main-video" src="video/${esc(x.page.videoName)}"${x.page.videoPoster ? ` data-poster="${esc(x.page.videoPoster)}"` : ''} width="720" height="1280" preload="none" playsinline muted aria-label="${esc(video.description || 'Video of our work')}"></video>
          <button class="film-play" type="button" aria-label="Play the video${video.label ? ' (' + esc(video.label) + ')' : ''}">${icon('play')}</button>
          ${video.label ? `<figcaption class="film-label">${esc(video.label)}</figcaption>` : ''}
        </figure>` : '';
  const feature = (vid || ba) ? `<div class="work-feature${vid ? ' work-feature--video' : ''}${vid && !ba ? ' work-feature--solo' : ''}">${vid}${ba}</div>` : '';
  const phone = fit(gallery, 2), desk = fit(gallery, 3);
  const grid = gallery.length ? `<div class="gallery">${gallery.map((t, i) => `
        <figure class="tile${phone[i] === 2 ? ' p2' : ''}${desk[i] > 1 ? ' d' + desk[i] : ''}">${x.photo(t.photo, { sizes: `(min-width: 900px) ${desk[i] * 360}px, ${phone[i] * 50}vw` })}</figure>`).join('')}
      </div>` : '';
  const ig = x.c.social && x.c.social.instagram;
  return x.section('work', `<div class="container">
      <h2 id="work-title">${esc(w.heading)}</h2>
      ${w.intro ? `<p class="section-lead">${keepEnd(w.intro)}</p>` : ''}
      ${feature}
      ${grid}
      ${ig ? `<p class="work-more"><a href="${esc(ig)}" target="_blank" rel="noopener">${icon('instagram')}More of ${x.v('my', 'our')} work on Instagram <span>${esc(handle(ig))}</span></a></p>` : ''}
    </div>`, { labelId: 'work-title' });
};
module.exports.fit = fit;
