const { esc, keepEnd } = require('../lib');
module.exports = (x) => {
  const a = x.c.coverage, hasPhoto = a.photo && x.images[a.photo];
  return x.section('areas', `<div class="container${hasPhoto ? ' split split--reverse' : ''}">
      ${hasPhoto ? `<figure class="split-media">${x.photo(a.photo, { sizes: '(min-width: 900px) 400px, 100vw' })}</figure>` : ''}
      <div class="split-body">
        <h2 id="areas-title">${esc(a.heading)}</h2>
        ${a.intro ? `<p class="section-lead">${keepEnd(a.intro)}</p>` : ''}
        ${a.areas && a.areas.length ? `<p class="area-list">${keepEnd('Including ' + a.areas.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.')}</p>` : ''}
        ${a.note ? `<p class="small-print">${keepEnd(a.note)}</p>` : ''}
        ${a.needs && a.needs.length ? `<h3 class="sub-title">${esc(a.needsHeading || "What you'll need")}</h3><ul class="ticks">${a.needs.map(n => `<li>${keepEnd(n)}</li>`).join('')}</ul>` : ''}
      </div>
    </div>`, { labelId: 'areas-title' });
};
