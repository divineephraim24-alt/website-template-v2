// engine/pages/layout.js: the outer HTML for every page.
const { esc } = require('../lib');
const header = require('../sections/header');
const footer = require('../sections/footer');
const contactBar = require('../sections/contact-bar');
const INLINE_JS = "document.documentElement.classList.add('js');";

module.exports = function layout(x, { title, description, path, main, preload = '', noindex = false, jsonLd = '' }) {
  const c = x.c, site = 'https://' + c.business.domain;
  const url = site + path, draft = c.status && c.status.wordingDraft;
  const robots = (noindex || draft) ? '\n  <meta name="robots" content="noindex">' : '';
  const social = noindex ? '' : `
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(c.business.name)}">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(site)}/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(c.business.name)}">
  <meta name="twitter:card" content="summary_large_image">`;
  const icons = x.page.logo ? `
  <link rel="icon" href="${x.asset('favicon.ico')}" sizes="48x48">
  <link rel="icon" href="${x.asset('favicon-32.png')}" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="${x.asset('apple-touch-icon.png')}">` : '';
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">${robots}
  <meta name="theme-color" content="${x.page.themeColor}">${social}${icons}${preload}
  <link rel="stylesheet" href="${x.asset('styles.css')}">
  <script>${INLINE_JS}</script>
  <script src="${x.asset('script.js')}" defer></script>${jsonLd}
</head>
<body class="layout-${esc(x.c.brand.layout || 'split')}">
${draft ? '<div class="draft-banner">DRAFT WORDING: not yet approved by the business</div>' : ''}${header(x)}
<main id="main">${main}</main>
${footer(x)}${contactBar(x)}
</body>
</html>
`;
};
module.exports.INLINE_JS = INLINE_JS;
