const { esc, keepEnd } = require('../lib');
module.exports = (x) => {
  const b = x.c.bookingSteps, hasPhoto = b.photo && x.images[b.photo];
  return x.section('booking', `<div class="container${hasPhoto ? ' split' : ''}">
      ${hasPhoto ? `<figure class="split-media">${x.photo(b.photo, { sizes: '(min-width: 900px) 400px, 100vw' })}</figure>` : ''}
      <div class="split-body">
        <h2 id="booking-title">${esc(b.heading)}</h2>
        ${b.lead ? `<p class="section-lead">${keepEnd(b.lead)}</p>` : ''}
        <ol class="steps">${b.steps.map(s => `<li><strong>${esc(s.title)}</strong>${keepEnd(s.text)}</li>`).join('')}</ol>
        ${b.note ? `<p class="small-print">${keepEnd(b.note)}</p>` : ''}
        ${x.sectionOn('faq') ? `<p class="text-link"><a href="${x.pageLink('faq.html')}">${esc(x.c.faq.linkText || 'Questions? See the FAQ')}&nbsp;→</a></p>` : ''}
        ${x.contactBtn({ cls: 'btn btn--primary split-cta', hides: true })}
      </div>
    </div>`, { labelId: 'booking-title' });
};
