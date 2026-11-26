# Code style

Follow this whenever code is written or changed in `tools/`, `engine/` or a client's extra pages.

It takes the parts of Google's **Web Components Style Guide** that apply to this toolkit. The full
original is in `style-guide/google-web-components-style-guide.md`. It was written in 2014 for Google
engineers building Polymer components, so some of it doesn't fit plain, fast small-business sites.
Those parts are listed at the end, with the reason.

## Rules we follow

**Do one job well**
- Each tool, section and function does one clear job. If it starts doing two, split it.
- Reuse what is already in `engine/` (sections, themes, `lib.js`) instead of writing the same thing again.

**Explain the code**
- Every file starts with a short comment: what it does and how to run it (see the top of `tools/build_site.js`).
- Explain anything a beginner wouldn't follow, in plain English.

**Accessible from the start**
- Every image has alt text. Every button and link has a clear name. Tap targets are at least 44 by 44 pixels.
- Pages work with a keyboard and a screen reader, and have enough colour contrast. `tools/check_site.js` checks much of this: keep it at 0 problems.

**Names**
- Functions, settings and variables use camelCase when they have more than one word, for example `wordingDraft` or `selectPhoto()`.
- Don't start your own names with `$`. That style belongs to libraries.
- Files, CSS classes and ids use lowercase words joined with dashes, for example `price-table`.
- If a custom element (web component) is ever made, its name must contain a dash and start with a prefix
  that is ours, for example `<site-gallery>`. Never use `google-` or a name that could clash with someone else's.
  Events it fires start with the element's name, for example `site-gallery-open`.

**Settings and defaults**
- Give every setting a sensible default, and say in a comment which ones are required (as `client-starter/content.js` does).

**Files and assets**
- Shared files (styles, scripts, icons) live in `engine/assets/`.
- Images and video are always made smaller before going on a site. `tools/prepare_images.js` does this for photos.

**Outside code**
- Only add an outside library if there is no simple way without one, and propose it first.
- If one is added, pin an exact version and check its licence allows commercial use.

**Testing**
- After any change: build a test site, run `tools/check_site.js`, and look at phone and desktop screenshots before saying it works.

## Parts of the guide we don't follow, and why

- **Polymer, seed-element, bower, `on-tap`, `<template>` and `<shadow>` advice:** the toolkit doesn't use Polymer.
  These tools are discontinued, and plain HTML loads faster on phones.
- **Prefix elements with `google`:** that rule is only for Google's own elements.
- **Apache 2.0 licence, LICENSE file and copyright comment in demos:** these are for Google's open-source projects.
  Client sites are private, and the toolkit's licence is the owner's decision.
- **Mocha and Chai tests:** the toolkit has its own checks (`build_site.js` and `check_site.js`).
- **"Use declarative event handlers, never addEventListener":** this is Polymer-specific. In plain JavaScript,
  `addEventListener` is the normal, safe way.
