# Admin API contract

> ## ⚠️ Frontend and backend are separate projects
>
> This repository is the **frontend only**: static HTML, CSS and ES modules.
> The **backend is a separate ASP.NET Core project** that does not live here
> and is not written yet.
>
> This document is the entire boundary between them. It is an HTTP contract:
> no shared code, no shared build, no shared deployment. Implement it on the
> backend side and either half can be replaced without touching the other.
>
> Do not add server code to the frontend repository, and do not serve the
> frontend's files from the API project.

---

What `site/admin/` calls. Build these on the ASP.NET Core side and the console
switches from demo data to live with no front-end changes.

Base URL is whatever the console's Settings page holds; it defaults to
`https://localhost:7001/api`, the same base the public site uses.

---

## Authentication

Every request carries the shared secret in a header:

```
X-Admin-Key: <secret>
```

- **200**: key accepted.
- **401** or **403**: key rejected. The console clears the stored key and
  returns to the login screen. Return either; it treats them the same.

There are no cookies and no session. The key is the whole auth story.

**What to enforce on your side**

- HTTPS only. The key is a plaintext header; over HTTP it is readable in transit.
- Rate limit failed attempts by IP. A shared secret with no lockout is
  brute-forceable.
- Compare in constant time (`CryptographicOperations.FixedTimeEquals`), not `==`.
- Keep the key in configuration or a secret store, never in source.
- CORS: allow the origin the admin is served from, and allow the `X-Admin-Key`
  header. Without that the browser blocks every call before it leaves.

This model identifies the console, not a person: there is no audit trail of who
did what. That is a deliberate trade for a one-operator tool. If a second person
ever needs access, replace this with per-user auth rather than sharing the key.

---

## Errors

Non-2xx responses should carry a JSON body:

```json
{ "message": "Request 142 not found" }
```

The console shows `message` verbatim to the operator, so write it for them, not
for a log file. Without a body it falls back to `Request failed (<status>)`.

---

## Endpoints

### `GET /admin/session`

Verifies the key. Called on sign-in and on every page load with a stored key.

```json
{ "ok": true, "name": "Karlos" }
```

`name` is optional and currently unused; return it if you want it shown later.

---

### `GET /admin/stats`

Powers the Today page, and `byStatus.new` powers the badge on the rail.

```json
{
  "newToday": 3,
  "newThisWeek": 8,
  "openCount": 7,
  "scheduledToday": 2,
  "quotedTotal": 1130,
  "byStatus":   { "new": 3, "contacted": 2, "scheduled": 2, "done": 4, "cancelled": 1 },
  "byCategory": { "cleaning": 6, "furniture": 3, "restoration": 2, "relocation": 1 },
  "total": 12
}
```

| Field | Meaning |
|---|---|
| `newToday` | requests created today |
| `newThisWeek` | requests created in the last 7 days |
| `openCount` | status is `new`, `contacted` or `scheduled`, shown on the Today tally as "Open now" |
| `byStatus.new` | drives the rail badge, so it must fall to zero once every request has been moved off `new` |
| `scheduledToday` | status `scheduled` **and** `preferredDate` is today |
| `quotedTotal` | sum of `quotedPrice` over `scheduled` + `done` |

---

### `GET /admin/requests`

| Query | Values | Notes |
|---|---|---|
| `status` | `new` `contacted` `scheduled` `done` `cancelled` | omitted = any |
| `category` | `cleaning` `furniture` `restoration` `relocation` | omitted = any |
| `q` | free text | match against name, phone, address, message, id |
| `from` / `to` | `YYYY-MM-DD` | inclusive, on `createdAt` |
| `page` | integer, 1-based | default 1 |
| `pageSize` | integer | default 50 |

The console omits a parameter entirely rather than sending `all` or an empty
string, so treat a missing parameter as "no filter".

```json
{
  "items": [ /* Request objects, newest createdAt first */ ],
  "total": 12,
  "page": 1,
  "pageSize": 50
}
```

