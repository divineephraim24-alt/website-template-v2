// Policy pages: privacy, terms and conditions, refunds and cancellations.
// Privacy text always comes from faq.privacy. If the FAQ page is on and already has that
// privacy section, no separate privacy page is made: the footer links to the FAQ's section.
const layout = require('./layout');
const { pageHero } = require('./faq');
const { esc, keepEnd } = require('../lib');

const POLICIES = [
  { key: 'terms', slug: 'terms', label: 'Terms and conditions' },
  { key: 'refunds', slug: 'refunds', label: 'Refunds and cancellations' },
];

const hasFaqPrivacy = (c) => !!(c.sections && c.sections.faq && c.faq && (c.faq.privacy || []).length);
// 'faq' = privacy already on the FAQ page, 'page' = build privacy.html, 'none' = no privacy text
function privacyMode(c) {
  if (hasFaqPrivacy(c)) return 'faq';
  const p = c.policies || {};
  return p.privacy && c.faq && (c.faq.privacy || []).length ? 'page' : 'none';
}
const policiesOn = (c) => POLICIES.filter(p => c.policies && c.policies[p.key] && c.policies[p.key].on);

// Links for the footer, in order: privacy, terms, refunds
function policyLinks(x) {
  const out = [], mode = privacyMode(x.c);
  if (mode === 'faq') out.push(['Privacy', x.pageLink('faq.html') + '#privacy']);
  if (mode === 'page') out.push(['Privacy', x.pageLink('privacy.html')]);
  for (const p of policiesOn(x.c)) out.push([x.c.policies[p.key].navLabel || p.label, x.pageLink(p.slug + '.html')]);
  return out;
}

const paras = (text) => String(text || '').split(/\n\s*\n/).map(t => `<p>${keepEnd(t.trim())}</p>`).join('');

function privacyPage(x) {
  const c = x.c, title = (c.policies && c.policies.privacyTitle) || 'Privacy policy';
  const main = pageHero(x, title, '', '', '') + `
  <section class="section"><div class="container narrow">
      <div class="block" id="privacy">${c.faq.privacy.map(p => `<p>${keepEnd(p)}</p>`).join('')}</div>
      <div class="page-cta">${x.contactBtn({ hides: true })}</div>
  </div></section>\n`;
  return layout(x, { title: `${title} | ${c.business.name}`, description: `How ${c.business.name} handles your personal details.`, path: '/privacy', main });
}

function policyPage(x, def) {
  const c = x.c, p = c.policies[def.key], title = p.title || def.label;
  const blocks = (p.sections || []).map(s => `<div class="block">${s.heading ? `<h2 class="group-title">${esc(s.heading)}</h2>` : ''}${paras(s.text)}</div>`).join('\n      ');
  const updated = p.lastUpdated ? `<p class="small-print">Last updated: ${esc(p.lastUpdated)}</p>` : '';
  const main = pageHero(x, title, p.intro, '', '') + `
  <section class="section"><div class="container narrow">
      ${blocks}
      ${updated}
      <div class="page-cta">${x.contactBtn({ hides: true })}</div>
  </div></section>\n`;
  return layout(x, { title: `${title} | ${c.business.name}`, description: p.description || `${title} for ${c.business.name}.`, path: '/' + def.slug, main });
}

module.exports = { POLICIES, privacyMode, policiesOn, policyLinks, privacyPage, policyPage };
