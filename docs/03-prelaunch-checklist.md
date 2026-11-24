# Pre-launch checklist

Nothing goes live until every box is ticked. `/prelaunch-check` covers the automatic parts and reports the rest.

## 1. Your accounts (do this BEFORE the first client)
- [ ] **Cloudflare has its own password** (not only "Continue with GitHub")
- [ ] **Cloudflare two-factor authentication is on**
- [ ] **Cloudflare recovery codes are stored safely**, away from this computer and never in a project file
- [ ] GitHub has 2FA on, with recovery codes stored safely
- [ ] **2FA on every other admin login** for this site: domain registrar, Google Search Console, Google Business Profile, booking tool
- [ ] A separate business email is used for client accounts and messages

## 2. Agreement and ownership
- [ ] Proposal accepted and deposit received
- [ ] Domain is **in the client's name and paid by them**
- [ ] Client knows the exit plan and "if I'm unavailable" terms
- [ ] Client controls their own Google Business Profile

## 3. Content (from the client, nothing invented)
- [ ] **Wording signed off in writing**, recorded in `PLAN.md` and `status.wordingSignedOff`
- [ ] `wordingDraft` is false and no draft banner shows
- [ ] Every price, phone number, address and opening time compared with the client's own information
- [ ] Every claim (insured, qualified, years, guarantees) is confirmed by the client
- [ ] Reviews are real, word for word, with consent
- [ ] Limited company: name, number, where registered and registered office shown correctly
- [ ] Privacy note matches how the client really handles details (not legal advice)
- [ ] **Terms and conditions** and **refunds and cancellations** pages written only from the client's answers, and checked by the client (not legal advice)
- [ ] SEO title and description read well for this business (the build warns if too long)

## 4. Photos and video
- [ ] Client owns or has permission for every image
- [ ] Number plates, house numbers, street names and personal details blurred, checked by zooming in
- [ ] People shown have agreed
- [ ] The test for hidden photo data passes (the tools strip it)
- [ ] **Every image previewed** on phone and desktop: right photo in the right place, not stretched, blur boxes cover what they should
- [ ] **Every image description (alt text) read once** and it says what the photo shows (the build refuses empty ones)

## 5. Automatic checks
- [ ] `node tools/build_site.js . --live` succeeds
- [ ] `node tools/check_site.js . --live` reports **0 problems**. This also checks: no API keys or passwords in the published files; no forms (so no spam protection needed) and no cookies or tracking (so no cookie banner needed); privacy, terms and refunds linked in the footer; robots.txt lets Google in

## 6. On your own phone, using the Cloudflare preview address
- [ ] Every contact button works: WhatsApp opens with the right message, Call dials, email opens, booking link loads
- [ ] Every external link opens the right page (Google, social, maps)
- [ ] Menu, FAQ and extra pages work
- [ ] Video plays on an iPhone, if the site has one
- [ ] Read every word once, slowly

## 7. Domain and hosting
- [ ] Existing **MX and TXT records** reviewed, and email plan agreed
- [ ] **DNSSEC is off** at the registrar before changing nameservers
- [ ] Web Analytics, Rocket Loader and Email Address Obfuscation are **off**
- [ ] Email protection records added **only** if the domain sends no email, and agreed

## 8. After it goes live
- [ ] https://domain loads with a padlock, and www redirects to it
- [ ] Security headers present, and the pages.dev address is hidden from Google
- [ ] Sitemap submitted in Google Search Console (client's account, or with their permission)
- [ ] In Search Console, **URL Inspection** on the home page says it can be indexed (robots.txt is not blocking Google)
- [ ] http:// and www addresses both redirect to https:// (Cloudflare **Always Use HTTPS** on)
- [ ] Link preview looks right when sent in WhatsApp
- [ ] Uptime monitor added
- [ ] Domain renewal date recorded, auto-renew on
- [ ] Owner guide sent and balance invoiced
