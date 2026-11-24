const { esc, icon } = require('../lib');
const { navItems } = require('./header');
// policy.js is loaded inside the function: it loads layout.js, which loads this footer
const SOCIAL = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']];
module.exports = (x) => {
  const { business: b, contact: k, social: s = {} } = x.c, logo = x.page.logo, year = new Date().getFullYear();
  const text = { whatsapp: 'WhatsApp', phone: k.phone && k.phone.number, email: k.email && k.email.address, booking: k.booking && (k.booking.label || 'Book online') };
  const contacts = x.methodsOn.map(m => `<li><a href="${esc(x.href(m))}"${x.newTab(m)}>${icon(m)}${esc(text[m])}</a></li>`);
  const socials = SOCIAL.filter(([k2]) => s[k2]).map(([k2, n]) => `<li><a href="${esc(s[k2])}" target="_blank" rel="noopener">${icon(k2)}${n}</a></li>`);
  const links = navItems(x).map(([t, h]) => `<li><a href="${esc(h)}">${esc(t)}</a></li>`).join('');
  const co = b.company || {};
  const policies = require('../pages/policy').policyLinks(x).map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('');
  const legal = b.legalForm === 'limited' ? `<div class="footer-legal"><p>${esc(co.name)} is a company registered in ${esc(co.registeredIn)}. Company number ${esc(co.number)}. Registered office: ${esc(co.registeredOffice)}.</p></div>` : '';
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">${logo ? `<img src="${x.asset('images/logo-128.png')}" width="${logo.w128}" height="${logo.h128}" alt="" loading="lazy">` : ''}<div><strong>${esc(b.name)}</strong>${esc(b.tagline || '')}</div></div>
        ${b.footerNote ? `<p class="footer-about">${esc(b.footerNote)}</p>` : ''}
      </div>
      <div><p class="footer-title">Contact</p><ul class="footer-list">${contacts.join('')}${socials.join('')}</ul></div>
      ${links ? `<div><p class="footer-title">Information</p><ul class="footer-list">${links}</ul></div>` : ''}
    </div>
    ${legal}
    <div class="footer-base"><span>&copy; ${year} ${esc(legal ? co.name : b.name)}</span>${policies ? `<nav class="footer-policies" aria-label="Policies">${policies}</nav>` : ''}${b.runBy ? `<span>${esc(b.runBy)}</span>` : ''}</div>
  </div>
</footer>\n`;
};
