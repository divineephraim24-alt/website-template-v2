const { esc, money, keepEnd } = require('../lib');
// A table: rows down the side, columns across the top (e.g. size by package)
function table(t, caption) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table class="price-table"><caption>${esc(caption)}</caption>
        <thead><tr><th scope="col">${esc(t.rowHeading || 'Option')}</th>${t.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${t.rows.map(r => `<tr><th scope="row">${esc(r.label)}</th>${r.prices.map(p => `<td>${typeof p === 'number' ? money(p) : esc(p)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
}
const priceList = (items) => `<ul class="price-list">${items.map(i => `<li><span>${esc(i.name)}${i.note ? `<small>${esc(i.note)}</small>` : ''}</span><b>${i.price != null && i.price !== '' ? (i.plus ? '+' : '') + money(i.price) : esc(i.priceText || '')}</b></li>`).join('')}</ul>`;
const note = (s) => s ? `<p class="small-print">${keepEnd(s)}</p>` : '';
module.exports = { table, priceList, note };
