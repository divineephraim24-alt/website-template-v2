# Rules for Claude: small-business website toolkit

This folder is a **toolkit** for building fast, phone-first websites for small local businesses (trades, cleaners, beauty, food, fitness, mobile services, shops). Each real client gets their own project folder at `C:\Users\HP\Projects\Clients\<name>`, created with `/new-client <name>`. That folder contains a copy of these rules.

The person you work with is a beginner at coding. Explain things in plain English, keep steps small, and wait for approval at each checkpoint.

## The source of truth
- **`client/content.js` holds every fact about the business**: name, services, prices, policies, hours, areas, reviews, contact details, brand. Never put a fact on the website that isn't in `content.js`, and never put one in `content.js` that the owner or client didn't provide.
- **Never invent facts**: no made-up prices, opening hours, reviews, qualifications, awards, guarantees, years in business, insurance claims or customer numbers. If something is missing, add it to `QUESTIONS.md` as a plain question for the client.
- **Wording:** draft the site's wording from the client's facts only. Keep `status.wordingDraft: true` (which shows a "DRAFT WORDING" banner on every preview) until the client has **signed off the wording in writing**. Record that sign-off in the client's `PLAN.md` and in `status.wordingSignedOff`. The build refuses `--live` until then.

## Originals and privacy
- **Never edit, rename or delete anything in `client/media/`** (the client's originals). Work only on copies.
- **Photos and video:** blur number plates and house numbers, and avoid other identifiable people, street names and signs. Strip hidden photo data (EXIF and GPS). Check by looking at zoomed crops.
- **Reviews:** only real reviews, **word for word**, with the customer's consent to show their first name and town. Never write, edit or "improve" a review.
- **Images:** use only photos the client owns or has a licence for. Never take images from Google or social media without permission.
- **Never put this toolkit's owner's own business details** (or any other client's) into a client site or into the toolkit.

## Writing style
- Plain British English: short sentences, no exclamation marks, no hype ("best in town", "unbeatable"). Premium and calm, not salesy.
- Use the voice the client chose (`business.voice`: "I" for one-person businesses, "we" for teams).
- Neutral, honest claims only. If a policy has limits (stain removal, results, weather), say so plainly.

## How we work
- **Small steps, with a checkpoint after each.** Show screenshots (phone and desktop) and wait for "OK" before moving on, unless told to carry on.
- **Propose, don't silently change:** changes to `tools/`, the `engine/`, brand colours, or anything already approved are proposed first.
- **Check before publishing:** `node tools/build_site.js <client> --live` must pass, then `node tools/check_site.js <client> --live` must report **0 problems**, and the sign-off must be recorded. Use `/prelaunch-check` before every launch.
- **git:** before any save or push, do a dry run (`git add --dry-run -A`) and look at the file list. Only `site/` goes to the client's private GitHub repo, never `client/media/`, notes or tools.
- **Security:** never store passwords, API keys or recovery codes in any file. The hosting Cloudflare account must have its own password, 2FA and stored recovery codes before any client site is hosted (see `docs/04-hosting-domain-ownership.md`).
- **Not legal, tax or financial advice:** business, contract and company-details notes point to official guidance; say so when relevant.
- **Colours:** every new site uses a named palette from `docs/colour-palettes/README.md` (set `brand.palette`), never the plain default dark or light look. Pick by mood, don't give two clients in the same area the same palette, and record the choice in the client's `PLAN.md`. Each mood brings its own heading font (stored in `engine/assets/fonts`, Open Font License); a client's own licensed font (`brand.fontFile`) wins. The reference boards there are never put on a client site.
- **Layouts and section order:** every new site also gets its own layout and section order from `docs/06-layouts.md` (set `brand.layout`: split, overlay, centered, mirror or editorial, and `brand.order`). Every site must be unique: no two clients may share the same palette, layout and order (the build checks the other client folders and refuses a `--live` build), and clients in the same area shouldn't share a palette and layout pair. Record the choices in the client's `PLAN.md`.
- **Design reference:** when creating or changing a design, check `docs/design-reference/README.md` (what the 1,000 most-visited websites do). Use patterns, never copy another site's layout, logo, wording, images or colours. Its example thumbnails never go on a client site.
- **Design taste skill** (`.claude/skills/design-taste-frontend`, MIT licence): use it for design ideas, layout and typography choices, finishing touches and design reviews, so sites don't look templated. **These toolkit rules win wherever they differ:** facts only from `content.js`; photos only the client's own, or stamped "EXAMPLE PHOTO" stock in drafts (never its automatic stand-in photos); colours from the named palettes; nothing loaded from other servers on a live site (no Google Fonts or icon CDNs: use a licensed `.woff2` in `brand.fontFile`); no shader effects or heavy animation; build through the engine and check with `check_site.js`. Changes it suggests to `engine/` or `tools/` are proposed first, as usual.
- **Code style:** when writing or changing code in `tools/`, `engine/` or a client's extra pages, follow `docs/05-code-style.md` (the parts of Google's Web Components Style Guide that apply to this toolkit; the full guide is in `docs/style-guide/`).

## Where things are
- `QUICK-START.md`: the one-page "someone wants a website" routine.
- `docs/02-build-workflow.md`: each stage, with exact prompts.
- `tools/build_site.js` builds `site/` from `content.js`; `tools/check_site.js` runs the full check; `tools/prepare_images.js` makes web copies of photos (run automatically by the build); `tools/screenshot.js` takes screenshots; `tools/make_preview_file.js` builds a one-file preview.
- **Lessons learned** (don't relearn them):
  - Cloudflare Pages doesn't support video range requests. `_worker.js` plus `_routes.json` (added automatically when a site has video) fix iPhone playback.
  - Pages serves `page.html` at `/page`: use the clean address in the sitemap and canonical tags.
  - In Cloudflare, use the **legacy Pages** route ("Continue to Pages"), not the Workers route.
  - Before changing a domain's nameservers, check that DNSSEC is off and look at its existing MX and TXT records.
  - Email Address Obfuscation is often ON by default for new Cloudflare domains: switch it off, along with Rocket Loader and Web Analytics.
  - Public DNS caches (e.g. 1.1.1.1) can show the old site for a few hours after a nameserver change.
  - In `.gitignore`, notes must go on their own lines.
