const { esc, keepEnd } = require('../lib');
module.exports = (x) => {
  const b = x.c.closing, hasPhoto = b.photo && x.images[b.photo];
  return `
  <section class="band${hasPhoto ? ' band--photo' : ''}" aria-labelledby="closing-title">
    ${hasPhoto ? `<div class="band-media">${x.photo(b.photo, { decorative: true })}</div>` : ''}
    <div class="container">
      <h2 id="closing-title">${esc(b.heading)}</h2>
      ${b.text ? `<p>${keepEnd(b.text)}</p>` : ''}
      ${x.contactBtn({ hides: true })}
    </div>
  </section>\n`;
};
