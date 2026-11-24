const layout = require('./layout');
const { pageHero } = require('./faq');
const { esc, keepEnd } = require('../lib');
const { priceList } = require('../sections/price-parts');
function block(x, b) {
  const h = b.heading ? `<h2 class="group-title">${esc(b.heading)}</h2>` : '';
  if (b.type === 'text') return `<div class="block">${h}${String(b.text || '').split(/\n\s*\n/).map(p => `<p>${keepEnd(p.trim())}</p>`).join('')}</div>`;
  if (b.type === 'list') return `<div class="block">${h}<ul class="ticks">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
  if (b.type === 'prices') return `<div class="block">${h}${priceList(b.items)}${b.note ? `<p class="small-print">${keepEnd(b.note)}</p>` : ''}</div>`;
  if (b.type === 'photos') return `<div class="block">${h}<div class="photo-grid">${b.photos.map(p => `<figure>${x.photo(p, { sizes: '(min-width: 640px) 33vw, 50vw' })}</figure>`).join('')}</div></div>`;
  return '';
}
module.exports = (x, p) => {
  const main = pageHero(x, p.title, p.intro, p.photo, p.eyebrow) + `
  <section class="section"><div class="container narrow">
      ${p.blocks.map(b => block(x, b)).join('\n      ')}
      <div class="page-cta">${x.contactBtn({ hides: true })}</div>
  </div></section>\n`;
  return layout(x, { title: `${p.title} | ${x.c.business.name}`, description: p.description || p.intro || x.c.seo.description, path: '/' + p.slug, main });
};