`total` is the count **after** filtering, before paging. It is what the
"12 requests" line displays.

---

### The Request object

```json
{
  "id": 142,
  "name": "Anahit Grigoryan",
  "email": "anahit@example.com",
  "phone": "+374 91 445 210",
  "serviceType": "cleaning",
  "address": "Nalbandyan St 24, apt 12, Yerevan",
  "lat": 40.1789,
  "lng": 44.5133,
  "preferredDate": "2026-08-29",
  "preferredTime": "morning",
  "message": "Three rooms plus kitchen, about 85 m².",
  "status": "new",
  "quotedPrice": null,
  "createdAt": "2026-08-28T15:07:00Z",
  "notes": [
    { "id": 1, "text": "Called, confirmed 13:00.", "author": "Operator",
      "createdAt": "2026-08-28T16:20:00Z" }
  ]
}
```

Everything from `name` through `message` comes straight from the public order
form (`site/js/pages/contacts.js` POSTs it to `/requests`). The admin adds
`status`, `quotedPrice`, `createdAt` and `notes`.

| Field | Type | Notes |
|---|---|---|
| `id` | int | shown as `#0142` |
| `serviceType` | string | one of the four category ids |
| `email` | string | required by the form, and the address the verification code is sent to |
| `phone` | string | always international, as `+<dial> <digits>` (e.g. `+374 44123456`). The form picks the country from a list of 248, so do not assume an Armenian number |
| `lat` / `lng` | number or null | null when the client typed an address without dropping a pin, which the form allows; the drawer says so instead of showing an empty map |
| `preferredDate` | `YYYY-MM-DD` | required by the form, and never in the past |
| `preferredTime` | `morning` \| `day` \| `evening` | 08–12, 12–16, 16–20 |
| `verificationToken` | string | proof the customer owns the email and phone; see Order verification below |
| `status` | string | defaults to `new` on intake |
| `quotedPrice` | number or null | euros, whole numbers |
| `createdAt` | ISO 8601 | drives "2h ago" and every date filter |
| `notes` | array | may be omitted or empty |

**Intake:** the public form posts to `POST /requests` (not under `/admin`, and
without the key, since it is the public endpoint that already exists in
`site/js/api.js`). That handler is what should set `status: "new"` and
`createdAt`.

It must also **reject any request whose `verificationToken` is missing, unknown,
already used or expired**, with **400**. The two endpoints below issue that
token. A token is single-use: burn it as the request is stored.

---

### Order verification

Before an order is accepted the customer proves they own the email address and
the phone number they typed. The frontend collects the six digits and nothing
else — generation, delivery and checking are all server-side, because anything
the browser knows is readable in view-source.

The public site drives this from `site/js/verification/codeService.js`. While
these endpoints are unreachable it falls back to a clearly-labelled demo mode
that prints the code on screen instead of sending it, so the flow can be walked
end to end before the backend exists. Once the endpoints answer, no frontend
change is needed.

#### `POST /requests/verify/start`

```json
{ "email": "ivan@example.com", "phone": "+37444123456", "lang": "ru" }
```

Generate six digits, store them against a new opaque `token`, and send the same
code to **both** the email address and the phone number. `lang` is one of the
site's seven locales (`ru en fr it es de nl`) and selects the language of the
message; fall back to `ru` for anything else.

```json
{ "token": "opaque-session-id", "expiresInSeconds": 600, "resendAfterSeconds": 60 }
```

The response must **never** contain the code.

- **400** `{ "error": "invalid_contact" }` — the address or number is unusable.
- **429** `{ "error": "rate_limited", "retryAfterSeconds": 45 }` — see below.

**Rate limiting is not optional here.** This endpoint spends real money on every
call and is reachable without a key, so an unthrottled deployment is a free
SMS-spam cannon pointed at anyone's phone. Limit per phone, per email and per IP,
cap the number of resends per session, and keep sending a **429** rather than
silently dropping the request.

