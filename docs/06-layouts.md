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

## Choosing
- **No two clients in the same area should share the same layout and palette pair.** Check the other client folders first.
- `overlay` needs a good, uncluttered photo: the heading sits on top of it.
- Record the choice in the client's `PLAN.md`, next to the palette.
- Older sites without `layout` use `split`, the original look.

## In use
| Client | Layout | Palette |
|---|---|---|
| SM Danny's | `overlay` | `velvet-forest` |
| Deb n Hair | `centered` | `retro-sunset` |
| Yasin's Slick N Style Cutz | `editorial` | `graffiti-night` |
