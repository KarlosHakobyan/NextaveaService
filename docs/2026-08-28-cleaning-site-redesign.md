# BusinessServices Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's generic blue-glassmorphism styling with a tokenized "warm premium service brand" design system, without altering any page structure or user-facing copy.

**Architecture:** A single stylesheet, `css/components.css`, rewritten around a `:root` design-token block. Inline `style="…"` attributes are first stripped out of the four JS page/component modules so the stylesheet is the only source of visual truth. Two pre-existing functional bugs (broken nav routing, duplicated layout elements) are fixed as part of the work.

**Tech Stack:** Vanilla ES modules, hash-based router, plain CSS (custom properties, grid, flexbox, `clamp()`). Google Fonts: Playfair Display + Manrope. No build step, no framework, no package manager.

**Spec:** [`docs/superpowers/specs/2026-08-28-cleaning-site-redesign-design.md`](../specs/2026-08-28-cleaning-site-redesign-design.md)

---

## Global Constraints

These apply to **every** task. Violating any of them fails the task.

1. **No content text changes.** Not one character of any user-facing string in any of the 7 locales (`ru`, `en`, `fr`, `it`, `es`, `de`, `nl`). Translation objects are read-only.
2. **No structural changes.** No elements added, removed, or re-nested. The only permitted attribute edits are: removing `style="…"`, adding `class="…"`, and the five `href` corrections in Task 1.
3. **`frontend/` is out of scope.** It is a stale duplicate tree. Do not read from it, do not write to it.
4. **Three inline styles MUST be preserved** because JS mutates them at runtime:
   - `js/pages/portfolio.js` — `<div id="portfolio-modal" … style="display: none;">` (set to `flex` on card click)
   - `js/pages/portfolio.js` — `<div class="img-wrapper before-img" style="width: 50%;">` (set by `updateSlider`)
   - `js/pages/portfolio.js` — `<div class="slider-handle" style="left: 50%;">` (set by `updateSlider`)
5. **This project is not a git repository.** `git commit` steps are therefore replaced by an explicit verification step at the end of each task. If the user later runs `git init`, add commits at those points.
6. **Token values are exact.** Copy hex values character-for-character from Task 3. Do not "improve" them mid-task; the palette is contrast-verified as a set.
7. **Serve over HTTP to test.** `js/app.js` is an ES module; `file://` will not load it. Use `python -m http.server 8000` from the project root.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `index.html` | Document shell, font loading, single stylesheet link | Modify |
| `css/components.css` | The entire design system — tokens through responsive | Rewrite |
| `css/style.css` | *(none — dead, unlinked, contradicts the live sheet)* | Delete |
| `js/components/header.js` | Header markup + lang switching | Modify (hrefs, de-inline) |
| `js/pages/portfolio.js` | Portfolio page + before/after modal | Modify (de-inline) |
| `js/pages/about.js` | About page | Modify (de-inline) |
| `js/pages/contacts.js` | Contact form | Modify (de-inline) |
| `js/app.js`, `js/router.js`, `js/pages/{home,services,prices}.js`, `js/components/{footer,serviceCard,index}.js` | — | **Untouched** |

`components.css` is written in nine ordered layers (tokens → reset → layout → header/footer → buttons → hero → cards → portfolio/prices/about → contacts → a11y → responsive). Tasks 3–8 each append one or more complete layers, so the file is built front-to-back and never contains a half-written rule.

---

## Task 1: Fix routing and layout bugs, load the fonts

Do this first. Until the nav works, you cannot visually verify any page except home, which makes every later task untestable.

**Files:**
- Modify: `index.html:14-23`
- Modify: `js/components/header.js:87-91`

**Interfaces:**
- Consumes: nothing
- Produces: a DOM with exactly one `header`, one `main#main-content`, one `footer`; working `#/route` links; `--font-display` / `--font-sans` families available to Task 3.

- [ ] **Step 1: Verify both bugs are real before fixing them**

```bash
# Bug A — nav hrefs lack the leading slash that router.js requires
grep -n 'href="#' js/components/header.js
# Expected: href="#services", href="#portfolio", href="#prices", href="#about", href="#contacts"

grep -n "'/" js/router.js | head -8
# Expected: routes keyed '/', '/services', '/portfolio', '/prices', '/about', '/contacts'

# Bug B — index.html declares layout elements that app.js also creates
grep -n 'id="header-container"\|id="main-content"\|id="footer-container"' index.html
grep -n "createElement('main')\|main-content\|renderHeader()\|renderFooter()" js/app.js
```

Expected: `header.js` emits five slash-less hashes that miss every route key, and both `index.html` and `app.js` create a `main-content`.

- [ ] **Step 2: Fix the five nav hrefs**

In `js/components/header.js`, inside the `header.innerHTML` template literal, change only the `href` values. **Leave `${t.…}` link text exactly as it is.**

```javascript
            <nav>
                <a href="#/">${t.home}</a>
                <a href="#/services">${t.services}</a>
                <a href="#/portfolio">${t.portfolio}</a>
                <a href="#/prices">${t.prices}</a>
                <a href="#/about">${t.about}</a>
                <a href="#/contacts" class="btn-nav">${t.btnRequest}</a>
```

Note the home link becomes `#/` (not `#`) so that `updateActiveNavLink`, which compares `href === '#' + path` and receives `path === '/'`, can match it and apply `.active`.

- [ ] **Step 3: Remove the duplicate layout elements and add font loading**

Replace `index.html` in full:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BusinessServices — Сервис бытовых и клининговых услуг</title>

    <!-- Шрифты -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;800&family=Playfair+Display:wght@700&display=swap">

    <!-- Подключение стилей -->
    <link rel="stylesheet" href="css/components.css">