#### `POST /requests/verify/confirm`

```json
{ "token": "opaque-session-id", "code": "482917" }
```

```json
{ "verificationToken": "single-use-proof" }
```

The frontend puts that `verificationToken` into the `POST /requests` body.
Give it a short life — a few minutes is plenty — and accept it once.

- **400** `{ "error": "invalid_code", "attemptsLeft": 2 }` — wrong digits.
  Include `attemptsLeft` so the dialog can count down; at `0` the session is
  dead and the customer must request a new code.
- **410** `{ "error": "expired" }` — the code or the session timed out.
- **429** `{ "error": "rate_limited", "retryAfterSeconds": 30 }`

Compare codes in constant time, cap attempts server-side (the frontend's own
count is a courtesy, not a control), and destroy the session once it is used or
burnt.

---

### `GET /admin/requests/{id}`

One Request object. **404** with a `message` if it does not exist.

### `PATCH /admin/requests/{id}`

Partial update. The console sends one field at a time:

```json
{ "status": "contacted" }
{ "quotedPrice": 210 }
{ "quotedPrice": null }
```

Returns the full updated Request object. The drawer repaints from the response
rather than assuming the write succeeded as sent.

### `DELETE /admin/requests/{id}`

**204**, no body. Hard delete, including notes. The console warns first and
suggests cancelling instead.

### `POST /admin/requests/{id}/notes`

```json
{ "text": "Bring the second vacuum." }
```

Returns the created note. Set `author` and `createdAt` server-side.

---

### Services

The public site currently reads its 28 services from
`site/js/pages/services.js` and `site/js/pages/prices.js`, hardcoded per locale.
Until it reads them from the API, catalog edits change the admin's view only,
and the console says so on the page.

**Service object**

```json
{
  "id": 1,
  "category": "cleaning",
  "title": "Standard cleaning, flats and houses",
  "price": "30–35 €/hr",
  "description": "Regular upkeep: vacuuming, wet wiping of surfaces.",
  "popular": true,
  "active": true,
  "coverage": 40
}
```

`price` is **free text**, not a number. The real catalog is full of ranges
(`4–10 €/m²`) and `on estimate`; a decimal column would lose all of it. The
console's Calculator parses this string back into a rate, so keep the shapes
recognisable: `30–35 €/hr`, `4–10 €/m²`, `from 150 €`, `80–200 €`.

`coverage` is **square metres per hour**, a number or null. The Calculator uses
it to turn a floor area into billable hours for services priced by the hour:
`area ÷ coverage = hours`, then `hours × rate`. Null means floor area does not
drive that job (furniture assembly, removals), and the Calculator says so
rather than guessing. Store it as a nullable numeric column; never default it
to 0, which would read as "covers nothing per hour".

| | |
|---|---|
| `GET /admin/services` | `{ "items": [ … ] }` |
| `POST /admin/services` | body without `id`; returns the created service |
| `PUT /admin/services/{id}` | full replace; returns the updated service |
| `DELETE /admin/services/{id}` | **204** |

`active: false` means "keep the record, hide it from the site".

---

### Portfolio

**Portfolio object**

```json
{
  "id": 1,
  "url": "/media/portfolio/kitchen.jpg",
  "caption": "Kitchen deep clean, after",
  "category": "cleaning",
  "order": 1,
  "active": true
}
```

`url` is used as an `<img src>` verbatim. Absolute URLs or site-root paths both
work; the demo seed uses paths relative to `site/admin/`.

| | |
|---|---|
| `GET /admin/portfolio` | `{ "items": [ … ] }`, sorted by `order` |
| `POST /admin/portfolio` | body without `id`/`order`; append at the end |
| `PUT /admin/portfolio/{id}` | full replace |
| `PUT /admin/portfolio/order` | `{ "ids": [3, 1, 2] }` → renumber `order` to match the array, return the reordered list |
| `DELETE /admin/portfolio/{id}` | **204** |

