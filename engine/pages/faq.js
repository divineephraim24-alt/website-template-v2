const layout = require('./layout');
const { esc, keepEnd } = require('../lib');
function pageHero(x, title, intro, photo, eyebrow) {
  const has = photo && x.images[photo];
  return `
  <section class="page-hero${has ? ' page-hero--photo' : ''}">
    ${has ? `<div class="page-hero-media">${x.photo(photo, { eager: true, decorative: true })}</div>` : ''}
    <div class="container page-hero-text">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h1>${esc(title)}</h1>
      ${intro ? `<p class="section-lead">${keepEnd(intro)}</p>` : ''}
    </div>
  </section>\n`;
}
module.exports = (x) => {
  const f = x.c.faq;
  const groups = f.groups.map(g => `
      ${g.heading ? `<h2 class="group-title">${esc(g.heading)}</h2>` : ''}
      <div class="faq">${g.items.map(i => `<details><summary>${esc(i.q)}</summary><p>${keepEnd(i.a)}</p></details>`).join('')}</div>`).join('');
  const privacy = f.privacy && f.privacy.length ? `<div class="privacy" id="privacy"><h2>Privacy</h2>${f.privacy.map(p => `<p>${keepEnd(p)}</p>`).join('')}</div>` : '';
  const main = pageHero(x, f.title, f.intro, f.photo, f.eyebrow) + `
  <section class="section"><div class="container narrow">${groups}
      ${privacy}
      <div class="page-cta"><p>${esc(f.ctaText || 'Still have a question? Just ask.')}</p>${x.contactBtn({ hides: true })}</div>
  </div></section>\n`;
  return layout(x, { title: `${f.title} | ${x.c.business.name}`, description: f.description || x.c.seo.description, path: '/faq', main });
};
module.exports.pageHero = pageHero;
