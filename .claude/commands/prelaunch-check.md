---
description: Full safety and quality check before a client site goes live
---

Run the full pre-launch check for this client, using `docs/03-prelaunch-checklist.md`. Don't change, publish or push anything.

1. Confirm this is a client folder (it has `client/content.js`). If it's the toolkit, stop and ask which client.
2. **Sign-off:** confirm `PLAN.md` records who approved the wording, how and when, and that it matches `status.wordingSignedOff`. If not, this is a **blocker**.
3. Run `node tools/build_site.js . --live`, then `node tools/check_site.js . --live`. Report the real output.
4. **Facts:** compare every price, number, address, hour, area and claim on the built pages with `content.js` and my source notes. Flag anything with no source.
5. **Reviews:** confirm consent is recorded, and that they are word for word.
6. **Photos:** look at every published image at full size for number plates, house numbers, street names, faces and personal details. Show zoomed crops of anything doubtful. Confirm no EXIF or GPS data in `site/images`.
7. **Screenshots:** view phone and desktop, and read all the wording for typos, hype and exclamation marks.
8. **Limited company:** confirm the footer details if `legalForm` is `limited`.
9. **Leak check:** search `site/` for placeholders, other clients' details and test content.
10. **Remind me** of the by-hand items: Cloudflare password, 2FA and recovery codes; domain in the client's name; MX and DNSSEC check; testing every contact button on my phone.

Report by priority: **Blockers**, **Should fix**, **Nice to have**, then what I must check by hand. Propose fixes and wait for my OK.
