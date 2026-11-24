const { esc, icon } = require('../lib');
module.exports = (x) => {
  const alt = x.main !== 'phone' && x.methodsOn.includes('phone');
  return `
<div class="contact-bar">
  ${x.contactBtn()}
  ${alt ? `<a class="bar-alt" href="${esc(x.href('phone'))}" aria-label="Call ${esc(x.c.contact.phone.number)}">${icon('phone')}</a>` : ''}
</div>\n`;
};
