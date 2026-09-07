# BusinessServices — Visual Redesign Spec

**Date:** 2026-08-28
**Status:** Approved
**Scope:** Visual design only. No structural changes, no content/text changes.

---

## 1. Constraint

The governing rule from the user: **do not change the structure or the content texts — only improve the design.**

Operationally that means:

- No new sections, pages, or routes.
- No reworded, added, or removed user-facing copy in any of the 7 locales (`ru`, `en`, `fr`, `it`, `es`, `de`, `nl`).
- No changes to the translation objects in any page module.
- DOM element count and nesting stay as-is, with one class of exception: removing hardcoded `style="…"` attributes and adding `class="…"` hooks. These carry no semantic or textual meaning.

Two functional bugs were found during exploration and are explicitly in scope (see §7), plus the removal of one dead stylesheet.

## 2. Current-state assessment

`css/components.css` (~700 lines) is the only stylesheet actually loaded. `index.html` links it; `css/style.css` is never linked at all.

Problems, in rough order of impact:

1. **Fixed-attachment Unsplash background on `body`.** A remote hero photo set `center/cover no-repeat fixed` behind every page. It competes with all foreground content, and it is the root cause of problem 2.
2. **Compensatory glassmorphism.** Because the background is busy, nearly every surface carries `backdrop-filter: blur()` plus a translucent white fill. Eight separate `backdrop-filter` declarations. This is expensive to composite and produces muddy, low-contrast card edges.
3. **No design tokens.** ~40 hardcoded hex literals; spacing in ad-hoc px values with no scale. Changing the accent color means 40 find-replaces.
4. **Four duplicated rule blocks.** `.feature-badge`, `.features-grid`, `.portfolio-grid`, and `.portfolio-card` are each declared twice, with the later block overriding via `!important`. The file contradicts itself.
5. **Inline styles in JS override the stylesheet.** `header.js` (9-line inline style on the lang select), `portfolio.js` (extensive), `about.js`, `contacts.js`. Any stylesheet-level redesign of these areas is dead on arrival while these attributes exist.
6. **Mobile nav wraps to two rows,** compensated by pushing `.page-container` down to `padding-top: 145px`. Fragile and wastes the entire first viewport.
7. **No focus styles anywhere.** Zero `:focus` or `:focus-visible` rules. Keyboard navigation is invisible.
8. **No reduced-motion handling.** Every card animates unconditionally.
9. **Typography is the system font stack.** `style.css` declares Inter but is never loaded, so that intent is silently dropped.
10. **Undifferentiated hover states.** Every card type uses the same `translateY(-5px)` + shadow, so nothing has visual hierarchy.

## 3. Design direction

**Warm premium service brand.**

Deep teal-ink as the *structural* color (header, footer, emphasis surfaces), brass/amber as the *action* color (buttons, links, badges, focus). Warm paper canvas replaces the photographic background. Depth comes from hairline borders and tinted shadows rather than blur.

The intent is that the site reads as a trustworthy premium home-service brand rather than a generic blue SaaS template.

## 4. Foundations

### 4.1 Color tokens

Declared once in a `:root` block at the top of `components.css`.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0F2A2E` | header, footer, featured price card |
| `--ink-2` | `#0A1F22` | ink hover / added depth |
| `--canvas` | `#F7F5F1` | page background — replaces the Unsplash photo |
| `--canvas-2` | `#EFEBE4` | recessed / alternating surfaces |
| `--surface` | `#FFFFFF` | cards, form panel |
| `--border` | `#E6E0D6` | warm 1px hairline |
| `--text` | `#1A2E2C` | body copy |
| `--text-2` | `#5C6B68` | secondary / descriptions |
| `--text-3` | `#8A938F` | muted / meta |
| `--accent` | `#B26A20` | buttons, links, focus ring |
| `--accent-hover` | `#8F5318` | accent pressed/hover |
| `--accent-soft` | `#FBF1E3` | pills, tinted icon tiles |
| `--accent-on-ink` | `#E0A458` | logo span, links on dark surfaces |
| `--price` | `#2F6B4F` | price text — replaces neon `#10B981` |

