const { esc, icon } = require('../lib');
function navItems(x) {
  const c = x.c, on = x.sectionOn, out = [];
  if (on('services')) out.push([c.services.navLabel || 'Services', x.homeLink('#services')]);
  if (on('priceTable')) out.push([c.priceTable.navLabel || 'Prices', x.homeLink('#prices')]);
  if (on('plan')) out.push([c.plan.navLabel || 'Regular visits', x.homeLink('#plan')]);
  if (on('work')) out.push([c.work.navLabel || 'Our work', x.homeLink('#work')]);
  if (on('reviews')) out.push([c.reviews.navLabel || 'Reviews', x.homeLink('#reviews')]);
  if (on('location')) out.push([c.location.navLabel || 'Find us', x.homeLink('#find-us')]);
  else if (on('coverage')) out.push([c.coverage.navLabel || 'Areas', x.homeLink('#areas')]);
  for (const p of (c.extraPages || []).filter(p => p.on)) out.push([p.navLabel || p.title, x.pageLink(p.slug + '.html'), p.slug + '.html']);
  if (on('faq')) out.push([c.faq.navLabel || 'FAQ', x.pageLink('faq.html'), 'faq.html']);
  return out;
}
module.exports = (x) => {
  const b = x.c.business, logo = x.page.logo;
  const quick = x.methodsOn.includes('phone') ? 'phone' : x.main;
  const quickText = quick === 'phone' ? 'Call' : quick === 'whatsapp' ? 'WhatsApp' : quick === 'email' ? 'Email' : 'Book';
  const nav = navItems(x).slice(0, 6).map(([t, h, f]) => `<a href="${esc(h)}"${f && x.page.file === f ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('\n      ');
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container">
    <a class="brand" href="${x.homeLink()}" aria-label="${esc(b.name)}, home">
      ${logo ? `<img src="${x.asset('images/logo-128.png')}" width="${logo.w128}" height="${logo.h128}" alt="">` : ''}
      <span class="brand-name">${esc(b.name)}${b.tagline ? `<small>${esc(b.tagline)}</small>` : ''}</span>
    </a>
    <nav class="header-nav" aria-label="Main">
      ${nav}
    </nav>
    <a class="header-quick" href="${esc(x.href(quick))}"${x.newTab(quick)} aria-label="${esc(quick === 'phone' ? 'Call ' + x.c.contact.phone.number : x.label(quick))}">${icon(quick)}<span>${quickText}</span></a>
    ${x.contactBtn({ cls: 'btn btn--primary header-cta' })}
  </div>
</header>\n`;
};
module.exports.navItems = navItems;
