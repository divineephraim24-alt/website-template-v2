# Small-business website toolkit

A ready-to-go kit for building fast, phone-first, premium-looking websites for small local businesses: trades, cleaners, beauty, food, fitness, mobile services and shops. Built with Claude Code, hosted free on Cloudflare Pages.

**Someone wants a website? Open [QUICK-START.md](QUICK-START.md).**

## How it works (in one paragraph)
Each client gets their own folder in `C:\Users\HP\Projects\Clients\<name>` (created by `/new-client <name>`). All the client's facts and choices go in one file, **`client/content.js`**: business details, services and prices, policies, opening hours or areas covered, reviews, contact methods, sections on/off, colours, logo and style. `tools/build_site.js` turns that file plus the generic **engine** into a finished website in `site/`, checking everything first and explaining any problem in plain English. Only `site/` is published: to a private GitHub repo, then Cloudflare Pages, then the client's own domain.

## What's in here
| Folder or file | What it is |
|---|---|
| `QUICK-START.md` | The one-page routine for a new client |
| `CLAUDE.md` | The rules Claude follows (source of truth, privacy, wording, checks) |
| `.claude/commands/` | `/new-client` and `/prelaunch-check` |
| `engine/` | The generic website: sections, pages, styles, script, theme. **Never edited per client** |
| `client-starter/` | The blank `content.js` (every field with a `[[placeholder]]` and a note) and empty media folders |
| `tools/` | `new_client.js`, `build_site.js`, `prepare_images.js`, `check_site.js`, `screenshot.js`, `make_preview_file.js` |
| `docs/` | Intake questions (plus a Google Form version and a Word form to send clients), client photo guide, build workflow with prompts, pre-launch checklist, hosting/domain/ownership guide, owner guide |
| `business/` | What-you-get sheet, proposal template, business notes (not legal or tax advice) |

## What a site can include (every part is optional)
- **Sections:** hero, reassurance strip, services (cards with prices or "quote"), price-by-size table, add-ons, regular/subscription plan, our work (video, before/after, gallery), how booking works, reviews, where we work (mobile businesses), find us (premises: address, map link, opening hours, walk-ins), closing band, FAQ page, extra pages (menu, service details, gallery).
- **Contact methods**, switchable: WhatsApp, phone, email, booking link (Calendly, Fresha, Booksy…).
- **Style:** dark or light, accent colour, font style (modern, classic or friendly), corner roundness, logo.
- **Policies:** privacy, terms and conditions, and refunds and cancellations pages, linked in every footer (written from the client's answers only).
- **Built in:** security headers, sitemap, robots.txt, Google business details, link-preview image, 404 page, iPhone video fix, AA contrast, keyboard and reduced-motion support, no tracking or cookies.

## Requirements (already installed on this PC)
- Node.js (no packages to install)
- FFmpeg (photos, logo and preview images)
- Google Chrome (checks and screenshots)
- Git, plus the GitHub CLI (`gh`) signed in

## Version history
- **v1.0:** first complete toolkit.
- **v2.0:** prices typed as words are refused; privacy, terms and refunds pages; extra launch checks (leaked keys, forms, tracking, robots.txt, broken values).

## Version 2 list (not built yet: add when needed)
- Per-client time log template
- More themes (light-clean, bold-colour) and a side-by-side theme preview tool
- Video preparation tool (cut, loop, compress and blur clips; in v1, use clips that are already short and compressed)
- More commands: `/review-section`, `/publish`, `/update-content`
- Full handover pack: accounts and renewals sheet, change-request guide
- `serve_site.js`: test on a phone over home Wi-Fi (in v1, use the Cloudflare preview link)
- Automated self-test of the engine (in v1, a "toolkit health check" is run by asking Claude; see QUICK-START step 0)