Category badge colors (`badge-repair`, `badge-cleaning`, `badge-montage`) are retuned to muted equivalents that sit in the same family. Their class names and the `serviceCard.js` mapping are unchanged.

**Contrast:** every foreground/background pair must meet WCAG AA. `--accent` on `--surface` = 4.6:1. `--text` on `--canvas` ≈ 9:1. `--accent-on-ink` on `--ink` ≈ 6.4:1.

### 4.2 Typography

Two families, both carrying full Cyrillic coverage — required, since `ru` is a supported locale and the default in several modules.

- **Playfair Display** (700) — restricted to `.page-title`, `.hero-section h1`, `.section-title`.
- **Manrope** (400 / 500 / 600 / 800) — all other text.

Loaded from Google Fonts via `<link rel="preconnect">` + stylesheet `<link>` in `index.html` (not `@import`, which serialises the request). Every face gets a real fallback stack.

Fluid scale using `clamp()`, which removes the need for the three separate font-size overrides currently living in the mobile media queries:

| Role | Size |
|---|---|
| hero display | `clamp(2.25rem, 1.6rem + 2.6vw, 3.4rem)` |
| page title | `clamp(1.9rem, 1.5rem + 1.6vw, 2.6rem)` |
| section title | `clamp(1.5rem, 1.3rem + 0.9vw, 1.95rem)` |
| card heading | `1.2rem` |
| body | `1rem` / `1.65` |
| small | `0.875rem` |
| micro caps | `0.72rem`, `letter-spacing: .08em`, uppercase |

### 4.3 Spacing, radii, elevation

- Spacing: 4px base, `--s1`…`--s9` = 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radii: `--r-sm` 8, `--r-md` 12, `--r-lg` 18, `--r-pill` 999.
- Shadows: three levels, all tinted `rgba(23, 36, 34, …)`. Pure-black shadows over a warm canvas read as grey dirt; the tint keeps them clean.

## 5. Removals

- The `body` Unsplash background image and its gradient overlay.
- `backdrop-filter` on all surfaces **except** the header, where it is genuinely useful over scrolled content.
- All four duplicated rule blocks and every `!important` introduced to patch around them.
- `css/style.css` — dead, unlinked, and contradicts the live stylesheet. Deleted.

## 6. Component treatments

**Header.** Solid `--ink`, single 68px row. `.btn-nav` becomes solid accent (currently blue-on-navy, poor contrast). `#lang-select` drops its inline style and receives the `.lang-select` class, which already exists in the stylesheet but was never applied to anything.

**Header, mobile.** Rather than wrapping to two rows and compensating with `padding-top: 145px`, the nav becomes a horizontally scroll-snapped strip: `overflow-x: auto`, `scroll-snap-type: x proximity`, hidden scrollbar. One row at every viewport width, and no new DOM — which keeps it inside the no-structural-change constraint. `.page-container` top padding returns to a single value across all breakpoints.

**Hero.** Larger display type. Badge becomes a hairline accent pill. `.hero-stats` stops being a floating translucent slab and becomes a border-delimited strip with vertical dividers between `.stat-item`s.

**Cards (feature / service / portfolio).** One shared card language: solid `--surface`, 1px `--border`, `--r-lg`. Hover: border to `--accent`, elevation step up, `.feature-img` `scale(1.04)`, `.feature-link` arrow translates right. `.feature-img-wrapper` height 200px with a subtle bottom scrim so the badge stays legible over light photos.

**Service cards.** The emoji from `getIconForService` gets a 44px `--accent-soft` rounded tile instead of floating bare in the card header.

**Prices.** `.price-card.featured` inverts to an `--ink` background rather than merely gaining a colored border, so the "popular" tier reads at a glance. `.popular-badge` in accent. `.price-card ul li` gains a small accent bullet via `::before` — decorative only, no text content.

