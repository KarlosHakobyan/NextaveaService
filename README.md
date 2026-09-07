# Nextavéa Service

> ## ⚠️ Frontend and backend are separate projects
>
> **This repository is the frontend only.** It is static HTML, CSS and ES
> modules. There is no build step, no server code and no database.
>
> **The backend is a separate ASP.NET Core project** and does not live here.
> It is not written yet. The frontend talks to it over HTTP and nothing else:
> no shared code, no shared build, no shared deployment.
>
> The only thing that joins them is the HTTP contract in
> [`docs/admin-api.md`](docs/admin-api.md). Build against that document on the
> backend side and the two stay independent. Either can be replaced without
> touching the other.
>
> Keep it that way. Do not add server code to this repository, and do not
> serve these files from the API project.

---

## What is here

```
site/
  index.html          public site (7 locales, hash router)
  css/components.css  public design system
  js/                 public site modules
  js/validation/      order form rules, pure and DOM-free
  js/verification/    the 6-digit code flow and its copy
  js/data/            generated country table (dial codes, names, flags)
  admin/              operations console, a separate app not linked from the public site
  assets/             fonts, images, self-hosted Leaflet
  scripts/serve.js    local static server
  scripts/build-countries.js  regenerates the country table and flag assets
  tests/              node --test suites for the DOM-free modules
docs/
  admin-api.md        the HTTP contract the backend must implement
```

## Running it locally

The site is built from ES modules, so it cannot be opened straight from the
filesystem: `file://` blocks module imports. It has to be served over HTTP.

There is no Python on the development machine, so use the bundled Node server:

```bash
cd site
node scripts/serve.js          # http://localhost:8000
node scripts/serve.js 8080     # if 8000 is taken
```

- Public site: <http://localhost:8000/>
- Operations console: <http://localhost:8000/admin/>

Type the `http://` scheme explicitly. Browsers with "Always use secure
connections" turned on will otherwise try `https://localhost:8000`, where
nothing is listening, and report that the site cannot be reached.

## Tests

The modules with no DOM or network in them — the order validator, the
verification controller, the locale tables — are covered by Node's built-in
runner. No dependencies, nothing to install:

```bash
node --test site/tests/orderValidator.test.js              site/tests/codeService.test.js              site/tests/strings.test.js              site/tests/phoneNumber.test.js              site/tests/countries.test.js              site/tests/countrySearch.test.js
```

Pass the files rather than the directory: `node --test site/tests/` tries to
load the folder as a module and fails.

Anything that touches the DOM is checked in a real browser instead.

## Ordering and verification

Every visible field on the order form is required, and the form validates before
it touches the network: `site/js/validation/orderValidator.js` holds the rules
and returns error codes, which the contacts page renders in the visitor's
language.

The map pin is the deliberate exception. A typed address is enough to find the
job, and requiring the pin would shut out everyone who denies geolocation and
never scrolls to the map. A pin that *is* dropped still has to be a real
coordinate, so `lat`/`lng` reach the backend either valid or absent, never
malformed.

An order is then only accepted once the customer proves the email address and
phone number are theirs. `POST /requests/verify/start` has the backend send the
same six digits to both; the customer types them into a dialog; and
`POST /requests/verify/confirm` trades them for a single-use token that
`POST /requests` requires. The browser never decides whether a code is correct —
it cannot, since anything it knows is in view-source.

**Those endpoints do not exist yet.** Until they answer, the flow falls back to
a demo mode that prints the code on screen behind an obvious banner saying no
email or SMS was sent, the same convention the console uses for its seeded data.
Building the endpoints turns real verification on with no frontend change.

`POST /requests/verify/start` spends real money per call and takes no key, so
rate-limit it per phone, per email and per IP before deploying. `docs/admin-api.md`
says so in more detail.

## The phone field

The phone box is a country picker plus a number box. It is a custom combobox
rather than a `<select>` for one reason: no browser renders an image inside an
`<option>`, so showing flags means building the widget by hand — including the
arrow keys, type-to-filter, Escape and `aria-activedescendant` that a native
select would have given for free.

Flag emoji were not an option. Windows has never shipped flag glyphs, so 🇦🇲
renders there as the boxed letters "AM". The flags are therefore real SVGs,
self-hosted in `assets/vendor/flags/` exactly as Leaflet is, and lazy-loaded:
the set is 1.57 MB on disk but the median flag is under a kilobyte and a
visitor only fetches the rows they actually scroll past.

The two visible controls write into one hidden `phone` input, so the validator,
the request payload and the console's `tel:` link all still see a single
ordinary string like `+374 44123456`.

`js/data/countries.js` is generated, never hand-edited. Regenerate it with:

```bash
node scripts/build-countries.js          # reuses cached flags
node scripts/build-countries.js --force  # re-downloads every flag
```

Dial codes and localized country names come from
[mledoze/countries](https://github.com/mledoze/countries) (ODbL) and the flags
from [lipis/flag-icons](https://github.com/lipis/flag-icons) (MIT). Both are
fetched at build time only; the site itself never calls out. Codes are not
typed from memory on purpose — a wrong one is a customer nobody can call back,
and `tests/countries.test.js` re-checks a known-good sample plus the presence
of every flag file on disk.

## The two frontends

**Public site** (`site/`) is what customers see. Seven locales, service catalog,
portfolio, and an order form that POSTs to `/requests` on the API.

**Operations console** (`site/admin/`) is what you see. Requests inbox, service
and price catalog, portfolio manager. Not linked from the public site and never
loaded by visitors.

The console signs in with an API secret key on its own page
(`admin/login.html`); `admin/index.html` is the console alone and redirects to
the login page when there is no key.

It speaks English, French and Russian, chosen from the rail below Settings or
from the sign-in page. Every string lives in `site/admin/js/i18n.js`; the three
tables are kept at identical key coverage, so a missing translation shows up as
the key itself rather than as silent English. The console's language is stored
separately from the public site's, so changing one never affects the other.

Both apps share a light and dark theme, toggled from the public header or the
console rail and remembered per browser. Preferences live in
`site/shared/prefs.js` under namespaced `nx.` keys.

Until the backend exists the console falls back to seeded demo data, and says
so on every screen. Nothing in it will ever show demo content while implying it
is live.

## Backend, when you build it

Implement [`docs/admin-api.md`](docs/admin-api.md) in the separate ASP.NET Core
project. In practice:

0. `POST /requests/verify/start` and `/confirm`, plus the `verificationToken`
   check on `POST /requests` — until these exist the public order form runs in
   demo mode and anyone can place an order without proving a contact detail.
1. `GET /admin/session` first, since that is all the console needs to sign in.
2. `GET /admin/stats` and `GET /admin/requests`, the two screens used daily.
3. Request detail and mutations, then services, then portfolio.

Point the console at it in Settings, or change `DEFAULT_BASE_URL` in
`site/admin/js/auth.js`. Serve it over HTTPS, rate limit failed key attempts,
and allow the `X-Admin-Key` header in CORS.
