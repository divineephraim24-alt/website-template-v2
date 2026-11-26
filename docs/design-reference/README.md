# Design reference: what the 1,000 most-visited websites do

Use this when creating or changing a design (a new client's look, the engine's sections or
styles). It shows what the most-visited websites have in common, so our sites feel familiar
and easy to use, without looking like everyone else's.

**Use patterns, never copy.** Don't copy another site's layout closely, its logo, wording,
images or brand colours. The thumbnails in `examples/` are for reference only and must never
go on a client site.

## What's here
| File | What it is |
|---|---|
| `NUMBERS.md` | The patterns in plain numbers: colours, text sizes, fonts, buttons, layout |
| `data/sites.csv` | One row per site with its measurements (open in Excel or Google Sheets) |
| `examples/` | Phone and desktop thumbnails of 24 sites that do the phone basics well |
| `excluded.txt` | Sites removed by hand (adult, betting, likely pirated), with reasons |
| `collect.js`, `summarise.js` | The scripts that made all of this, to run again later |

How it was made: the 997 most-visited *different* websites in the Tranco ranking (list JZW4Y,
25 November 2026), each homepage opened at phone size (iPhone 13) and desktop size (1366 px).
Server addresses, sites that block automated browsers, country copies of the same site, and
adult and gambling sites were skipped. These are mostly big platforms, not local businesses,
so treat the numbers as "what people are used to", not "what a salon should look like".

## What it means for our sites

**Readability: keep what we have.** Most sites use 16 px body text with 1.5 line spacing. Ours
is 17 px with 1.6, a little larger and airier. That suits local customers of every age.
Keep it. Headings on phones are usually about 32 px. Ours (32 to 52 px) are in line.

**Buttons: we're ahead.** Only 44% of the top sites have phone buttons at least 44 px tall.
Ours are at least 48 px. Never go below 44 px.

**Colour: stand out on purpose.** 88% of top sites are light, and 44% of their buttons are
blue. A light site with blue buttons looks like everyone else. Use a named palette from
`docs/colour-palettes/`. None of them uses blue for its main button.

**Fonts.** 78% of top sites use their own font, not the phone's built-in one. Our palettes now bring a heading font per mood (see `docs/colour-palettes/README.md`).
Inter, Roboto, Open Sans and Poppins are the most common. Our sites use built-in fonts, which
load fastest but look more ordinary. Adding a licensed .woff2 font (`brand.fontFile`) is the
easiest way to make a site feel more designed. Pair it with the palette's mood.

**First screen.** 89% show a clear heading on the first phone screen, and about half show a
large photo or video. Our top section does both. A real photo of the client's work there
matters more than anything else.

**Header and menu.** Phone headers are usually 54 to 81 px tall, and about half hide the menu
behind a menu button. Ours is 72 px with a call button, which suits a local business better:
the one thing customers want is to get in touch.

**Width.** Desktop content is usually 580 to 1,170 px wide, and paragraphs about 370 to 680 px.
Ours (up to 1,120 px, paragraphs up to 70 characters) is in line.

**Length.** Phone pages are usually 5 to 17 screens long. Ours are shorter, which is right for
a small business: say what you do, where, how to book, and stop.

**Never scroll sideways.** Only 1% of top sites scroll sideways on a phone. `check_site.js`
already catches this on ours.

## Run it again
About once a year, with a fresh ranking from https://tranco-list.eu (top-1m.csv):

```
node docs/design-reference/collect.js top-1m.csv <work-folder> 1000
node docs/design-reference/summarise.js <work-folder> 1000
```

Set `TRANCO_ID=<list id>` before `summarise.js` so `NUMBERS.md` names the list. Takes about
1 to 2 hours. Check `data/sites.csv` by eye for anything unsuitable and add it to
`excluded.txt` before using the results.
