// engine/order.js: the order of the sections on the home page.
//
// Set it in content.js:  brand: { order: ['work', 'services', 'location', 'bookingSteps'], ... }
// The top section and its reassurance strip always come first, and the closing call to action
// always comes last. Everything in between can move. The price table and add-ons always stay
// straight after services, because they explain the services. Names not listed keep their
// usual place after the listed ones (the photo strip: straight under the top section), and
// sections that are switched off are simply skipped.

const FIRST = ['hero', 'reassurance'];
const LAST = ['closing'];
const MOVABLE = ['photoStrip', 'services', 'plan', 'work', 'bookingSteps', 'reviews', 'coverage', 'location'];
const STAYS_WITH = { services: ['services', 'priceTable', 'addons'] };

// Problems with a brand.order list, as plain sentences (empty when it's fine).
function orderProblems(order) {
  if (order == null || (Array.isArray(order) && order.length === 0)) return [];
  if (!Array.isArray(order)) return ['brand.order must be a list in square brackets, like [\'work\', \'services\'].'];
  const out = [];
  order.filter(k => !MOVABLE.includes(k)).forEach(k => out.push(`brand.order: "${k}" can't be moved. Use only: ${MOVABLE.join(', ')}.`));
  order.filter((k, i) => order.indexOf(k) !== i).forEach(k => out.push(`brand.order lists "${k}" twice.`));
  return out;
}

// Every home page section name, in the order the page shows them.
function pageOrder(c) {
  const wanted = ((c.brand && c.brand.order) || []).filter(k => MOVABLE.includes(k));
  // The photo strip sits straight under the top section unless brand.order places it somewhere.
  const middle = [...new Set([...(wanted.includes('photoStrip') ? [] : ['photoStrip']), ...wanted, ...MOVABLE])];
  return [...FIRST, ...middle.flatMap(k => STAYS_WITH[k] || [k]), ...LAST];
}

// What makes a site look the way it does: palette, heading font, layout and the order of its
// switched-on sections.
function designSignature(c) {
  const b = c.brand || {}, on = k => !!(c.sections && c.sections[k]);
  const font = b.fontFile ? `own font ${b.fontName || ''}` : b.moodFont === false ? 'built-in' : `mood font ${b.moodFont === 2 ? 2 : 1}`;
  return { palette: `${b.palette || `plain ${b.mode || 'dark'}`}, ${font}`, layout: b.layout || 'split', order: pageOrder(c).filter(on).join(' > ') };
}

module.exports = { MOVABLE, orderProblems, pageOrder, designSignature };
