const { esc, keepEnd } = require('../lib');
module.exports = (x) => {
  const h = x.c.hero, hasPhoto = h.photo && x.images[h.photo];
  const second = h.secondary && h.secondary.label ? `<a class="btn btn--ghost" href="${esc(x.homeLink(h.secondary.href))}">${esc(h.secondary.label)}</a>` : '';
  return `
  <section class="hero${hasPhoto ? '' : ' hero--no-photo'}">
    <div class="container hero-grid">
      ${hasPhoto ? `<div class="hero-media">${x.photo(h.photo, { sizes: '(min-width: 900px) 50vw, 100vw', eager: true })}</div>` : ''}
      <div class="hero-text">
        <h1>${esc(h.heading)}</h1>
        ${h.lead ? `<p class="hero-lead">${keepEnd(h.lead)}</p>` : ''}
        <div class="hero-actions" data-hides-bar>${x.contactBtn()}${second}</div>
        ${h.note ? `<p class="hero-note">${esc(h.note)}</p>` : ''}
      </div>
    </div>
  </section>\n`;
};
