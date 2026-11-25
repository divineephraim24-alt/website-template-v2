# QUICK START: someone wants a website

Open VS Code in `C:\Users\HP\Projects\Website-Template`, open Claude Code, and follow these steps. Full detail and prompts are in `docs/02-build-workflow.md`.

**First client ever?** Set up Cloudflare and GitHub with their **own password, 2FA and safely stored recovery codes**, plus a separate business email (`docs/04`, `business/notes.md`).

**0. Toolkit health check (10 to 15 min).** Paste:
> Run a toolkit health check. Build temporary test content in .tmp/tests for 3 made-up businesses (mobile; premises in light mode; both, with video and an extra page) using different contact methods, sections and style options. Run build_site and check_site on each, and confirm broken content is refused. Check docs/04-hosting-domain-ownership.md against Cloudflare's current documentation and tell me anything that has changed. Then delete all test content, confirm git status is clean, and report the results.

**1. Collect (client: 30 to 60 min).** Send your Google Form link (set it up once from `docs/01b`) or the Word form (`docs/01c`), or go through `docs/01` on a call. Send `docs/client-photo-guide.md`. You need: what they do, services and prices, how customers contact them, areas or address and hours, photos, logo, reviews **with consent**, sole trader or limited, domain and email situation.

**2. Quote (30 min).** Fill in `business/proposal-template.md`. Get acceptance and a **deposit** before building.

**3. Start (5 to 10 min).** Type `/new-client Client Name`, then paste:
> Business type: [what they do]
> Service mode: [we go to them / they come to us / both]
> Here is everything I have: [paste notes, form answers, prices, policies]
> Photos, logo and videos are in: [folder path, or "none yet"]
> Fill in content.js from this only. Don't invent anything. List everything missing in QUESTIONS.md as plain questions, suggest which sections suit this business with one-line reasons, then stop and wait for my OK.

**4. Answer the gaps (1 to 3 days, mostly waiting).** Send `QUESTIONS.md` to the client, paste their answers back, and agree the sections and style.

**5. Build (1 to 2 sessions).** Claude builds one section at a time with phone and desktop screenshots. Reply "OK, next" or say what to change.

**6. Client approval (1 to 3 days, mostly waiting).** Say "Make the preview file" and send it. The client must **approve the wording in writing**. Tell Claude who approved it, how and when.

**7. Check (about 1 hour).** Run `/prelaunch-check`, fix what it finds, then test every button on your own phone.

**8. Go live (about 1 hour, plus up to a day for the domain).** Say:
> Walk me through going live, one step at a time, using docs/04-hosting-domain-ownership.md. Show me each dry run before anything is uploaded. Don't touch the domain or DNS until I say so.

The domain must be **in the client's name and paid by them**. Check MX records and DNSSEC first.

**9. Hand over (30 min).** Ask Claude to fill in `docs/owner-guide.md`. Send it, set up any care plan, and invoice the balance.

**Changing a site later:** open `C:\Users\HP\Projects\Clients\<name>` in Claude Code and say: "Read PLAN.md. [The change.] Update content.js, rebuild, check it, and show me before publishing."
