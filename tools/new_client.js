// tools/new_client.js: sets up a folder for a new client.
//   node tools/new_client.js "Client Name"
//   node tools/new_client.js "Client Name" --into <parent folder>   (used for testing)
// Default location: C:\Users\HP\Projects\Clients\<client-name>
// Copies the engine, tools, docs, commands and rules, plus a blank content.js, and starts a
// local git history. It refuses to touch a folder that already exists.

const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const intoAt = args.indexOf('--into');
const parent = intoAt >= 0 ? path.resolve(args[intoAt + 1] || '') : path.resolve(ROOT, '..', 'Clients');
const name = args.find((a, i) => !a.startsWith('--') && (intoAt < 0 || i !== intoAt + 1));

if (!name) { console.error('Please give the client a name, like:  node tools/new_client.js "Sam Jones Plumbing"'); process.exit(1); }
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (!slug) { console.error(`"${name}" can't be used as a folder name. Use letters and numbers.`); process.exit(1); }
const dir = path.join(parent, slug);
if (fs.existsSync(dir)) { console.error(`${dir} already exists, so nothing was changed. Pick another name or open that folder.`); process.exit(1); }

fs.mkdirSync(dir, { recursive: true });
const copy = (from, to = from) => { const s = path.join(ROOT, from); if (fs.existsSync(s)) fs.cpSync(s, path.join(dir, to), { recursive: true }); };

copy('engine');
copy('docs');
copy('CLAUDE.md');
copy('.claude/commands');
fs.mkdirSync(path.join(dir, 'tools'));
for (const f of ['build_site.js', 'prepare_images.js', 'check_site.js', 'screenshot.js', 'make_preview_file.js']) copy('tools/' + f);
copy('client-starter', 'client');
for (const sub of ['photos', 'videos', 'logo']) fs.mkdirSync(path.join(dir, 'client', 'media', sub), { recursive: true });

fs.writeFileSync(path.join(dir, '.gitignore'), `# Built site (published from its own repo)
site/

# Temporary and regenerated files
.tmp/
.cache/

# The client's original photos and videos stay on this computer
client/media/**
!client/media/*/
!client/media/*/.gitkeep

# Secrets and local settings
.env
.claude/settings.local.json
`);

fs.writeFileSync(path.join(dir, 'QUESTIONS.md'), `# Questions for ${name}

Everything still missing from the website, in plain language. Claude fills this in after
reading your notes. Tick each one off when the client answers.

- [ ] (none yet)
`);

fs.writeFileSync(path.join(dir, 'PLAN.md'), `# ${name}: website record

## Status
- [ ] Intake answers received
- [ ] Quote accepted and deposit paid
- [ ] Questions answered
- [ ] Sections agreed
- [ ] Built section by section
- [ ] Wording signed off in writing
- [ ] Pre-launch check passed
- [ ] Live
- [ ] Handed over

## Wording sign-off (required before launch)
- Approved by:
- How (email, WhatsApp, signed):
- Date:
- Where the message is saved:

## Accounts and ownership
- Domain registered to (must be the client):
- Domain registrar:
- Hosting: my Cloudflare account (option a) / client's Cloudflare (option b)
- Google Business Profile owner:

## Decisions and notes
`);

const git = (...a) => {
  const r = spawnSync('git', a, { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('git ' + a[0] + ' failed: ' + r.stderr);
  return r.stdout;
};
try {
  git('init', '-b', 'main');
  git('config', 'user.name', 'kocall35');
  git('config', 'user.email', '357385400+kocall35@users.noreply.github.com');
  git('config', 'core.autocrlf', 'false');
  git('add', '-A');
  git('commit', '-m', `Start project for ${name}`);
} catch (e) {
  console.error('The folder was made, but saving to git failed: ' + e.message);
  process.exit(1);
}
console.log(`Created ${dir}`);
console.log('Next: open that folder in Claude Code and paste what you know about the business.');
