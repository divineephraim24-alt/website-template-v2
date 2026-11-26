const layout = require('./layout');
const { SCHEMA_DAYS, parseDays, ukIntl } = require('../lib');
const { mapUrl } = require('../sections/location');
const { pageOrder } = require('../order');
// Each section's renderer. The order on the page comes from engine/order.js (brand.order).
const RENDER = Object.fromEntries([
  ['hero', require('../sections/hero')], ['reassurance', require('../sections/reassurance')], ['photoStrip', require('../sections/photo-strip')],
  ['services', require('../sections/services')], ['priceTable', require('../sections/price-table')],
  ['addons', require('../sections/addons')], ['plan', require('../sections/plan')],
  ['work', require('../sections/work')], ['bookingSteps', require('../sections/booking-steps')],
  ['reviews', require('../sections/reviews')], ['coverage', require('../sections/coverage')],
  ['location', require('../sections/location')], ['closing', require('../sections/closing')],
]);

function allPrices(c) {
  const out = [], add = (v) => { if (typeof v === 'number') out.push(v); };
  if (c.sections.services) c.services.items.forEach(i => add(i.price));
  if (c.sections.priceTable) c.priceTable.rows.forEach(r => r.prices.forEach(add));
  if (c.sections.plan && c.plan.table && c.plan.table.rows) c.plan.table.rows.forEach(r => r.prices.forEach(add));
  return out;
}
function structuredData(x) {
  const c = x.c, b = c.business, site = 'https://' + b.domain, k = c.contact;
  const d = { '@context': 'https://schema.org', '@type': b.type || 'LocalBusiness', '@id': site + '/#business', name: b.name, description: c.seo.description, url: site + '/', image: site + '/images/og-image.jpg' };
  if (k.phone && k.phone.on) d.telephone = '+' + ukIntl(k.phone.number);
  else if (k.whatsapp && k.whatsapp.on) d.telephone = '+' + ukIntl(k.whatsapp.number);
  if (k.email && k.email.on) d.email = k.email.address;
  if (x.page.logo) d.logo = site + '/images/logo-256.png';
  const prices = allPrices(c);
  if (prices.length) { const lo = Math.min(...prices), hi = Math.max(...prices); d.priceRange = lo === hi ? `£${lo}` : `£${lo}–£${hi}`; d.currenciesAccepted = 'GBP'; }
  if (b.paymentAccepted) d.paymentAccepted = b.paymentAccepted;
  if (c.sections.location) {
    const l = c.location;
    d.address = { '@type': 'PostalAddress', streetAddress: [l.line1, l.line2].filter(Boolean).join(', '), addressLocality: l.town, postalCode: l.postcode, addressCountry: 'GB' };
    d.hasMap = mapUrl(l);
    d.openingHoursSpecification = l.hours.filter(h => !h.closed).map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: parseDays(h.days).map(s => SCHEMA_DAYS[s]), opens: h.open, closes: h.close }));
  }
  if (c.sections.coverage) d.areaServed = (c.coverage.areas || []).map(name => ({ '@type': 'Place', name }));
  const same = ['instagram', 'facebook', 'tiktok', 'googleReviews'].map(n => c.social && c.social[n]).filter(Boolean);
  if (same.length) d.sameAs = same;
  return `\n  <script type="application/ld+json">\n${JSON.stringify(d, null, 2).replace(/</g, '\\u003c')}\n  </script>`;
}
module.exports = (x) => {
  const main = pageOrder(x.c).filter(k => x.sectionOn(k)).map(k => RENDER[k](x)).join('');
  let preload = '';
  const hero = x.sectionOn('hero') && x.c.hero.photo && x.images[x.c.hero.photo];
  if (hero) {
    const f = [...hero.files].sort((a, b) => a.width - b.width);
    preload = `\n  <link rel="preload" as="image" href="${f[0].file}"${f.length > 1 ? ` imagesrcset="${f.map(i => `${i.file} ${i.width}w`).join(', ')}" imagesizes="(min-width: 900px) 50vw, 100vw"` : ''} fetchpriority="high">`;
  }
  return layout(x, { title: x.c.seo.title, description: x.c.seo.description, path: '/', main, preload, jsonLd: structuredData(x) });
};
module.exports.allPrices = allPrices;
