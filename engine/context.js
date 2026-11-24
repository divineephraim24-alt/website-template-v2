// engine/context.js: everything a section needs to render for one page.
const { esc, icon, telHref, waHref, mailHref } = require('./lib');

const METHODS = ['whatsapp', 'phone', 'email', 'booking'];
const DEFAULT_LABELS = { whatsapp: 'Message on WhatsApp', phone: 'Call', email: 'Email', booking: 'Book online' };

function createContext(c, images, page) {
  const methodsOn = METHODS.filter(m => c.contact[m] && c.contact[m].on);
  const main = c.contact.main;
  let alt = false;
  const asset = (p) => (page.is404 ? '/' : '') + p;
  const homeLink = (hash = '') => page.isHome ? (hash || 'index.html') : (page.is404 ? '/' + hash : 'index.html' + hash);
  const pageLink = (file) => page.is404 ? '/' + file : file;
  const v = (i, we) => c.business.voice === 'we' ? we : i;

  function href(method, about) {
    const m = c.contact[method];
    if (method === 'whatsapp') return waHref(m.number, about ? `Hi, I'd like to ask about ${about}.${m.details ? ' ' + m.details : ''}` : m.message);
    if (method === 'phone') return telHref(m.number);
    if (method === 'email') return mailHref(m.address, about ? `Enquiry about ${about}` : `Enquiry from the ${c.business.name} website`);
    return m.url;
  }
  const label = (method) => (c.contact[method].label || DEFAULT_LABELS[method]);
  const newTab = (method) => method === 'booking' ? ' target="_blank" rel="noopener"' : '';

  function contactBtn({ method = main, cls = 'btn btn--primary', about, text, hides } = {}) {
    return `<a class="${cls}"${hides ? ' data-hides-bar' : ''} href="${esc(href(method, about))}"${newTab(method)}>${icon(method)}${esc(text || label(method))}</a>`;
  }

  function photo(key, { sizes = '100vw', eager = false, cls = '', decorative = false } = {}) {
    const im = images[key];
    if (!im) return '';
    const files = [...im.files].sort((a, b) => a.width - b.width);
    const big = files[files.length - 1], src = files[0];
    const srcset = files.length > 1 ? ` srcset="${files.map(f => `${asset(f.file)} ${f.width}w`).join(', ')}" sizes="${esc(sizes)}"` : '';
    return `<img${cls ? ` class="${cls}"` : ''} src="${asset(src.file)}"${srcset} width="${big.width}" height="${big.height}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} alt="${decorative ? '' : esc(im.alt)}">`;
  }

  function section(id, inner, { extraClass = '', labelId } = {}) {
    alt = !alt;
    return `\n  <section class="section${alt ? '' : ' section--alt'}${extraClass ? ' ' + extraClass : ''}" id="${id}"${labelId ? ` aria-labelledby="${labelId}"` : ''}>\n    ${inner}\n  </section>\n`;
  }

  const sectionOn = (name) => !!(c.sections && c.sections[name]);
  return { c, images, page, METHODS, methodsOn, main, asset, homeLink, pageLink, v, href, label, newTab, contactBtn, photo, section, sectionOn };
}
module.exports = { createContext, METHODS, DEFAULT_LABELS };