</head>
<body>

    <!-- Шапка, контент и подвал генерируются в js/app.js -->
    <div id="app"></div>

    <!-- Установка lang для HTML из localStorage -->
    <script>
        const savedLang = localStorage.getItem('app_lang') || 'fr';
        document.documentElement.lang = savedLang;
    </script>

    <!-- Главный скрипт приложения -->
    <script type="module" src="js/app.js"></script>
</body>
</html>
```

The three placeholder elements are gone; `js/app.js` already appends the real `header`, `main#main-content`, and `footer` into `#app`. The `<title>`, the `lang` script, and the HTML comments are unchanged.

- [ ] **Step 4: Verify the fixes**

```bash
python -m http.server 8000 &
```

In the browser at `http://localhost:8000`, open DevTools console and run:

```javascript
[document.querySelectorAll('header').length,
 document.querySelectorAll('#main-content').length,
 document.querySelectorAll('footer').length]
```

Expected: `[1, 1, 1]` (was `[2, 2, 2]`).

Then click each of the six nav links. Expected: the URL hash changes to `#/services`, `#/portfolio`, `#/prices`, `#/about`, `#/contacts`, and **each renders its own page** rather than falling back to home. The clicked link gains a visible `.active` treatment.

Also confirm the fonts arrived:

```javascript
document.fonts.check('700 1rem "Playfair Display"') && document.fonts.check('400 1rem Manrope')
```

Expected: `true`.

---

## Task 2: Strip inline styles out of the JS modules

Must land before the CSS rewrite. Inline styles beat any stylesheet rule short of `!important`, so leaving them in place would silently defeat Tasks 3–8 in exactly the areas hardest to spot.

**Files:**
- Modify: `js/components/header.js:70-79`
- Modify: `js/pages/portfolio.js:219-242, 261-276`
- Modify: `js/pages/about.js:60-66`
- Modify: `js/pages/contacts.js:288`

**Interfaces:**
- Consumes: Task 1's corrected `header.js`
- Produces: class hooks that Tasks 4–8 style — `.lang-select`, `.portfolio-before-after-section`, `.portfolio-ba-grid`, `.portfolio-ba-card`, `.card-images-preview`, `.preview-half`, `.img-label`, `.page-about .portfolio-card`, `#form-status`

- [ ] **Step 1: De-inline the language selector**

In `js/components/header.js`, replace the entire `<select>` opening tag. The nine inline declarations move to the `.lang-select` rule (which already exists in the stylesheet but was never applied to anything). **All seven `<option>` lines stay byte-identical.**

```javascript
                <select id="lang-select" class="lang-select">
```

- [ ] **Step 2: De-inline the portfolio before/after section**

In `js/pages/portfolio.js`, within `container.innerHTML`:

```javascript
        <!-- Новый раздел: До / После со слайдером в карточках -->
        <div class="portfolio-before-after-section">
            <div class="page-header">
                <h2 class="page-title portfolio-ba-title">${t.beforeAfterTitle}</h2>
            </div>
            <div class="portfolio-ba-grid"></div>
        </div>
```

`portfolio-ba-title` is a new class carrying the `font-size: 1.8rem` that was inline. Keep the HTML comment.

- [ ] **Step 3: De-inline the before/after card template**

Still in `js/pages/portfolio.js`, in the `t.comparisonItems.forEach` block. Delete the `baCard.style.cursor = 'pointer';` line entirely (it moves to CSS), and replace the template. The two previously class-less `<span>`s gain `class="img-label"`, matching the labels already used inside the modal.

```javascript
        const baCard = document.createElement('div');
        baCard.className = 'portfolio-card portfolio-ba-card';
        baCard.innerHTML = `
            <div class="card-images-preview">
                <div class="preview-half">
                    <img src="${item.before}" alt="Before">
                    <span class="img-label">${t.beforeLabel}</span>
                </div>
                <div class="preview-half">
                    <img src="${item.after}" alt="After">
                    <span class="img-label">${t.afterLabel}</span>
                </div>
            </div>
            <h4>${item.title}</h4>
        `;
```

- [ ] **Step 4: De-inline the about card**

In `js/pages/about.js`:

```javascript
        <div class="portfolio-card">
            <p>
                ${t.p1}
            </p>
            <p>
                ${t.p2}
            </p>
        </div>
```

- [ ] **Step 5: De-inline the form status element**

In `js/pages/contacts.js`:

```javascript
                <div id="form-status"></div>
```

- [ ] **Step 6: Verify only the three runtime-mutated styles remain**

```bash
grep -n 'style="' js/components/header.js js/pages/portfolio.js js/pages/about.js js/pages/contacts.js
```

Expected: exactly three hits, all in `portfolio.js` — `style="display: none;"` on `#portfolio-modal`, `style="width: 50%;"` on `.before-img`, `style="left: 50%;"` on `.slider-handle`. These are Global Constraint 4 and must survive.

```bash
grep -n '\.style\.' js/pages/portfolio.js
```

Expected: only assignments inside event handlers and `updateSlider` — no `baCard.style.cursor`.

Reload `http://localhost:8000/#/portfolio`. Expected: the page is visibly *less* styled than before (the before/after grid has lost its inline grid rules). That is correct at this point — Task 7 restores it from CSS.

---

## Task 3: Token foundation, reset, and layout layer

