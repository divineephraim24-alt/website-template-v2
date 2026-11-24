const { esc } = require('../lib');
module.exports = (x) => {
  const r = x.c.reviews, n = r.items.length, s = x.c.social || {};
  const cls = n === 1 ? ' reviews--one' : n === 2 ? ' reviews--two' : '';
  return x.section('reviews', `<div class="container">
      <h2 id="reviews-title">${esc(r.heading)}</h2>
      <div class="reviews${cls}"${n > 1 ? ' tabindex="0"' : ''} role="group" aria-label="Customer reviews">${r.items.map(i => `
        <figure class="review"><blockquote>${esc(i.text)}</blockquote><figcaption><strong>${esc(i.name)}</strong>${esc(i.town || '')}</figcaption></figure>`).join('')}
      </div>
      ${n > 1 ? '<p class="reviews-hint" aria-hidden="true">Swipe for more&nbsp;→</p>' : ''}
      ${s.googleReviews ? `<p class="reviews-more"><a href="${esc(s.googleReviews)}" target="_blank" rel="noopener">See more reviews on Google&nbsp;→</a></p>` : ''}
      ${s.googleLeaveReview ? `<p class="reviews-more reviews-leave"><a href="${esc(s.googleLeaveReview)}" target="_blank" rel="noopener">${esc(r.leaveText || 'Been a customer? Leave a Google review')}&nbsp;→</a></p>` : ''}
    </div>`, { labelId: 'reviews-title' });
};
