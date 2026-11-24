# Hosting, domain and ownership

Cloudflare's menus move often. If a button isn't where this says, press **Ctrl+K** in the dashboard and search for it by name. The toolkit health check re-checks this guide before each client.

## 1. Before your first client: secure your Cloudflare account
Every client's site will sit in your account, so a break-in would affect all of them.
1. Give Cloudflare **its own strong password** (not only "Continue with GitHub"). Use a password manager.
2. Turn on **two-factor authentication** with an authenticator app.
3. **Store the recovery codes safely**, away from this computer. Never put them in a project file.
4. Do the same on GitHub, and use your separate business email for both where practical.

## 2. Who owns what (option a, the standard setup)
| Thing | Owner | Paid by |
|---|---|---|
| Domain | **Client** | **Client** |
| Google Business Profile | **Client** | Free |
| Website files | Client, once paid in full (as in the proposal) | |
| Hosting | Your Cloudflare account | Free tier |
| Code repository | Your private GitHub | Free |

### The four protection rules
1. **The domain is always in the client's name and paid by them.** Never register it in yours.
2. **Exit plan:** on request, the client gets a zip of the site and an export of their DNS records, free, within 14 days.
3. **No email records you didn't agree to manage.** Never add, change or remove email records without agreeing it first.
4. **Option (b) is available:** a client who insists can have the site in their own Cloudflare account (section 8).

## 3. If the client has no domain yet
**Recommendation: `.co.uk`** for a UK local business, bought by the client at **Namecheap**, on their own account. It's simple, shows clear prices, and makes changing nameservers easy. Any reputable registrar is fine. Check current prices first, especially the **renewal** price.

Sit with them (or screen-share) while they:
1. Create the account with **their own email and card**. You never need their password.
2. Choose a short name that's easy to say and spell. Avoid hyphens. Check it doesn't copy another business's name or trade mark.
3. Buy **`.co.uk`**. Also buy `.com` only if they want it.
4. Turn **auto-renew on**, and check the card and contact email are current. If it lapses, the site disappears.
5. Keep **domain privacy** on where offered.
6. Skip upsells: hosting, email and website builders aren't needed.
7. Leave **DNSSEC off** until the site is connected.

## 4. Publish the site to GitHub
From the client folder, after `node tools/build_site.js . --live` and a passing check:
```
cd site
git init -b main
git config user.name kocall35
git config user.email 357385400+kocall35@users.noreply.github.com
git config core.autocrlf false
git add --dry-run -A
```
**Read the dry-run list.** It must show website files only. Then:
```
git add -A
git commit -m "First version of the website"
gh repo create <client>-website --private --source=. --push
```

## 5. Connect Cloudflare Pages
1. Cloudflare → **Workers & Pages** → **Create**. Choose the **Pages** route ("Continue to Pages" / "Looking to deploy Pages?"), **not** the Workers route.
2. **Import an existing Git repository** and pick `<client>-website`. Grant access to that repo only.
3. Build settings: framework **None**, build command **empty**, output directory **empty** (or `/`).
4. Deploy, then test on your phone at `<project>.pages.dev`.

## 6. Connect the domain
**Before changing anything:**
1. Look up and **write down the existing DNS records**, especially **MX** (email) and **TXT**. If the client uses email on this domain, those records must carry over exactly.
2. Check **DNSSEC is off** at the registrar. If it's on, turn it off and wait as instructed.

**Then:**
1. Cloudflare → **Add a domain** → the Free plan. Compare the imported records with your list.
2. Change the **nameservers** at the registrar to the two Cloudflare gives you. Ideally the client does this with you.
3. Wait for "Active": minutes to a day. Public DNS caches can show the old site for a few hours.
4. Pages project → **Custom domains** → add the main domain, then `www`.
5. Add a redirect so `www` goes to the main domain (Rules → Redirect Rules, "Redirect from WWW to root" template).
6. SSL/TLS: **Full (strict)**, with **Always Use HTTPS** on.

**Switch these off** for the domain: **Email Address Obfuscation**, **Rocket Loader**, **Web Analytics**. They inject scripts that the site's security policy blocks.

## 7. Email records
- **Client uses email on this domain:** keep their MX, SPF, DKIM and DMARC exactly as they are.
- **Domain sends no email,** and the client has agreed, add these to stop scammers faking it:
  - TXT `@`: `v=spf1 -all`
  - TXT `_dmarc`: `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s`
  - TXT `*._domainkey`: `v=DKIM1; p=`
- **If they add email later,** these records must be changed **at the same time**, or their real emails will be rejected.

## 8. Option (b): the client's own Cloudflare
The client creates a Cloudflare account with their own email, 2FA and recovery codes, then adds you as a member. Connect a GitHub repo they own, or hand over a zip for direct upload. Ongoing changes then depend on the access they give you, so reflect that in the price.

## 9. Exit plan (free, within 14 days of asking)
1. Zip the current `site/` folder.
2. Cloudflare → the domain → **DNS** → **Export** the records.
3. Send both, with a note of the nameservers and which records matter.
4. Help them point the domain to the new host, or tell them how. Remove the site from your account only **after** they've moved.

## 10. If you're unavailable
Agree this up front. It's also in the proposal.
- **Response times:** changes are normally answered within [2 working days]. Urgent faults (site down, wrong phone number) within [1 working day].
- **Holiday or illness:** tell care-plan clients before planned time off. Choose someone you trust as cover, or state plainly that there's none.
- **The site keeps running without you.** It doesn't rely on you day to day.
- **If the service stops:** give at least [30 days'] notice and carry out the exit plan for every client.
- **Keep a private "in case of emergency" note** saying where your accounts and client list are, for someone you trust. Don't store passwords in it; say where the password manager's emergency access is.
