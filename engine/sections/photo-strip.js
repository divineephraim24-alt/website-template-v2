// engine/sections/photo-strip.js: a row of square photos, usually straight under the top section.
// content.js: sections.photoStrip: true, and photoStrip: { label: 'Photos of our work', photos: ['a', 'b', 'c', 'd', 'e'] }
// Desktop shows them all in one row. Phones show a row you can swipe sideways (the page itself
// never scrolls sideways). Uses 3 to 6 photos, each listed once under "photos" in content.js.
const { esc } = require('../lib');
module.exports = (x) => {
  const s = x.c.photoStrip, photos = (s.photos || []).slice(0, 6);
  return `
  <section class="photo-strip" aria-label="${esc(s.label || 'Photos')}">
    <div class="strip-row" style="--strip-n: ${photos.length}" tabindex="0" role="group" aria-label="${esc(s.label || 'Photos')}">${photos.map(p => `
      <figure class="strip-tile">${x.photo(p, { sizes: '(min-width: 900px) 20vw, 42vw' })}</figure>`).join('')}
    </div>
  </section>\n`;
};
