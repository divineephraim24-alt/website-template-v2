# Layouts

Every client site gets its own layout as well as its own colour palette, so two sites never
look alike. Set it in `client/content.js`:

```js
brand: { palette: 'velvet-forest', layout: 'overlay', ... }
```

The layout changes the top section, section headings, service cards and gallery. The content
and wording stay the same. All five work on phones and pass the same checks.

| Layout | Top section | Headings and cards | Suits |
|---|---|---|---|
| `split` | Text on one side, photo on the other (photo first on phones) | Plain headings, framed cards | Any business: the safe default |
| `overlay` | Full-width photo with the heading on top of it | Floating cards with a soft shadow | Strong, atmospheric photos (salons, barbers, food) |
| `centered` | Heading centred at the top, wide framed photo below | Centred headings and cards | Calm, premium, friendly (beauty, wellness, cafes) |
| `mirror` | Text first, photo on the left on desktop | Accent line under headings, open cards with a coloured top edge | Modern, clean (trades, cleaners, fitness) |
| `editorial` | Very large heading, edge-to-edge photo below | Ruled headings, services as rows, square gallery | Bold, confident brands (barbers, studios, shops) |
| `arch` | Large heading beside a photo in an arch-shaped frame (heading first on phones) | Centred headings, arch-topped cards, arch-shaped gallery and strip photos | Elegant, soft (beauty, florists, bridal, wellness), lovely with a luxury palette |

## Extra touches
These work with every layout:

- **Cards over the photo** (`brand.stripStyle: 'cards'`): the reassurance strip becomes floating
  cards over the bottom of the top photo, in the palette's strip colour. Leave it out (or `'band'`)
  for the full-width bar.
- **Photo strip** (`sections.photoStrip`): a row of 3 to 6 square photos, straight under the
  top section unless `brand.order` places it.
- **Review panel** (`work.reviewPanel: { on: true, review: 1, after: 1 }`): one real review in a
  coloured tile inside the gallery, after photo number `after`. Only with `reviews.consentConfirmed: true`,
  word for word, 220 characters at most (the build checks; reviews are never shortened). Full
  width on phones so the whole review fits.

## Section order
The middle of the page can be in any order too. Set `brand.order` to the sections you want
first, in order:

```js
brand: { order: ['work', 'services', 'location', 'bookingSteps'], ... }
```

- Can move: `photoStrip`, `services`, `plan`, `work`, `bookingSteps`, `reviews`, `coverage`, `location`.
- The photo strip (`sections.photoStrip`, a row of 3 to 6 square photos) sits straight under the top section unless you list it somewhere in `brand.order`.
- Always first: the top section and its reassurance strip. Always last: the closing call to action.
- The price table and add-ons always stay straight after services.
- Anything not listed keeps its usual place after the listed ones. Switched-off sections are skipped.
- The top menu follows the same order.

Ideas by business type:
| Business | Suggested order | Why |
|---|---|---|
| Photo-led (hair, barbers, food) | work, services, location, bookingSteps | Show the work first |
| Walk-in shop or salon | location, services, work, bookingSteps | Where and when first |
| Mobile service (cleaners, trades) | services, coverage, bookingSteps, work | What, where you go, how to book |
| Price-led (fixed packages) | services, bookingSteps, work, location | Prices and booking first |
| Trust-led (with real reviews) | reviews, services, work, location | Lead with what customers say |

## Every site is unique
The build compares each site with the other client folders next to it. If two sites would
have the **same palette, layout and section order**, a preview build warns and a `--live`
build refuses. If they only share a palette and layout, the build warns.

## Inspiration
The owner's layout boards, and what each one teaches, are in `docs/layout-toolkit/README.md`.

## Choosing
- **No two clients in the same area should share the same layout and palette pair.** Check the other client folders first.
- `overlay` needs a good, uncluttered photo: the heading sits on top of it.
- Record the choice in the client's `PLAN.md`, next to the palette.
- Older sites without `layout` use `split`, the original look.

## In use
| Client | Layout | Palette | Order |
|---|---|---|---|
| SM Danny's | `overlay` | `velvet-forest` | services, work, location, bookingSteps |
| Deb n Hair | `centered` | `retro-sunset` | location, services, work, bookingSteps |
| Yasin's Slick N Style Cutz | `editorial` | `graffiti-night` | work, services, bookingSteps, location |