Order matters on the public page: the before-and-after pairs only read correctly
while they stay adjacent.

### `POST /admin/portfolio/upload`

`multipart/form-data`, one part named `file`.

```json
{ "url": "/media/portfolio/a1b2c3.jpg" }
```

This is the one call that does **not** send `Content-Type`. The browser sets it
so the multipart boundary is included. It still sends `X-Admin-Key`.

Validate on your side: allowed image types, a size ceiling, and a generated
filename rather than the client's. Until this endpoint exists the console inlines
the image as a data URL and caps it at 1.5 MB.

---

### Activity log

The console reports each action it takes so the Logs page can show who did
what, and when.

**Read this before implementing it.** The console has no authenticated
identity: every operator sends the same shared key, and `user` is a name the
operator typed into Settings. It is a label, not a credential. Treat these
entries as *what the console reported*, never as proof of who acted.

If you need a real audit trail, two things have to change: the API must write
its own log entry inside each mutating handler, from what it actually did, and
the shared key must be replaced by per-user credentials. Until then this is an
activity log for coordination, which is what it is presented as in the UI.

**Log entry**

```json
{
  "id": 41,
  "at": "2026-08-28T15:07:00Z",
  "user": "Karlos",
  "action": "request.status",
  "target": "#0142",
  "targetId": 142,
  "detail": { "from": "new", "to": "contacted" }
}
```

| Field | Notes |
|---|---|
| `at` | ISO 8601, set by the client. Prefer your own server clock if you record entries yourself. |
| `user` | free text, may be empty. Empty renders as "Unknown". |
| `action` | a stable key, listed below. Never a sentence: the console renders the wording from this key, so old entries read in whatever language is selected now. |
| `target` | short human-readable subject: `#0142`, or a service title. |
| `targetId` | the record's id, so the log can link back to it. Null where there is no single record. |
| `detail` | structured extras used in the wording. Shape depends on the action. |

**Actions**

| Key | `detail` |
|---|---|
| `session.signin` / `session.signout` | — |
| `request.status` | `{ from, to }` (status ids) |
| `request.quote` | `{ amount }` |
| `request.quoteCleared` | — |
| `request.note` / `request.delete` | — |
| `service.create` / `service.update` / `service.delete` | — |
| `portfolio.create` / `portfolio.update` / `portfolio.delete` | — |
| `portfolio.reorder` | `{ count }` |
| `settings.apiUrl` | — (`target` holds the new address) |
| `settings.resetDemo` | — |

Store `action` as an opaque string. New keys will be added, and an unknown one
must not break the log: the console falls back to showing the key itself.

### `GET /admin/logs`

| Query | Values |
|---|---|
| `q` | free text, matched against user, action and target |
| `user` | exact name; omitted = anyone |
| `group` | `session` `request` `service` `portfolio` `settings`; matches the part of `action` before the dot |
| `from` / `to` | `YYYY-MM-DD`, inclusive, on `at` |

```json
{
  "items": [ /* newest `at` first */ ],
  "total": 41,
  "users": ["Anna", "Karlos"]
}
```

`users` is the distinct set of names across the **whole** log, not just the
filtered page: it populates the "Anyone" dropdown, which would otherwise lose
options as soon as a filter is applied.

### `POST /admin/logs`

Body is a log entry without `id`. Returns the created entry.

The console does not await this call and ignores failures, so a log write must
never be able to fail an operator's actual edit. Keep the handler cheap, and
never let it reject the request that triggered it.

---

## Building against it

The console falls back to a demo store whenever a call fails at the network
level, so you can bring endpoints up one at a time. Note that the fallback is
**per-session, not per-endpoint**: the first network failure flips the whole
console to demo mode until you hit "Try the API again" in Settings.

A `GET /admin/session` that returns 200 is enough to get past sign-in. From
there, the useful order is `/admin/stats` and `/admin/requests` (the two pages
that matter daily), then requests detail and mutations, then services, then
portfolio.
