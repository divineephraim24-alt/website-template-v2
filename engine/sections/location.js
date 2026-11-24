const { esc, keepEnd, daysLabel, time12, icon } = require('../lib');
const mapUrl = (l) => l.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([l.line1, l.line2, l.town, l.postcode].filter(Boolean).join(', '));
module.exports = (x) => {
  const l = x.c.location, hasPhoto = l.photo && x.images[l.photo];
  return x.section('find-us', `<div class="container${hasPhoto ? ' split split--reverse' : ''}">
      ${hasPhoto ? `<figure class="split-media">${x.photo(l.photo, { sizes: '(min-width: 900px) 400px, 100vw' })}</figure>` : ''}
      <div class="split-body">
        <h2 id="find-us-title">${esc(l.heading)}</h2>
        ${l.intro ? `<p class="section-lead">${keepEnd(l.intro)}</p>` : ''}
        <address class="address">${[l.line1, l.line2, l.town, l.postcode].filter(Boolean).map(esc).join('<br>')}</address>
        <div class="location-actions"><a class="btn btn--outline" href="${esc(mapUrl(l))}" target="_blank" rel="noopener">${icon('pin')}Open in maps</a></div>
        ${l.walkIns ? `<p>${keepEnd(l.walkIns)}</p>` : ''}
        ${l.parking ? `<p class="small-print">${keepEnd(l.parking)}</p>` : ''}
        <h3 class="sub-title">Opening hours</h3>
        <table class="hours"><caption>Opening hours</caption><tbody>${l.hours.map(h => `<tr><th scope="row">${esc(daysLabel(h.days))}</th><td>${h.closed ? 'Closed' : `${esc(time12(h.open))} to ${esc(time12(h.close))}`}</td></tr>`).join('')}</tbody></table>
        ${l.hoursNote ? `<p class="small-print">${keepEnd(l.hoursNote)}</p>` : ''}
      </div>
    </div>`, { labelId: 'find-us-title' });
};
module.exports.mapUrl = mapUrl;
