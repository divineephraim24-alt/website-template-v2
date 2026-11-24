---
description: Start a new client website from pasted notes
argument-hint: <client name>
---

Set up a new client called: $ARGUMENTS

Follow `CLAUDE.md` and `docs/02-build-workflow.md`.

1. If no name was given, ask for one. Otherwise run `node tools/new_client.js "$ARGUMENTS"` from the toolkit folder. If the folder already exists, stop and tell me. Work only inside the new client folder from now on.
2. If I haven't pasted anything yet, ask me to paste the business type and everything I have (notes, intake answers, prices, policies, where the photos are), then wait.
3. Read what I pasted. Fill in `client/content.js` **from that only**:
   - Never invent or assume a fact, price, review, qualification, hour or claim.
   - Draft wording from the facts in plain British English, in the client's voice, with no hype or exclamation marks. Keep `status.wordingDraft: true`.
   - Leave `[[placeholders]]` for anything unknown.
   - Set `serviceMode` and the contact methods from what I told you.
   - Only set `reviews.consentConfirmed: true` if I said customers agreed.
4. If I gave a photos folder, copy the files into `client/media` without changing the originals. Don't place them yet.
5. Write `QUESTIONS.md`: everything missing, as plain questions I can send to the client, most important first. Include sole trader or limited company, domain ownership and whether they use email on the domain, if unknown.
6. Suggest which sections suit this business, each with a one-line reason, and which to leave off and why.
7. **Stop here.** Show me a short summary, the questions and the suggested sections, then wait for my OK.

Only after my OK, build **section by section** in page order. After each section, build, take phone and desktop screenshots, show them and wait for my OK before the next.
