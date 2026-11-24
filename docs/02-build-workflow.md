# Build workflow

Every stage, with the prompt to paste and roughly how long it takes. Claude works from **facts the client gave you only**, and waits for your OK at each checkpoint.

## Rules for every stage
- `client/content.js` is the single source of truth. No invented prices, reviews, claims or hours.
- All wording is a **draft** (`status.wordingDraft: true`, with a visible banner) until the client **signs it off in writing**. Record it in `PLAN.md` and `status.wordingSignedOff`.
- Originals in `client/media/` are never edited.

## Stage 0: Toolkit health check (10 to 15 min, before each new client)
Open Claude Code in `C:\Users\HP\Projects\Website-Template`:
> Run a toolkit health check. Build temporary test content in .tmp/tests for 3 made-up businesses (mobile; premises in light mode; both, with video and an extra page) using different contact methods, sections and style options. Run build_site and check_site on each, and confirm broken content is refused. Check docs/04-hosting-domain-ownership.md against Cloudflare's current documentation and tell me anything that has changed. Then delete all test content, confirm git status is clean, and report the results.

## Stage 1: Collect and quote (client: 30 to 60 min. You: 30 min)
Send the intake form and photo guide. Fill in `business/proposal-template.md`. Get acceptance and a deposit **before** building.

## Stage 2: Start the client (5 to 10 min)
> /new-client Client Name

Then paste (this is the **first prompt**):
> Business type: [what they do]
> Service mode: [we go to them / they come to us / both]
> Here is everything I have: [paste notes, form answers, prices, policies]
> Photos, logo and videos are in: [folder path, or "none yet"]
> Fill in content.js from this only. Don't invent anything. List everything missing in QUESTIONS.md as plain questions, suggest which sections suit this business with one-line reasons, then stop and wait for my OK.

## Stage 3: Questions and sections (1 to 3 days, mostly waiting on the client)
Send `QUESTIONS.md` to the client. When answers arrive:
> Here are the client's answers: [paste]. Update content.js and QUESTIONS.md. Show me what's still missing.

Agree the sections:
> Use these sections: [list, or "your suggestions are fine"]. Style: [dark or light, accent colour, font, corners].

## Stage 4: Photos (20 to 40 min)
> Copy the photos from [folder] into client/media without changing the originals. Show me a contact sheet and suggest which photo goes where. Check each one for number plates, house numbers, faces and signs, add blur boxes, and show me zoomed crops to confirm.

## Stage 5: Build, section by section (1 to 2 sessions)
> Build the site one section at a time, in page order. After each, show phone and desktop screenshots and wait for my OK.

Reply "OK, next" or say what to change.

## Stage 6: Client preview and sign-off (1 to 3 days, mostly waiting)
> Make the preview file.

Send the file from `.tmp/`, and ask:
> Here's a preview of your website. Please check every price, time, detail and sentence. Reply with any changes, or "I approve the wording" when you're happy.

Allow the agreed revision rounds. When they approve:
> The client approved the wording: [who, how, date]. Record it in PLAN.md and content.js, and set wordingDraft to false.

## Stage 7: Pre-launch check (about 1 hour)
> /prelaunch-check

Fix anything it finds, then work through the by-hand items in `03-prelaunch-checklist.md` on your own phone.

## Stage 8: Go live (about 1 hour, plus up to a day for the domain)
> Walk me through going live, one step at a time, using docs/04-hosting-domain-ownership.md. Show me each dry run before anything is uploaded. Don't touch the domain or DNS until I say so.

## Stage 9: Hand over (30 min)
> Fill in docs/owner-guide.md for this client and list the accounts and renewal dates for the handover.

Send the guide, confirm what the client owns, set up the care plan if agreed, and invoice the balance.

## Later changes
Open the client's folder in Claude Code:
> Read PLAN.md. [Describe the change.] Update content.js, rebuild, check it, and show me before publishing.

Publishing a change: `node tools/build_site.js . --live`, then `node tools/check_site.js . --live`, then dry-run, commit and push inside `site/`.

## When something fails
Read the build's message: it says what to fix and where. If a tool itself is wrong, Claude proposes the change first. If the fix is a lasting lesson, add it to the toolkit (not just the client copy) and to this guide.
