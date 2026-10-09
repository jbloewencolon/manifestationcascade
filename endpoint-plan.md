# Counting endpoint: plan (awaiting confirmation, nothing implemented)

Assumes Cloudflare Workers + D1 (the brief's suggestion). Change this section if you prefer another host.

## Calls
`POST https://api.manifestationcascade.com/v1/event` with body `{"kind":"visit"|"commitment"|"meditation","tz":"America/Toronto"}`. Nothing else is accepted. Response: `204` on success, `400` invalid, `429` rate limited.

Optional, later: `GET /v1/today` returning `{meditators, timezones}` for a "X people have meditated today across Y time zones" line. Not in v1.

## Validation (server side, all required)
- Method POST, `Content-Type: application/json`, body at most 256 bytes.
- `kind` is one of the three literals.
- `tz` is at most 64 chars and accepted by `new Intl.DateTimeFormat("en", {timeZone: tz})` (throws on non-IANA values).
- `Origin` header must be `https://manifestationcascade.com`; CORS allows only that origin; no cookies (`credentials: "omit"`).

## Storage (aggregates only)
One table, no event log, no IPs, no user ids:
`counts(day TEXT, tz TEXT, kind TEXT, n INTEGER, PRIMARY KEY (day, tz, kind))`, written with `INSERT ... ON CONFLICT DO UPDATE SET n = n + 1`. `day` is the server's UTC date.

## Abuse limits
- Workers Rate Limiting binding, keyed on the connecting IP at the edge (we never store it): 10 requests per minute per IP.
- Client dedupe stays (once per day visit, once per session meditation) as a convenience only. Counts are self-reported and described that way.

## Client changes
- Replace `record()` in `js/core.js` with a `fetch(..., {method: "POST", keepalive: true, credentials: "omit"})` that fails silently (the practice must work offline or if the API is down).
- Tighten CSP `connect-src` from `'none'`/`'self'` to exactly `https://api.manifestationcascade.com`.
- `?preview=` modes keep skipping recording.

## Privacy copy
The on-page line stays: "We count visits and meditations by time zone. Nothing else." Cloudflare processes request IPs at the edge for delivery and rate limiting; we do not store them. Worth one sentence in a fuller privacy page.

## Tests
Handler written as a pure function `(request, env) => Response`, tested with `node:test` for: bad kind, bad tz, oversize body, wrong origin, wrong method, and correct upsert.

## Questions for you
1. Cloudflare Workers + D1 OK? (Needs a Cloudflare account and the domain's DNS, or a `workers.dev` URL to start.)
2. Subdomain `api.manifestationcascade.com`, or a path on the main domain?
3. Show the public "meditated today" counter in v1, or later?

## Update (see `trackers-plan.md`)
Public trackers change this plan: counts are keyed by `(session, band, kind)` instead of UTC `day`, the POST also takes and validates `session` (meditation only within start+75 min), and a cacheable `GET /v1/stats?band=` is added. The public counter question above is answered: yes, show totals.