**Files:**
- Rewrite: `css/components.css` (this task replaces the file's entire contents)
- Delete: `css/style.css`

**Interfaces:**
- Consumes: fonts loaded in Task 1
- Produces: every custom property consumed by Tasks 4–8. Names are final; later tasks reference them verbatim.

- [ ] **Step 1: Delete the dead stylesheet**

```bash
grep -rn "style.css" index.html js/
```

Expected: **no matches** — nothing references it. Then:

```bash
rm css/style.css
```

- [ ] **Step 2: Replace `css/components.css` with the foundation layer**

This step **overwrites the whole file**. Everything previously in it is superseded; Tasks 4–8 append the rest.

```css
/* ==========================================================================
   BusinessServices — Design System
   Warm premium service brand: teal-ink structure, brass action color.
   Layers: tokens · reset · layout · header/footer · buttons · hero ·
           cards · portfolio/prices/about · contacts · a11y · responsive
   ========================================================================== */

/* ==========================================================================
   1. TOKENS
   ========================================================================== */
:root {
    /* --- Color: structure --- */
    --ink:              #0F2A2E;
    --ink-2:            #0A1F22;
    --canvas:           #F7F5F1;
    --canvas-2:         #EFEBE4;
    --surface:          #FFFFFF;
    --border:           #E6E0D6;
    --border-strong:    #D6CDBE;

    /* --- Color: text --- */
    --text:             #1A2E2C;
    --text-2:           #5C6B68;
    --text-3:           #8A938F;
    --text-on-ink:      #EDE7DD;
    --text-on-ink-2:    #A9B5B2;

    /* --- Color: action --- */
    --accent:           #B26A20;
    --accent-hover:     #8F5318;
    --accent-soft:      #FBF1E3;
    --accent-line:      #E8CFA8;
    --accent-on-ink:    #E0A458;

    /* --- Color: semantic --- */
    --price:            #2F6B4F;
    --badge-repair-bg:      #F6E9D5;
    --badge-repair-fg:      #8A5A16;
    --badge-cleaning-bg:    #DDE9E7;
    --badge-cleaning-fg:    #1F5551;
    --badge-montage-bg:     #DFE9DD;
    --badge-montage-fg:     #2F5A32;

    /* --- Type --- */
    --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
    --font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                 Roboto, Helvetica, Arial, sans-serif;

    --fs-display:   clamp(2.25rem, 1.6rem + 2.6vw, 3.4rem);
    --fs-title:     clamp(1.9rem, 1.5rem + 1.6vw, 2.6rem);
    --fs-section:   clamp(1.5rem, 1.3rem + 0.9vw, 1.95rem);
    --fs-card:      1.2rem;
    --fs-body:      1rem;
    --fs-sm:        0.875rem;
    --fs-micro:     0.72rem;

    /* --- Space (4px base) --- */
    --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px; --s5: 24px;
    --s6: 32px; --s7: 48px; --s8: 64px; --s9: 96px;

    /* --- Radii --- */
    --r-sm: 8px; --r-md: 12px; --r-lg: 18px; --r-pill: 999px;

    /* --- Elevation (warm-tinted, never pure black) --- */
    --sh-1: 0 1px 2px rgba(23, 36, 34, .05);
    --sh-2: 0 2px 4px rgba(23, 36, 34, .04),
            0 10px 20px -8px rgba(23, 36, 34, .10);
    --sh-3: 0 4px 8px rgba(23, 36, 34, .05),
            0 20px 40px -16px rgba(23, 36, 34, .20);

    /* --- Layout --- */
    --header-h: 68px;
    --wrap: 1200px;

    /* --- Motion --- */
    --t-fast: 140ms cubic-bezier(.2, .6, .3, 1);
    --t-base: 240ms cubic-bezier(.2, .6, .3, 1);
}

/* ==========================================================================
   2. RESET & BASE
   ========================================================================== */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
}

body {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    line-height: 1.65;
    color: var(--text);
    background-color: var(--canvas);
    background-image: radial-gradient(120% 60% at 50% -10%,
                                      rgba(15, 42, 46, .07), transparent 60%);
    background-repeat: no-repeat;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
}

img { display: block; max-width: 100%; }

a { color: var(--accent); }
a:hover { color: var(--accent-hover); }

/* ==========================================================================
   3. PAGE LAYOUT
   ========================================================================== */
.page-container {
    max-width: var(--wrap);
    width: 100%;
    margin: 0 auto;
    flex: 1;
    padding: calc(var(--header-h) + var(--s7)) var(--s5) var(--s8);
}

.page-header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto var(--s7);
}

.page-title {
    font-family: var(--font-display);
    font-size: var(--fs-title);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -.01em;
    color: var(--ink);
    margin-bottom: var(--s3);
}

.page-subtitle {
    font-size: 1.05rem;
    color: var(--text-2);
}

.section-title {
    font-family: var(--font-display);
    font-size: var(--fs-section);
    font-weight: 700;
    color: var(--ink);
    text-align: center;
    margin-bottom: var(--s6);
}
```

- [ ] **Step 3: Verify the foundation**

```bash
grep -c "backdrop-filter" css/components.css   # expect 0
grep -c "unsplash" css/components.css          # expect 0
grep -c "!important" css/components.css        # expect 0
ls css/                                        # expect only components.css
```

Reload `http://localhost:8000`. Expected: warm off-white background with a faint teal wash at the top; serif page headings; **no header or card styling yet** — the page is unstyled below the fold. That is correct.

---

## Task 4: Header, navigation, and footer

**Files:**
- Modify: `css/components.css` (append)

**Interfaces:**
- Consumes: all tokens from Task 3; the `.lang-select` class added in Task 2
- Produces: `--header-h` honoured as the real fixed-header height

- [ ] **Step 1: Append the header and footer layer**

Note the mobile strategy: `header nav` is `flex: 0 1 auto` with `margin-left: auto`, so it right-aligns on wide screens and *shrinks into a horizontally scroll-snapped strip* on narrow ones. It stays a single row at every width, which is what lets `.page-container` use one constant top padding instead of the old 110 / 135 / 145px ladder — and it adds no DOM.

```css
/* ==========================================================================
   4. HEADER, NAV & FOOTER
   ========================================================================== */
header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    background: rgba(15, 42, 46, .94);
    -webkit-backdrop-filter: saturate(140%) blur(10px);
    backdrop-filter: saturate(140%) blur(10px);
    border-bottom: 1px solid rgba(224, 164, 88, .14);
}

.header-container {
    max-width: var(--wrap);
    margin: 0 auto;
    min-height: var(--header-h);
    padding: 0 var(--s5);
    display: flex;
    align-items: center;
    gap: var(--s4);
}

.logo {
    flex: none;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -.01em;
    color: #FFFFFF;
    text-decoration: none;
    white-space: nowrap;
}

.logo:hover { color: #FFFFFF; }
.logo span { color: var(--accent-on-ink); }

header nav {
    flex: 0 1 auto;
    min-width: 0;
    margin-left: auto;
    padding: var(--s3) 0;
    display: flex;
    align-items: center;
    gap: var(--s1);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

header nav::-webkit-scrollbar { display: none; }

header nav > * {
    flex: none;
    scroll-snap-align: end;
}

header nav a {
    padding: 9px 13px;
    border-radius: var(--r-sm);
    color: var(--text-on-ink-2);
    font-size: var(--fs-sm);
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--t-fast), background-color var(--t-fast);
}

header nav a:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, .07);
}

header nav a.active {
    color: var(--accent-on-ink);
    background-color: rgba(224, 164, 88, .12);
}

header nav a.btn-nav {
    margin-left: var(--s2);
    background-color: var(--accent);
    color: #FFFFFF;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12);
}

header nav a.btn-nav:hover,
header nav a.btn-nav.active {
    background-color: var(--accent-hover);
    color: #FFFFFF;
}

.lang-select {
    flex: none;
    margin-left: var(--s2);
    padding: 8px 10px;
    background-color: rgba(255, 255, 255, .06);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: var(--r-sm);
    font-family: var(--font-sans);
    font-size: var(--fs-sm);
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: border-color var(--t-fast), background-color var(--t-fast);
}

.lang-select:hover {
    border-color: var(--accent-on-ink);
    background-color: rgba(255, 255, 255, .10);
}

.lang-select option {
    background-color: var(--ink);
    color: #FFFFFF;
}

footer {
    margin-top: auto;
    padding: var(--s6) var(--s5);
    background-color: var(--ink);
    color: var(--text-on-ink-2);
    border-top: 1px solid rgba(224, 164, 88, .14);
    text-align: center;
    font-size: var(--fs-sm);
}

.footer-content {
    max-width: var(--wrap);
    margin: 0 auto;
}
```

- [ ] **Step 2: Verify header behaviour at three widths**

Reload and check at 1440px, 768px, and 375px.

Expected at all three: the header is **one row**. The logo stays pinned left with "Services" in brass. The nav sits right and, at 375px, scrolls horizontally rather than wrapping. No page content hides beneath the header.

In the console at 375px:

```javascript
document.querySelector('header').getBoundingClientRect().height
```

Expected: `68` (± 1). Previously this grew past 130 as the nav wrapped.

---

## Task 5: Buttons and hero

**Files:**
- Modify: `css/components.css` (append)

**Interfaces:**
- Consumes: tokens from Task 3
- Produces: `.btn-primary` / `.btn-secondary` / `.btn-card`, reused by Tasks 6–8

- [ ] **Step 1: Append the button and hero layer**

```css
/* ==========================================================================
   5. BUTTONS
   ========================================================================== */
.btn-primary,
.btn-secondary,
.btn-card {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-sans);
    font-size: var(--fs-sm);
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    border-radius: var(--r-sm);
    transition: background-color var(--t-fast), color var(--t-fast),
                border-color var(--t-fast), transform var(--t-fast),
                box-shadow var(--t-fast);
}

.btn-primary {
    min-height: 44px;
    padding: 0 var(--s5);
    background-color: var(--accent);
    color: #FFFFFF;
    border: 1px solid var(--accent);
    box-shadow: var(--sh-1);
}

.btn-primary:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #FFFFFF;
    transform: translateY(-1px);
    box-shadow: var(--sh-2);
}

.btn-primary:active { transform: none; }

.btn-secondary {
    min-height: 44px;
    padding: 0 var(--s5);
    background-color: transparent;
    color: var(--ink);
    border: 1px solid var(--border-strong);
}

.btn-secondary:hover {
    background-color: rgba(15, 42, 46, .04);
    border-color: var(--ink);
    color: var(--ink);
}

.btn-card {
    min-height: 38px;
    padding: 0 var(--s4);
    background-color: var(--accent);
    color: #FFFFFF;
    border: 1px solid var(--accent);
}

.btn-card:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #FFFFFF;
}

/* ==========================================================================
   6. HERO
   ========================================================================== */
.hero-section {
    text-align: center;
    max-width: 880px;
    margin: 0 auto var(--s8);
}

.hero-badge {
    display: inline-block;
    margin-bottom: var(--s5);
    padding: 7px var(--s4);
    background-color: var(--accent-soft);
    color: var(--accent-hover);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-pill);
    font-size: var(--fs-sm);
    font-weight: 600;
}

.hero-section h1.page-title {
    font-size: var(--fs-display);
    margin-bottom: var(--s5);
}

.hero-section h1.page-title span { color: var(--accent); }

.hero-section .page-subtitle {
    max-width: 620px;
    margin: 0 auto;
    font-size: 1.08rem;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--s4);
    margin-top: var(--s6);
}

.hero-stats {
    display: flex;
    margin-top: var(--s8);
    overflow: hidden;
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-1);
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--s5) var(--s4);
}

.stat-item + .stat-item { border-left: 1px solid var(--border); }

.stat-num {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--ink);
}

.stat-desc {
    font-size: var(--fs-sm);
    color: var(--text-2);
}
```

- [ ] **Step 2: Verify the hero**

Reload `http://localhost:8000/#/`. Expected: brass pill badge above a large serif headline whose second line (`<span>`) is brass; a solid brass primary button beside an outlined secondary; and the three stats in a single white card divided by two hairline rules — **not** the old floating translucent slab.

---

## Task 6: Feature cards, service cards, tabs, and badges

**Files:**
- Modify: `css/components.css` (append)

**Interfaces:**
- Consumes: tokens (Task 3), `.btn-card` (Task 5)
- Produces: the shared card language reused by Task 7

- [ ] **Step 1: Append the card layer**

`.feature-badge` is defined **once** here. The old file declared it twice and then forced the second with `!important`; do not reintroduce either the duplicate or the `.feature-badge.badge-repair` / `.feature-badge.badge-montage` overrides, which no markup uses.

```css
/* ==========================================================================
   7. FEATURE CARDS
   ========================================================================== */
.features-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--s5);
    max-width: 1000px;
    margin: 0 auto;
}

.feature-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-1);
    transition: border-color var(--t-base), box-shadow var(--t-base),
                transform var(--t-base);
}

.feature-card:hover {
    border-color: var(--accent);
    box-shadow: var(--sh-3);
    transform: translateY(-4px);
}

.feature-img-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
    background-color: var(--canvas-2);
}

.feature-img-wrapper::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 45%;
    background: linear-gradient(to top, rgba(10, 31, 34, .35), transparent);
    pointer-events: none;
}

.feature-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 600ms cubic-bezier(.2, .6, .3, 1);
}

.feature-card:hover .feature-img { transform: scale(1.05); }

.feature-badge {
    position: absolute;
    top: var(--s3);
    left: var(--s3);
    z-index: 2;
    padding: 6px 12px;
    background-color: rgba(10, 31, 34, .88);
    color: #FFFFFF;
    border-radius: var(--r-pill);
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
}

.feature-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: var(--s5);
}

.feature-body h3 {
    margin-bottom: var(--s2);
    font-size: var(--fs-card);
    font-weight: 700;
    color: var(--ink);
}

.feature-body p {
    flex: 1;
    margin-bottom: var(--s5);
    font-size: .95rem;
    color: var(--text-2);
}

.feature-link {
    align-self: flex-start;
    color: var(--accent);
    font-size: .95rem;
    font-weight: 600;
    text-decoration: none;
    transition: color var(--t-fast), transform var(--t-fast);
}

.feature-card:hover .feature-link {
    color: var(--accent-hover);
    transform: translateX(3px);
}

/* ==========================================================================
   8. SERVICE TABS & CARDS
   ========================================================================== */
.service-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--s2);
    margin-bottom: var(--s7);
}

.tab-btn {
    min-height: 40px;
    padding: 0 var(--s4);
    background-color: var(--surface);
    color: var(--text-2);
    border: 1px solid var(--border);
    border-radius: var(--r-pill);
    font-family: var(--font-sans);
    font-size: var(--fs-sm);
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: background-color var(--t-fast), color var(--t-fast),
                border-color var(--t-fast);
}

.tab-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.tab-btn.active {
    background-color: var(--ink);
    border-color: var(--ink);
    color: #FFFFFF;
}

#services-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: var(--s5);
}

.service-card {
    display: flex;
    flex-direction: column;
    padding: var(--s5);
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-1);
    transition: border-color var(--t-base), box-shadow var(--t-base),
                transform var(--t-base);
}

.service-card:hover {
    border-color: var(--accent);
    box-shadow: var(--sh-3);
    transform: translateY(-4px);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s3);
    margin-bottom: var(--s4);
}

.service-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: var(--accent-soft);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-md);
    font-size: 1.25rem;
    line-height: 1;
}

.badge {
    padding: 5px 11px;
    border-radius: var(--r-pill);
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    white-space: nowrap;
}

.badge-repair   { background-color: var(--badge-repair-bg);   color: var(--badge-repair-fg); }
.badge-cleaning { background-color: var(--badge-cleaning-bg); color: var(--badge-cleaning-fg); }
.badge-montage  { background-color: var(--badge-montage-bg);  color: var(--badge-montage-fg); }

.service-title {
    margin-bottom: var(--s2);
    font-size: var(--fs-card);
    font-weight: 700;
    color: var(--ink);
}

.service-desc {
    flex: 1;
    margin-bottom: var(--s5);
    font-size: .95rem;
    color: var(--text-2);
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s3);
    margin-top: auto;
    padding-top: var(--s4);
    border-top: 1px solid var(--border);
}

.service-price {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--price);
}
```

- [ ] **Step 2: Verify cards on two pages**

`http://localhost:8000/#/` — expected: a 2×2 grid of white feature cards with hairline borders. On hover the border turns brass, the card lifts 4px, the photo scales slightly, and the link arrow nudges right. The price badge is a dark ink pill readable over every photo.

`http://localhost:8000/#/services` — expected: pill-shaped tabs with the active one filled ink; each service card shows its emoji inside a 44px brass-tinted rounded tile, with a muted category badge opposite it. Click through all five tabs and confirm the cards re-render styled.

---

## Task 7: Portfolio, prices, and about

**Files:**
- Modify: `css/components.css` (append)

**Interfaces:**
- Consumes: tokens (Task 3), `.btn-primary` (Task 5), card language (Task 6), class hooks added in Task 2
- Produces: nothing consumed downstream

- [ ] **Step 1: Append the portfolio layer**

`.portfolio-card` and `.portfolio-grid` are each defined **once** here, replacing the two contradictory declarations in the old file.

```css
/* ==========================================================================
   9. PORTFOLIO
   ========================================================================== */
.portfolio-grid,
.prices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: var(--s5);
}

.portfolio-card {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-1);
    transition: border-color var(--t-base), box-shadow var(--t-base),
                transform var(--t-base);
}

.portfolio-grid > .portfolio-card { padding: var(--s6); }

.portfolio-card:hover {
    border-color: var(--accent);
    box-shadow: var(--sh-3);
    transform: translateY(-4px);
}

.portfolio-card h3 {
    margin-bottom: var(--s2);
    font-size: var(--fs-card);
    font-weight: 700;
    color: var(--ink);
}

.portfolio-card p {
    font-size: .95rem;
    color: var(--text-2);
}

.portfolio-tag {
    align-self: flex-start;
    margin-bottom: var(--s3);
    padding: 5px 11px;
    background-color: var(--accent-soft);
    color: var(--accent-hover);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-pill);
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
}

.portfolio-meta {
    margin-top: auto;
    padding-top: var(--s4);
    font-size: var(--fs-sm);
    color: var(--text-3);
}

/* --- Before / After --- */
.portfolio-before-after-section { margin-top: var(--s9); }

.portfolio-ba-title { font-size: var(--fs-section); }

.portfolio-ba-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: var(--s5);
}

.portfolio-ba-card {
    padding: 0;
    cursor: pointer;
}

.card-images-preview {
    position: relative;
    display: flex;
    height: 190px;
}

.preview-half {
    position: relative;
    flex: 1;
    overflow: hidden;
}

.preview-half + .preview-half { border-left: 1px solid rgba(255, 255, 255, .6); }

.preview-half img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.img-label {
    position: absolute;
    left: var(--s2);
    bottom: var(--s2);
    padding: 3px 8px;
    background-color: rgba(10, 31, 34, .78);
    color: #FFFFFF;
    border-radius: var(--r-sm);
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
}

.portfolio-ba-card h4 {
    padding: var(--s4);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    text-align: center;
}

/* --- Comparison modal --- */
.portfolio-modal {
    position: fixed;
    inset: 0;
    z-index: 2000;
    align-items: center;
    justify-content: center;
    padding: var(--s5);
}

.modal-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(10, 31, 34, .72);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
}

.modal-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 760px;
    padding: var(--s6);
    background-color: var(--surface);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-3);
}

.modal-content h3 {
    padding-right: var(--s7);
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ink);
}

.modal-close {
    position: absolute;
    top: var(--s4);
    right: var(--s4);
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--canvas-2);
    color: var(--ink);
    border: 1px solid var(--border);
    border-radius: 50%;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    transition: background-color var(--t-fast), color var(--t-fast),
                border-color var(--t-fast);
}

.modal-close:hover {
    background-color: var(--ink);
    border-color: var(--ink);
    color: #FFFFFF;
}

.comparison-slider {
    position: relative;
    width: 100%;
    height: 420px;
    margin-top: var(--s5);
    overflow: hidden;
    border-radius: var(--r-md);
    user-select: none;
    -webkit-user-select: none;
}

.img-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    overflow: hidden;
}

.img-wrapper img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
}

.after-img { width: 100%; }

.before-img { border-right: 2px solid var(--accent-on-ink); }

.slider-range {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    z-index: 10;
    background: transparent;
    cursor: ew-resize;
    -webkit-appearance: none;
    appearance: none;
}

.slider-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
}

.slider-range::-moz-range-thumb {
    width: 0;
    height: 0;
    border: 0;
    background: transparent;
}

.slider-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    z-index: 5;
    background-color: var(--accent-on-ink);
    pointer-events: none;
}

.slider-handle::after {
    content: '↔';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--accent);
    color: #FFFFFF;
    border-radius: 50%;
    font-size: 1rem;
    box-shadow: var(--sh-2);
}
```

- [ ] **Step 2: Append the prices and about layer**

```css
/* ==========================================================================
   10. PRICES
   ========================================================================== */
.price-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: var(--s6);
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-1);
}

.price-card h3 {
    font-size: var(--fs-card);
    font-weight: 700;
    color: var(--ink);
}

.price-val {
    margin: var(--s3) 0 var(--s4);
    font-family: var(--font-display);
    font-size: 2.1rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--accent);
}

.price-card ul {
    flex: 1;
    margin-bottom: var(--s5);
    list-style: none;
}

.price-card ul li {
    position: relative;
    margin-bottom: var(--s3);
    padding-left: var(--s5);
    font-size: .95rem;
    line-height: 1.6;
    color: var(--text-2);
}

.price-card ul li::before {
    content: '';
    position: absolute;
    left: 0;
    top: .62em;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background-color: var(--accent-line);
}

.price-card .btn-primary { width: 100%; }

/* Featured tier inverts to ink so "popular" reads at a glance. */
.price-card.featured {
    background-color: var(--ink);
    border-color: var(--ink);
    box-shadow: var(--sh-3);
}

.price-card.featured h3 { color: #FFFFFF; }
.price-card.featured .price-val { color: var(--accent-on-ink); }
.price-card.featured ul li { color: var(--text-on-ink-2); }
.price-card.featured ul li::before { background-color: var(--accent-on-ink); }

.popular-badge {
    position: absolute;
    top: -11px;
    right: var(--s5);
    padding: 4px 12px;
    background-color: var(--accent);
    color: #FFFFFF;
    border-radius: var(--r-pill);
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
}

/* ==========================================================================
   11. ABOUT
   ========================================================================== */
.page-about .portfolio-card {
    max-width: 68ch;
    margin: 0 auto;
    padding: var(--s7);
    border-left: 3px solid var(--accent);
}

.page-about .portfolio-card:hover {
    transform: none;
    border-color: var(--border);
    border-left-color: var(--accent);
    box-shadow: var(--sh-1);
}

.page-about .portfolio-card p {
    font-size: 1.06rem;
    line-height: 1.85;
    color: var(--text-2);
}

.page-about .portfolio-card p + p { margin-top: var(--s4); }
```

- [ ] **Step 3: Verify all three pages**

`#/portfolio` — expected: three case cards on top, then the before/after grid (restored from CSS after Task 2 stripped its inline rules), each with two side-by-side images carrying dark uppercase labels. Click a card: the modal opens over a blurred dim backdrop, with a circular close button and a brass circular drag handle on the divider. **Drag the handle and confirm the reveal still works** — Global Constraint 4 exists precisely to protect this.

`#/prices` — expected: four cards; the second (`featured`) is a dark ink panel with brass price and a brass "popular" pill, clearly dominant.

`#/about` — expected: a single centred prose card, measure capped around 68 characters, with a brass rule down its left edge and no hover lift.

---

## Task 8: Contacts, focus states, motion, and responsive

**Files:**
- Modify: `css/components.css` (append — this completes the file)

**Interfaces:**
- Consumes: tokens (Task 3), `.btn-primary` (Task 5)
- Produces: the finished stylesheet

- [ ] **Step 1: Append the contacts layer**

```css
/* ==========================================================================
   12. CONTACTS
   ========================================================================== */
.contacts-wrapper {
    display: grid;
    grid-template-columns: 1.15fr .85fr;
    gap: var(--s6);
    align-items: start;
}

.order-form {
    padding: var(--s6);
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-2);
}

.order-form h3 {
    margin-bottom: var(--s5);
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--ink);
}

.form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s4);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: var(--s4);
}

.form-group label {
    font-size: var(--fs-micro);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--text-3);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    min-height: 44px;
    padding: 11px var(--s3);
    background-color: var(--canvas);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    outline: none;
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    line-height: 1.5;
    transition: background-color var(--t-fast), border-color var(--t-fast),
                box-shadow var(--t-fast);
}

.form-group textarea {
    min-height: 96px;
    resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--text-3); }

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    background-color: var(--surface);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(178, 106, 32, .16);
}

.order-form .btn-primary {
    width: 100%;
    margin-top: var(--s2);
}

#form-status {
    margin-top: var(--s4);
    font-size: var(--fs-sm);
    font-weight: 600;
    text-align: center;
    color: var(--text-2);
}

.contacts-info {
    padding: var(--s6);
    background-color: var(--ink);
    color: var(--text-on-ink-2);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-2);
}

.contacts-info h3 {
    margin-bottom: var(--s5);
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    color: #FFFFFF;
}

.contacts-info p {
    padding: var(--s3) 0;
    font-size: .98rem;
}

.contacts-info p + p { border-top: 1px solid rgba(255, 255, 255, .09); }

.contacts-info strong {
    color: var(--text-on-ink);
    font-weight: 600;
}
```

- [ ] **Step 2: Append focus, motion, and responsive layers**

The old stylesheet had **zero** focus rules. This is the fix.

```css
/* ==========================================================================
   13. FOCUS VISIBILITY
   ========================================================================== */
:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: var(--r-sm);
}

header :focus-visible,
.contacts-info :focus-visible,
.price-card.featured :focus-visible {
    outline-color: var(--accent-on-ink);
}

.form-group input:focus-visible,
.form-group select:focus-visible,
.form-group textarea:focus-visible { outline: none; }

/* ==========================================================================
   14. RESPONSIVE
   ========================================================================== */
@media (max-width: 900px) {
    .features-grid { grid-template-columns: 1fr; }
    .contacts-wrapper { grid-template-columns: 1fr; }
    .comparison-slider { height: 340px; }
}

@media (max-width: 640px) {
    .header-container {
        padding: 0 var(--s4);
        gap: var(--s3);
    }

    .page-container {
        padding-left: var(--s4);
        padding-right: var(--s4);
        padding-bottom: var(--s7);
    }

    .hero-stats { flex-direction: column; }

    .stat-item + .stat-item {
        border-left: 0;
        border-top: 1px solid var(--border);
    }

    .form-grid-2 { grid-template-columns: 1fr; }

    .order-form,
    .contacts-info,
    .price-card,
    .modal-content,
    .portfolio-grid > .portfolio-card,
    .page-about .portfolio-card { padding: var(--s5); }

    .comparison-slider { height: 280px; }

    .portfolio-before-after-section { margin-top: var(--s8); }
}

/* ==========================================================================
   15. REDUCED MOTION
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }

    *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
    }

    .feature-card:hover,
    .service-card:hover,
    .portfolio-card:hover,
    .btn-primary:hover { transform: none; }

    .feature-card:hover .feature-img,
    .feature-card:hover .feature-link { transform: none; }
}
```

- [ ] **Step 3: Verify contacts, focus, and motion**

`#/contacts` — expected: white form panel beside a dark ink info panel whose rows are separated by hairlines. Click into any input: a brass border **plus a 3px brass halo**. Fill and submit the form; confirm `#form-status` renders its message centred (the JS path is unchanged).

Keyboard: press `Tab` repeatedly from the top of the page. Expected: a visible brass focus ring on every link, button, tab, input, and the language select. Previously nothing was visible at all.

Motion: enable OS "reduce motion", reload, and hover a feature card. Expected: colour still changes, but no lift and no image zoom.

Responsive: at 375px confirm the stats stack vertically with horizontal dividers and the form collapses to one column.

---

## Task 9: Full verification pass

**Files:**
- Create: `scripts/verify-redesign.sh`

**Interfaces:**
- Consumes: all prior tasks
- Produces: a repeatable check

- [ ] **Step 1: Write the verification script**

```bash
mkdir -p scripts
```

Create `scripts/verify-redesign.sh`:

```bash
#!/usr/bin/env bash
# Verifies the redesign held its constraints. Run from the project root.
set -u
fail=0
note() { printf '%-52s %s\n' "$1" "$2"; }

# --- 1. Every class used in JS must have a rule in the stylesheet ---
missing=""
for c in $(grep -ohE 'class="[^"$]*"' js/pages/*.js js/components/*.js \
           | sed 's/class="//; s/"//' | tr ' ' '\n' | sort -u | grep -v '^$'); do
    grep -q "\.$c\b" css/components.css || missing="$missing $c"
done
if [ -n "$missing" ]; then
    note "class coverage" "FAIL — unstyled:$missing"; fail=1
else
    note "class coverage" "PASS"
fi

# --- 2. Only the three runtime-mutated inline styles survive ---
n=$(grep -c 'style="' js/components/*.js js/pages/*.js | awk -F: '{s+=$2} END{print s}')
if [ "$n" -eq 3 ]; then note "inline styles (expect 3)" "PASS"
else note "inline styles (expect 3)" "FAIL — found $n"; fail=1; fi

# --- 3. Nav hrefs are route-shaped ---
if grep -qE 'href="#(services|portfolio|prices|about|contacts)"' js/components/header.js; then
    note "nav hrefs" "FAIL — slash-less href remains"; fail=1
else
    note "nav hrefs" "PASS"
fi

# --- 4. index.html has no duplicate layout placeholders ---
if grep -qE 'id="(header-container|main-content|footer-container)"' index.html; then
    note "no duplicate layout elements" "FAIL"; fail=1
else
    note "no duplicate layout elements" "PASS"
fi

# --- 5. Stylesheet hygiene ---
for pat in '!important' 'unsplash' 'style.css'; do
    if grep -qi "$pat" css/components.css; then
        note "css free of '$pat'" "FAIL"; fail=1
    else
        note "css free of '$pat'" "PASS"
    fi
done

# --- 6. No duplicated selector blocks ---
dupes=$(grep -oE '^\.[a-zA-Z0-9_-]+ *\{' css/components.css \
        | sort | uniq -d | tr -d '{ ')
if [ -n "$dupes" ]; then note "no duplicate selectors" "FAIL — $dupes"; fail=1
else note "no duplicate selectors" "PASS"; fi

# --- 7. Dead stylesheet gone ---
[ -f css/style.css ] && { note "css/style.css removed" "FAIL"; fail=1; } \
                     || note "css/style.css removed" "PASS"

exit $fail
```

- [ ] **Step 2: Run it**

```bash
bash scripts/verify-redesign.sh
```

Expected: every line `PASS`, exit code 0. Fix anything that fails before continuing.

- [ ] **Step 3: Prove no copy changed**

This is the single most important check — Global Constraint 1.

```bash
grep -hoE "^\s+[a-zA-Z0-9]+: *'.*'," js/pages/*.js js/components/*.js \
  | sed 's/^\s*//' | sort > /tmp/strings-after.txt
wc -l /tmp/strings-after.txt
```

Compare against the same extraction from a pre-change copy of the tree (or `frontend/` for the modules it still mirrors). Expected: **zero differences** in every locale block. Any diff at all is a task failure — revert and redo the offending edit.

- [ ] **Step 4: Walk every route at every breakpoint**

With `python -m http.server 8000` running, visit each of `#/`, `#/services`, `#/portfolio`, `#/prices`, `#/about`, `#/contacts` at 1440px, 768px, and 375px — 18 views.

For each, confirm:
1. No horizontal page scrollbar (`document.body.scrollWidth <= window.innerWidth`)
2. No content hidden behind the fixed header
3. The correct nav link carries `.active`
4. Zero console errors

Then switch the language selector through all seven locales on the home page and confirm no layout breaks — German and Dutch produce the longest nav strings and are the stress case for the scroll strip.

---

## Self-Review

**Spec coverage**

| Spec section | Task |
|---|---|
| §4.1 Color tokens | Task 3 Step 2 |
| §4.2 Typography | Task 1 Step 3 (loading), Task 3 Step 2 (tokens) |
| §4.3 Spacing / radii / elevation | Task 3 Step 2 |
| §5 Removals (bg, blur, dupes, style.css) | Task 3 Steps 1–3; verified Task 9 |
| §6 Header + mobile strip | Task 4 |
| §6 Hero | Task 5 |
| §6 Cards / service cards | Task 6 |
| §6 Prices / About / Portfolio modal | Task 7 |
| §6 Contacts | Task 8 Step 1 |
| §7.1 Nav bug | Task 1 Step 2 |
| §7.2 Duplicate elements bug | Task 1 Step 3 |
| §8 De-inlining | Task 2 |
| §9 Accessibility | Task 8 Step 2 |
| §10 Verification | Task 9 |

No gaps.

**Placeholder scan:** No TBD/TODO. Every code step carries complete, literal code. No "similar to Task N" references.

**Type consistency:** Token names cross-checked between Task 3's `:root` and every consumer in Tasks 4–8 — `--ink`, `--ink-2`, `--canvas`, `--canvas-2`, `--surface`, `--border`, `--border-strong`, `--text`, `--text-2`, `--text-3`, `--text-on-ink`, `--text-on-ink-2`, `--accent`, `--accent-hover`, `--accent-soft`, `--accent-line`, `--accent-on-ink`, `--price`, the six `--badge-*`, both `--font-*`, seven `--fs-*`, nine `--s*`, four `--r-*`, three `--sh-*`, `--header-h`, `--wrap`, `--t-fast`, `--t-base`. All defined before use. Class hooks introduced in Task 2 (`.lang-select`, `.portfolio-ba-title`, `.portfolio-ba-grid`, `.portfolio-ba-card`, `.card-images-preview`, `.preview-half`, `.img-label`) each receive a rule in Task 4 or Task 7.

One note carried forward: `--ink-2` and `--canvas-2` are defined in Task 3 but `--ink-2` is only used via the literal `rgba(10, 31, 34, …)` forms in Tasks 6–7. That is intentional — `rgba()` cannot consume a hex custom property without a separate channel token, and introducing one would add more complexity than it removes at this size.
