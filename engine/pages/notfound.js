const layout = require('./layout');
module.exports = (x) => layout(x, {
  title: `Page not found | ${x.c.business.name}`, description: 'This page could not be found.', path: '/404', noindex: true,
  main: `
  <section class="section notfound"><div class="container">
    <p class="eyebrow">Page not found</p>
    <h1>Sorry, that page doesn't exist</h1>
    <p class="section-lead">The link may be old or mistyped. Everything you need is on the home&nbsp;page.</p>
    <a class="btn btn--outline" href="/">Go to the home page</a>
  </div></section>\n`,
});
