const { esc, icon } = require('../lib');
module.exports = (x) => `
  <section class="reassure" aria-label="Why choose ${esc(x.c.business.name)}">
    <div class="container"><ul>${x.c.reassurance.items.map(i => `
      <li>${icon(i.icon || 'check')}<div>${esc(i.title)}${i.text ? `<span>${esc(i.text)}</span>` : ''}</div></li>`).join('')}
    </ul></div>
  </section>\n`;
