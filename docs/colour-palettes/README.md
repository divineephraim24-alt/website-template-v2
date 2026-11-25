# Colour palettes

Every new client site uses one of these palettes, so sites don't share the same plain look.
Set it in `client/content.js`:

```js
brand: { palette: 'velvet-forest', font: 'classic', corners: 'soft', ... }
```

A palette colours the whole site: the page, alternate sections, cards, text, buttons, the
reassurance strip and the footer. The build checks every text colour for readability
(WCAG contrast) and moves anything hard to read to the nearest readable shade, so bright and
pastel colours are safe. The palettes live in `engine/themes/palettes.js`.

`boards/` holds the owner's reference boards the palettes come from (luxury, uptown modern,
hip hop, 90s). They are for reference only: never put them on a client site.

## How to choose
- Pick the **mood** that suits the client and their customers, then the palette inside it.
- **Don't give two clients in the same area the same palette.** Check the other client folders first.
- Show the client the preview and let them choose. Record the choice in `PLAN.md`.
- If the client has their own brand colours, add a new palette for them in `palettes.js` (copy one, rename it).

## The palettes

| Palette | Mood | Feel | Page | Strip | Footer | Buttons |
|---|---|---|---|---|---|---|
| `wine-and-stone` | Luxury | Calm, stone and wine | light stone #EFE9E1 | taupe #D1C7BD | charcoal #322D29 | wine #72383D |
| `velvet-forest` | Luxury | Rich, vintage, bold | forest green #1E3226 | copper #C27E35 | deep green #15241B | mustard #CCB363 |
| `navy-and-gold` | Luxury | Classic, polished | navy #1F3345 | sea green #89ABAA | near-black #0B1620 | gold #C78F57 |
| `fresh` | Uptown modern | Natural, earthy | linen #EFE9E1 | dusty blue #73A1B2 | dark brown #290907 | sage #6E8658 |
| `sage-and-peach` | Uptown modern | Soft, pastel, modern | warm white #FEF9F5 | pickle green #7B9080 | charcoal #30302E | hunter green #3E4B4A |
| `indigo-and-honey` | Uptown modern | Bright, friendly | cream #FFF9E8 | periwinkle #A7B0FE | indigo #3A2460 | indigo #5A3786 |
| `street-neon` | Hip hop | Loud, electric | charcoal #231F20 | flamingo #FC05B8 | azure #0AA9E0 | neon lime #7BF004 |
| `graffiti-night` | Hip hop | Urban, warm | near-black #0F0E0B | teal #56B2AC | plum brown #664D49 | orange #E68C32 |
| `purple-and-gold` | Hip hop | Bold, regal | deep purple #2A0B40 | violet #A134BE | royal blue #2825B9 | yellow #FFDF01 |
| `fresh-prince` | 90s | Playful, bright | pale lemon #FFFDF0 | hot pink #FF1493 | turquoise #00CED1 | purple #8A2BE2 |
| `retro-mint` | 90s | Fresh, retro | mint white #F3FFF9 | mint #00DB96 | magenta #E10086 | purple #49297E |
| `retro-sunset` | 90s | Warm, retro | cream #FBF3E4 | steel blue #3A7D9D | plum #7F2F75 | raspberry #AD3A6D |

Some colours are shown slightly lighter or darker on the site than listed here, where needed for readability.

## In use
| Client | Palette |
|---|---|
| SM Danny's | `velvet-forest` |
| Deb n Hair | `retro-sunset` |
| Yasin's Slick N Style Cutz | `graffiti-night` |
