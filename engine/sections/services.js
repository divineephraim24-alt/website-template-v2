const { esc, icon, keepEnd, money } = require('../lib');
const list = (items) => `<ul class="ticks">${items.map(i => typeof i === 'string' ? `<li>${esc(i)}</li>` : `<li>${esc(i.text)}${i.note ? `<small>${esc(i.note)}</small>` : ''}</li>`).join('')}</ul>`;
function price(s) {
  if (s.price == null || s.price === '') return s.priceText ? `<p class="card-price card-price--text">${esc(s.priceText)}</p>` : '';
  return `<p class="card-price">${s.from ? '<span>from</span> ' : ''}${money(s.price)}</p>`;
}
module.exports = (x) => {
  const s = x.c.services, n = s.items.length;
  const cols = n === 1 ? '' : (n === 2 || n === 4) ? ' cards--2' : ' cards--3';
  const cards = s.items.map(i => `
        <article class="card">
          <header class="card-head"><h3>${esc(i.name)}</h3>${price(i)}${i.summary ? `<p class="card-sum">${keepEnd(i.summary)}</p>` : ''}</header>
          ${i.buildsOn ? `<p class="card-builds">${esc(i.buildsOn)}</p>` : ''}
          ${(i.groups || []).map(g => `<p class="card-group">${esc(g.label)}</p>${list(g.items)}`).join('')}
          ${i.items && i.items.length ? list(i.items) : ''}
          ${s.buttons === false ? '' : x.contactBtn({ cls: 'btn btn--outline card-cta', about: i.name, text: (x.main === 'booking' ? 'Book ' : 'Ask about ') + i.name })}
        </article>`).join('');
  return x.section('services', `<div class="container">
      ${s.eyebrow ? `<p class="eyebrow">${esc(s.eyebrow)}</p>` : ''}
      <h2 id="services-title">${esc(s.heading)}</h2>
      ${s.intro ? `<p class="section-lead">${keepEnd(s.intro)}</p>` : ''}
      <div class="cards${cols}">${cards}
      </div>
      ${s.highlight && s.highlight.text ? `<p class="highlight">${icon('sparkle')}<span>${s.highlight.title ? `<strong>${esc(s.highlight.title)}</strong> ` : ''}${keepEnd(s.highlight.text)}</span></p>` : ''}
      ${s.note ? `<p class="small-print">${keepEnd(s.note)}</p>` : ''}
    </div>`, { labelId: 'services-title' });
};