**About.** `.page-about .portfolio-card` gets prose treatment: `max-width: 68ch` measure control and a left accent rule.

**Contacts.** Inputs to 44px min height, warm borders, and a real focus treatment — `box-shadow: 0 0 0 3px` accent wash plus border color. The current design changes only the border color on focus, which is nearly invisible. Labels in micro-caps. `.contacts-info` becomes an inverted ink panel with hairline dividers between rows. Submit button full-width below 640px.

**Portfolio modal.** Dimmed + blurred backdrop, `--r-lg` panel, circular ink close button. `.slider-handle` becomes an accent circle. The two conflicting `.portfolio-card` definitions collapse into one.

**Footer.** Matches the header exactly — `--ink`, hairline top border.

## 7. Bug fixes

Both approved by the user as in scope.

1. **Broken navigation.** `js/components/header.js` emits `#services`, `#portfolio`, `#prices`, `#about`, `#contacts`. `js/router.js` registers `/services`, `/portfolio`, `/prices`, `/about`, `/contacts`. Since `handleRoute` does `hash.slice(1)`, every nav link resolves to `services` (no leading slash), misses the route table, and silently falls back to `renderHome`. Fix: prefix all five with `/`. This also repairs `updateActiveNavLink`, which compares against `#${path}` and therefore never matched. In-page links in `home.js` and `prices.js` already use the correct `#/contacts` form and are left alone.

2. **Duplicate layout elements.** `index.html` declares `<header id="header-container">`, `<main id="main-content">`, and `<footer id="footer-container">`. `js/app.js` then appends its own header, `main#main-content`, and footer to `#app`. This yields duplicate `id` attributes, and `document.getElementById('main-content')` returns the *first* — the empty placeholder that sits above the real header. Fix: remove the three placeholders from `index.html`; `app.js` already builds the real ones.

## 8. Files touched

| File | Change |
|---|---|
| `index.html` | Remove 3 placeholder elements; add font `<link>`s |
| `css/components.css` | Full rewrite against the token system |
| `css/style.css` | Delete (dead code) |
| `js/components/header.js` | Fix 5 hrefs; inline style to `.lang-select` |
| `js/pages/portfolio.js` | Strip inline styles; add class hooks |
| `js/pages/about.js` | Strip inline styles |
| `js/pages/contacts.js` | Strip inline style on `#form-status` |

Every JS edit is **style-attribute removal plus class-attribute addition only** — except the five href fixes in §7.1. No text, no elements, no logic.

`frontend/` is a stale duplicate of the root tree (older `portfolio.js`, shorter `components.css`). Root is what `index.html` serves. Left untouched by explicit decision.

## 9. Accessibility

- `:focus-visible` ring on every interactive element — links, buttons, `.tab-btn`, inputs, selects, textarea, `.modal-close`, `.slider-range`. Currently there are none at all.
- Full `@media (prefers-reduced-motion: reduce)` block disabling transforms and transitions.
- All color pairs verified at WCAG AA (§4.1).
- Interactive targets at least 44px in their smallest dimension.

## 10. Verification

No test framework exists in this project. Verification is therefore:

1. Serve the root over a local static HTTP server (ES modules require a real origin; `file://` will not load them).
2. Walk all six routes — `/`, `/services`, `/portfolio`, `/prices`, `/about`, `/contacts` — at 1440px, 768px, and 375px.
3. Confirm the §7.1 fix: each nav link lands on its own page and the correct link receives `.active`.
4. Confirm the §7.2 fix: exactly one `header`, one `main#main-content`, and one `footer` in the DOM, in that order.
5. Extract every `class` token referenced across `js/pages/*.js` and `js/components/*.js` and confirm each still resolves to a rule in the new stylesheet — guards against dropping a selector during the rewrite.
6. Confirm zero remaining `style="` attributes in the four touched JS files (excepting the `display:none` toggle on `#portfolio-modal`, which JS manipulates at runtime).
7. Diff all locale strings before and after to prove no copy changed.
