// =============================================================================
// content.js: EVERYTHING about this client's website lives in this one file.
//
// How to edit it safely:
//  - Change only the text inside the quote marks, or the true/false switches.
//  - Keep the comma at the end of each line.
//  - [[Double square brackets]] are placeholders. The build refuses to run
//    while one is left in a section that is switched on.
//  - Only put in facts the client gave you. Never invent prices, reviews or claims.
//  - After changing it, run:  node tools/build_site.js .
//    If something is wrong, the build tells you the line and how to fix it.
// =============================================================================

module.exports = {

  // ---------- Wording approval ----------
  status: {
    wordingDraft: true,       // true = shows a "DRAFT WORDING" banner. Set false only after written sign-off.
    wordingSignedOff: '',     // who approved it, how and when, e.g. 'Sam Jones, by email, 3 March 2027'
  },

  // ---------- The business ----------
  business: {
    name: '[[Business name]]',
    tagline: '[[Short line under the name, e.g. what you do and where]]',
    domain: '[[yourdomain.co.uk]]',      // no https:// and no www
    type: 'LocalBusiness',               // Google business type, e.g. Plumber, Electrician, HairSalon, BeautySalon, Restaurant, CafeOrCoffeeShop, HealthClub, HousePainter, AutoRepair, Store
    voice: 'we',                         // 'I' for a one-person business, 'we' for a team
    footerNote: '[[One line for the footer, e.g. areas or opening days]]',
    runBy: '',                           // optional, e.g. 'Run by Sam Jones'
    paymentAccepted: '',                 // optional, e.g. 'Cash, bank transfer, card'

    // 'sole-trader' or 'limited'. If limited, the footer shows the company details below.
    // (Not legal advice: check current rules at gov.uk.)
    legalForm: 'sole-trader',
    company: {
      name: '',                          // full registered name, e.g. 'Sam Jones Ltd'
      number: '',                        // Companies House number
      registeredIn: '',                  // e.g. 'England and Wales'
      registeredOffice: '',              // full registered office address
    },
  },

  // ---------- How customers contact the business ----------
  contact: {
    main: 'phone',                       // the main button: 'whatsapp', 'phone', 'email' or 'booking' (must be switched on below)
    whatsapp: {
      on: false,
      number: '[[07xxx xxxxxx]]',
      message: "Hi, I'd like to make an enquiry.",   // the message that appears ready to send
      details: '',                       // added after "I'd like to ask about X.", e.g. 'My postcode is …'
      label: 'Book on WhatsApp',
    },
    phone: { on: true, number: '[[Phone number]]', label: 'Call us' },
    email: { on: false, address: '[[name@yourdomain.co.uk]]', label: 'Email us' },
    booking: { on: false, url: '[[https://your-booking-page]]', label: 'Book online' },   // Calendly, Fresha, Booksy etc.
  },

  // ---------- Links (leave '' if there isn't one) ----------
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    googleReviews: '',                   // link to the Google Business Profile
    googleLeaveReview: '',               // the "write a review" link from the profile
  },

  // ---------- The look ----------
  brand: {
    palette: '',                         // REQUIRED for new sites: a palette name from docs/colour-palettes/README.md, e.g. 'velvet-forest'.
                                         // It colours the whole site. mode and accent below are only used when palette is ''.
    moodFont: 1,                         // heading font: 1 or 2 (the two choices for the palette's mood), or false for none
    layout: '',                          // REQUIRED for new sites: split, overlay, centered, mirror, editorial or arch (docs/06-layouts.md).
                                         // Give each client a different layout and palette pairing.
    order: [],                           // REQUIRED for new sites: the middle sections in your order, e.g. ['work', 'services', 'location', 'bookingSteps'].
                                         // Can move: services, plan, work, bookingSteps, reviews, coverage, location (docs/06-layouts.md).
    mode: 'dark',                        // 'dark' or 'light'
    accent: '#4F9DF7',                  // main colour for links and highlights. The build checks it is readable.
    font: 'modern',                      // 'modern', 'classic' or 'friendly'
    corners: 'soft',                     // 'sharp', 'soft' or 'round'
    logo: '',                            // e.g. 'logo/logo.png' (inside client/media). Leave '' to show just the name.
    fontFile: '',                        // optional: a licensed .woff2 file inside client/media, e.g. 'logo/brand.woff2'
    fontName: '',                        // the name of that font
  },

  // ---------- Google and link previews ----------
  seo: {
    title: '[[What you do in Town | Business name]]',     // about 60 characters
    description: '[[One or two sentences for Google: what, where and why]]',   // about 150 characters
  },

  // ---------- 'mobile' (we come to you), 'premises' (visit us) or 'both' ----------
  serviceMode: 'mobile',

  // ---------- Switch each part of the site on or off ----------
  sections: {
    hero: true,
    reassurance: true,
    services: true,
    priceTable: false,        // prices by size or option
    addons: false,
    plan: false,              // regular visits or subscription
    photoStrip: false,        // a row of 3 to 6 square photos, straight under the top section unless brand.order moves it
    work: false,              // photos, before/after, video
    bookingSteps: true,
    reviews: false,           // only with real reviews and consent
    coverage: true,           // "where we work": for mobile businesses
    location: false,          // "find us": address and opening hours
    closing: true,
    faq: true,                // adds an FAQ page with a privacy note
  },

  // ---------- Photos: list each one once, then use its short name below ----------
  // file: inside client/media.  alt: describe the photo for screen readers and Google.
  // blur: boxes over number plates or house numbers, as fractions of the upright photo: [left, top, width, height]
  // crop: optional [left, top, width, height], also as fractions.
  photos: {
    // hero: { file: 'photos/main-photo.jpg', alt: 'What the photo shows', blur: [] },
  },

  // ---------- Top of the page ----------
  hero: {
    heading: '[[Main headline: what you do and where]]',
    lead: '[[One sentence: what the customer gets]]',
    note: '',                            // optional small line, e.g. 'By appointment'
    photo: '',                           // short name from "photos", or '' for no photo
    secondary: { label: 'See services', href: '#services' },
  },

  // ---------- 2 to 4 short reasons to trust the business ----------
  reassurance: {
    // icon: home, pin, card, check, clock, star, shield, sparkle, van, leaf, heart
    items: [
      { icon: 'check', title: '[[Short reason]]', text: '[[A few words of detail]]' },
      { icon: 'pin', title: '[[Short reason]]', text: '[[A few words of detail]]' },
    ],
  },

  // ---------- Services ----------
  services: {
    heading: 'Services',
    navLabel: 'Services',
    intro: '[[One line introducing the services]]',
    buttons: true,                       // an "Ask about…" button on each card
    highlight: { title: '', text: '' },  // optional highlighted note under the cards
    note: '',                            // optional small print
    items: [
      {
        name: '[[Service name]]',
        price: null,                     // a number like 45, or null if there is no fixed price
        from: false,                     // true shows "from £45"
        priceText: '[[e.g. Free quote]]',   // shown when price is null
        summary: '[[One line about this service]]',
        buildsOn: '',                    // optional, e.g. 'Everything in Basic, plus:'
        items: ['[[What is included]]'],
        groups: [],                      // optional grouped lists: [{ label: 'Inside', items: ['…'] }]
      },
    ],
  },

  // ---------- Price table (e.g. size against package) ----------
  priceTable: {
    heading: 'Prices',
    navLabel: 'Prices',
    intro: '',
    rowHeading: '[[e.g. Size]]',
    columns: ['[[Option 1]]', '[[Option 2]]'],
    rows: [{ label: '[[e.g. Small]]', prices: [0, 0] }],
    note: '',
  },

  // ---------- Add-ons ----------
  addons: {
    heading: 'Add-ons',
    intro: '',
    items: [{ name: '[[Add-on name]]', note: '', price: 0, plus: true, priceText: '' }],
    note: '',
  },

  // ---------- Regular visits or subscription ----------
  plan: {
    heading: '[[e.g. Regular visits]]',
    navLabel: 'Regular visits',
    eyebrow: '',
    intro: '[[What the plan is and who it suits]]',
    steps: [{ title: '[[Step]]', text: '[[Short explanation]]' }],
    table: { heading: 'Prices', rowHeading: '[[e.g. Size]]', columns: ['[[e.g. Monthly]]'], rows: [{ label: '[[e.g. Small]]', prices: [0] }] },
    note: '',
    cta: 'Ask about regular visits',
    ctaAbout: 'regular visits',
    photo: '',
  },

  // ---------- Photo strip: a row of square photos ----------
  photoStrip: {
    label: 'Photos of our work',         // read out by screen readers
    photos: [],                          // 3 to 6 short names from "photos", e.g. ['cut1', 'cut2', 'cut3', 'cut4', 'cut5']
  },

  // ---------- Our work ----------
  work: {
    heading: 'Our work',
    navLabel: 'Our work',
    intro: '',
    // Optional video: a short, already-compressed .mp4 in client/media/videos
    video: { file: '', poster: '', label: '', description: '' },
    beforeAfter: [],                     // [{ before: 'photoName', after: 'photoName' }]
    gallery: [],                         // [{ photo: 'photoName', wide: true }]  wide = for landscape photos
  },

  // ---------- How booking works ----------
  bookingSteps: {
    heading: 'How booking works',
    lead: '',
    steps: [
      { title: '[[Step 1]]', text: '[[What the customer does]]' },
      { title: '[[Step 2]]', text: '[[What happens next]]' },
      { title: '[[Step 3]]', text: '[[On the day]]' },
    ],
    note: '',                            // e.g. the cancellation policy in one line
    photo: '',
  },

  // ---------- Reviews: real, word for word, with consent ----------
  reviews: {
    heading: 'What customers say',
    navLabel: 'Reviews',
    consentConfirmed: false,             // set true only when each customer agreed to their name and town being shown
    leaveText: 'Been a customer? Leave a Google review',
    items: [{ text: '[[The review, word for word]]', name: '[[First name]]', town: '[[Town]]' }],
  },

  // ---------- Where we work (mobile businesses) ----------
  coverage: {
    heading: 'Where we work',
    navLabel: 'Areas',
    intro: '[[e.g. We come to your home or workplace across…]]',
    areas: ['[[Town]]', '[[Town]]'],
    note: '',                            // e.g. 'Not sure if we cover you? Send your postcode.'
    needsHeading: "What you'll need",
    needs: [],                           // what the customer provides, e.g. 'A parking space'
    photo: '',
  },

  // ---------- Find us (businesses with premises) ----------
  location: {
    heading: 'Find us',
    navLabel: 'Find us',
    intro: '',
    line1: '[[Address line 1]]',
    line2: '',
    town: '[[Town]]',
    postcode: '[[Postcode]]',
    mapUrl: '',                          // optional: paste a Google Maps link. If empty, one is made from the address.
    walkIns: '',                         // e.g. 'Walk-ins welcome' or 'By appointment only'
    parking: '',
    // days: 'Mo-Fr', 'Sa', 'Su', or 'Mo,We,Fr'.  Times use the 24-hour clock.
    hours: [
      { days: 'Mo-Fr', open: '09:00', close: '17:00' },
      { days: 'Sa-Su', closed: true },
    ],
    hoursNote: '',                       // e.g. holiday closures
    photo: '',
  },

  // ---------- Closing call to action ----------
  closing: {
    heading: 'Ready when you are.',
    text: '[[What to do next, e.g. Get in touch and we will arrange a time that suits you.]]',
    photo: '',
  },

  // ---------- FAQ page (with privacy note) ----------
  faq: {
    title: 'Frequently asked questions',
    navLabel: 'FAQ',
    eyebrow: '',
    intro: '',
    description: '',                     // for Google; uses the main description if empty
    linkText: 'Questions? See the FAQ',
    ctaText: 'Still have a question? Just ask.',
    photo: '',
    groups: [
      { heading: 'Booking and payment', items: [{ q: '[[A question customers ask]]', a: '[[The answer, from the client]]' }] },
    ],
    // Check this matches how the client actually handles personal details. Not legal advice.
    privacy: [
      'This website has no contact forms, cookies or tracking.',
      '[[If you contact us, we only use your details to reply and carry out your booking.]]',
      '[[You can ask us to delete your details at any time.]]',
    ],
  },

  // ---------- Policies: privacy, terms and conditions, refunds ----------
  // Linked at the bottom of every page. Write them ONLY from the client's own answers
  // (intake questions 21, 24 and 24a to 24c). Never copy another business's policy. Not legal advice:
  // the client should check them, e.g. against gov.uk and Citizens Advice guidance.
  policies: {
    // Privacy uses the faq.privacy text above. If the FAQ page is on, its privacy section is
    // linked and no separate page is made. If the FAQ page is off, a privacy page is made instead.
    privacy: true,
    terms: {
      on: true,
      title: 'Terms and conditions',
      intro: '',
      lastUpdated: '[[e.g. March 2027]]',
      sections: [
        { heading: 'Bookings and quotes', text: '[[How bookings are confirmed and how long quotes are valid]]' },
        { heading: 'Payment', text: '[[When and how customers pay, and any deposit]]' },
        { heading: 'Our responsibilities', text: '[[What the client agrees to do, and any limits, e.g. on results]]' },
      ],
    },
    refunds: {
      on: true,
      title: 'Refunds and cancellations',
      intro: '',
      lastUpdated: '[[e.g. March 2027]]',
      sections: [
        { heading: 'Cancelling a booking', text: '[[How much notice is needed and what happens to a deposit]]' },
        { heading: 'If something is not right', text: '[[How to complain, and when a re-do or refund is offered]]' },
      ],
    },
  },

  // ---------- Extra pages (off by default): a menu, a service page, a gallery ----------
  // Copy this example inside the [ ] and set on: true. It is added to the menu and sitemap.
  // { on: true, slug: 'menu', navLabel: 'Menu', title: 'Our menu', intro: '', description: '', photo: '',
  //   blocks: [
  //     { type: 'text', heading: 'About', text: 'Paragraph.\n\nAnother paragraph.' },
  //     { type: 'list', heading: 'Included', items: ['One', 'Two'] },
  //     { type: 'prices', heading: 'Prices', items: [{ name: 'Item', note: '', price: 5 }], note: '' },
  //     { type: 'photos', heading: 'Gallery', photos: ['photoName'] },
  //   ] },
  extraPages: [],
};
