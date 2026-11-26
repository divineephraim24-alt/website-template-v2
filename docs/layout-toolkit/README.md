# Layout toolkit

The owner's layout inspiration boards (from the "layout toolkit" folder in Google Drive,
26 November 2026). Use them when choosing a client's layout and section order, or when adding
a new layout to the engine.

**Reference only.** Several boards show other companies' designs and templates. Take the
idea (the arrangement, the rhythm, the order), never the logo, wording, photos, illustrations
or exact look. These images never go on a client site.

## What each board teaches

| Board | The idea worth taking | How to use it with the toolkit now |
|---|---|---|
| `01-landing-page-wireframe` | A simple rhythm: a dark top section with the offer, then alternating light and dark bands, with icons beside short text | Any layout: our sections already alternate backgrounds. Keep each section to one idea |
| `02-winning-landing-page-formula` | A proven order: sticky header, offer, social proof, benefits, services, testimonials, answers to doubts (FAQ), final call to action, simple footer | Use as a `brand.order` guide: `reviews` early when the client has real ones, then `services`, `work`, `location`. Our header, FAQ page and closing section cover the rest |
| `03-corporate-photo-header-and-icons` | Photo header with a centred welcome line, then services as three icon columns | `overlay` or `centered` layout. The reassurance strip already uses icons |
| `04-editorial-arch-photos` | Huge light serif heading over a dark ground, photos in arch-shaped frames, an elegant, gallery-like feel | `arch` layout (built), ideally with a luxury palette and the Cormorant Garamond font |
| `05-illustrated-full-screen-hero` | One full-screen image with a short, bold word and one button | `overlay` layout with one strong photo. Keep the heading short |
| `06-florist-photo-strip-and-stats` | A strip of square photos straight after the top section, then a "meet the owner" panel, then a row of big numbers | The photo strip (built): `sections.photoStrip`. Numbers only if the client gives real, provable ones (our rules: never invent figures) |
| `07-full-photo-hero-with-cards` | A full-photo top section with small cards overlapping its bottom edge | `overlay` layout with `brand.stripStyle: 'cards'` (built) |
| `08-asymmetric-photo-grid` | Big welcome on the left, photo on the right, then an uneven photo grid with one coloured review panel | `mirror` or `split` layout, with `work` before `services`. The review panel (built, `work.reviewPanel`) suits a client with real reviews |

## Ideas for future layouts
All four ideas from these boards are now built:

- **Arch:** built. Use `brand.layout: 'arch'` (board 04).
- **Cards over the photo:** built. Use `brand.stripStyle: 'cards'` (board 07).
- **Photo strip:** built. Switch on `sections.photoStrip` and list 3 to 6 photos (board 06).
- **Review panel:** built. Use `work.reviewPanel`, only with a real review and consent (board 08).

## Rules that still apply
- Facts only from the client's `content.js`: no invented numbers, reviews or claims, even where a board shows them.
- Photos only the client's own, or stamped "EXAMPLE PHOTO" stock in drafts.
- Every site stays unique: palette, font, layout and section order (`docs/06-layouts.md`).
