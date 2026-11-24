const { esc, keepEnd } = require('../lib');
const { priceList, note } = require('./price-parts');
module.exports = (x) => {
  const a = x.c.addons;
  return x.section('addons', `<div class="container">
      <h2 id="addons-title">${esc(a.heading)}</h2>
      ${a.intro ? `<p class="section-lead">${keepEnd(a.intro)}</p>` : ''}
      ${priceList(a.items)}
      ${note(a.note)}
    </div>`, { labelId: 'addons-title' });
};
