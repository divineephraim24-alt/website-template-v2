const { esc, keepEnd } = require('../lib');
const { table, note } = require('./price-parts');
module.exports = (x) => {
  const p = x.c.plan, hasPhoto = p.photo && x.images[p.photo];
  return x.section('plan', `<div class="container${hasPhoto ? ' split' : ''}">
      ${hasPhoto ? `<figure class="split-media">${x.photo(p.photo, { sizes: '(min-width: 900px) 400px, 100vw' })}</figure>` : ''}
      <div class="split-body">
        ${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ''}
        <h2 id="plan-title">${esc(p.heading)}</h2>
        ${p.intro ? `<p class="section-lead">${keepEnd(p.intro)}</p>` : ''}
        ${p.steps && p.steps.length ? `<ol class="steps">${p.steps.map(s => `<li><strong>${esc(s.title)}</strong>${keepEnd(s.text)}</li>`).join('')}</ol>` : ''}
        ${p.table && p.table.rows && p.table.rows.length ? `<h3 class="sub-title">${esc(p.table.heading || 'Prices')}</h3>${table(p.table, p.table.heading || 'Prices')}` : ''}
        ${note(p.note)}
        ${x.contactBtn({ cls: 'btn btn--primary split-cta', about: p.ctaAbout || p.heading, text: p.cta || 'Ask about this', hides: true })}
      </div>
    </div>`, { labelId: 'plan-title' });
};
