# Nextavéa Service — frontend work, returned

Your project, with a round of frontend work done on it. This package has the
site with full git history, the design spec and plan the work followed, and the
complete session log if you want to see the reasoning behind any decision.

**Date:** 2026-08-28
**Branch:** `redesign/warm-premium` — 26 commits on top of your original
**`main` is untouched** and still holds the site exactly as you left it (`2742368`)

Nothing is merged. Review the branch and merge it, cherry-pick from it, or bin
it — `main` is unchanged either way.

---

## 1. What's here

```
HANDOVER.md                    this file
site/                          the project, including .git
docs/
  ...-design.md                what was decided and why
  ...-cleaning-site-redesign.md the 9-task plan that was executed
chat/
  session-transcript.md        readable export of the whole session
  raw/                         original .jsonl logs + 22 sub-agent logs
```

Run it the same way as before — no build step, no new dependencies:

```bash
cd site
python -m http.server 8000
bash scripts/verify-redesign.sh    # 10 structural checks, exits 0 when clean
```

## 2. What changed

**The stylesheet was rewritten.** `css/components.css` is now driven by a
`:root` token block — teal-ink `#0F2A2E` for structure, brass `#B26A20` for
actions, warm canvas `#F7F5F1`. Change a token, not a rule. The old sheet had
`.feature-badge`, `.features-grid`, `.portfolio-grid` and `.portfolio-card`
each declared **twice** with contradictory values and `!important` patches;
those are gone. `css/style.css` was deleted — nothing linked it.

`!important` now appears exactly four times, all inside
`@media (prefers-reduced-motion: reduce)` where it is required. The check script
fails if a fifth appears.

**Three component files were deleted:** `js/components/header.js`, `footer.js`,
`serviceCard.js`. Nothing imported them — `js/app.js` and `js/pages/services.js`
both import from `js/components/index.js`, which holds the live copies. The
dead files had drifted (old service taxonomy, older footer text) and were a trap:
two rounds of edits were made to them before anyone noticed they had no effect.

**One real bug fixed:** `index.html` declared `header`, `main#main-content` and
`footer`, and `js/app.js` appended a second set — duplicate IDs, with pages
rendering into the empty placeholder above the real header. The placeholders are
gone; `app.js` builds the real ones.

**Typography:** Montserrat, self-hosted in `assets/fonts/` (400/600/700). The
top bar deliberately keeps Playfair Display + Manrope, pinned via
`--font-header-display` / `--font-header-sans` so a global font change can't
reach it.

**Branding:** `BusinessServices` → `Nextavéa Service` in the title, logo and
footer.

**Icons:** service categories now use the supplied artwork in
`assets/img/icons/` (originals kept in `source/`). Cleaning, restoration and
relocation are monochrome masks tinted with `currentColor`, so they follow the
tile — brass at rest, white on hover. Furniture is full-colour artwork, so it
keeps its own colours and doesn't invert; that was a deliberate choice, since
its line-art version was illegible at 28px. Emoji were removed from the 28
category-tab strings and replaced with the same icons.

**New: map picker on the order form.** `js/components/locationPicker.js`, using
Leaflet (self-hosted in `assets/vendor/leaflet/`) with OpenStreetMap tiles.
**No API key, no billing account** — deliberately, so nothing expires or needs
a card. Reverse geocoding via Nominatim with Photon as fallback. No pin exists
until the visitor allows location or clicks the map; geolocation is requested
only on the button, never on load; wheel zoom arms on click so page scroll isn't
trapped; expanding moves the same map element into the dialog, so there's one
instance and one marker. It writes into the existing `address` field and adds
hidden `lat` / `lng` to the form payload.

**Accessibility:** the old sheet had **zero** focus styles. There are now
`:focus-visible` rings on every interactive element, a full
`prefers-reduced-motion` block, and 44px minimum interactive targets.

**Content was not touched.** No user-facing string in any of the 7 locales was
added, removed or reworded, other than the two things you asked for: the
rebrand, and stripping the `✓` prefixes and tab emoji. Verified by diffing the
locale strings against the original commit.

## 3. What was left alone

- **`js/api.js` and the backend.** Untouched — still pointing at
  `https://localhost:7001/api`. Understood that this is yours to build. The
  order form posts `name, phone, serviceType, address, lat, lng, preferredDate,
  preferredTime, message` to `/requests`; `lat` and `lng` are the only new
  fields. On failure it still shows the existing optimistic success message.
- **`frontend/`.** Left in place, untouched. Worth knowing it's a stale copy of
  the whole site — old stylesheet, the dead component files, outdated content —
  and nothing serves it. It cost two rounds of wasted edits during this work.
  Deleting it is a one-liner if you agree, and it's recoverable from git.
- **Everything on `main`.**

## 4. Worth a look when you're in there

Small things, none urgent:

- **`js/pages/contacts.js` (~lines 309–322)** sets form-status colours inline:
  `#0284c7` and `#10b981`. `#10b981` is the exact green the new palette
  replaced, so it's the last fragment of the old scheme on the live site, and
  neither colour meets WCAG AA on white. `var(--price)` / `var(--text-2)` would
  fix it. Left alone because it's JS behaviour, not styling.
- **Fonts are TTF, ~1.4 MB.** No conversion tooling was available on this
  machine; WOFF2 would roughly halve that.
- **Commit author is `leont <leontachyan@gmail.com>`** on all 26 commits. That
  address was never confirmed with the owner of this machine, so it's probably
  wrong. If it matters before this joins your history:
  `git rebase -r --exec 'git commit --amend --no-edit --reset-author' 2742368`
  with the right `user.email` set.
- **Geolocation needs HTTPS.** Browsers only expose it in a secure context, so
  on a plain `http://` domain the "Use my location" button can't work. The code
  detects this and says so rather than hanging. Nominatim and Photon are free
  community services at roughly 1 request/second — fine now, swap in a paid
  geocoder if traffic grows. That change is contained to `reverseGeocode()`.

## 5. How far this was verified

Worth being straight about, since it affects how much you trust the visual work:

**No browser ever rendered any of this.** The machine had no Node, npm, or
headless browser — Python only. Layout, focus rings, the map, and the responsive
breakpoints were verified by measuring geometry, rendering preview images, and
reading the served bytes — not by clicking through. It's had human eyes on it
via screenshots during the work, but a proper pass in a real browser is the
obvious next step.

`scripts/verify-redesign.sh` checks structural invariants — no duplicate
selectors, no stray inline styles, locale completeness, balanced braces, the
`!important` confinement. It is not a functional test suite; there isn't one.

One correction that's recorded in the plan but wrong: section 7.1 claims the
site's nav links were broken. **They weren't.** That was diagnosed from the dead
`js/components/header.js` before anyone realised nothing imported it. Live
navigation was always fine. The duplicate-layout bug in 7.2 was real.

## 6. Where the detail is

`git log --oneline` on the branch reads as the story, one reviewed step at a
time. `docs/` holds the spec and plan those steps came from.
`chat/session-transcript.md` has every decision and the reasoning, including the
measurements behind the icon and layout choices.
