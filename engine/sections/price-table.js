const { esc, keepEnd } = require('../lib');
const { table, note } = require('./price-parts');
module.exports = (x) => {
  const t = x.c.priceTable;
  return x.section('prices', `<div class="container">
      <h2 id="prices-title">${esc(t.heading)}</h2>
      ${t.intro ? `<p class="section-lead">${keepEnd(t.intro)}</p>` : ''}
      ${table(t, t.heading)}
      ${note(t.note)}
    </div>`, { labelId: 'prices-title' });
};
