# Cascade trackers: plan (nothing implemented yet, awaiting go-ahead)

Three small public trackers, driven by the counting endpoint from `endpoint-plan.md`.

## Decisions already made
| Question | Decision |
|---|---|
| What "total manifestors" counts | **Meditations** (each "I Meditated", once per device per session). Labelled "meditations", never "people": we store no identifiers, so we cannot count unique people. |
| Map detail | **Whole-hour UTC bands**, UTC-12 to UTC+14 (27 bands). Half-hour zones fold into the nearest band (ties round up: India UTC+5:30 -> +6, Newfoundland -3:30 -> -3). One person lighting a band reveals nothing about them. |
| "Your time zone" for tracker 3 | **Your whole-hour band** (e.g. "UTC-5"), so numbers are bigger and private. |
| Placement | **Compact row under the timer.** Waiting and complete: all three. Active hour: only the quiet band strip, so the meditation screen stays calm. |

## The three elements
1. **Wave strip** (tracker 1): 27 small ticks west-to-east. Lit gold = someone in that band meditated during its cascade hour today; the band currently in session breathes gently; a small marker shows "you". Because "I Meditated" appears in the last 10 minutes, bands light about an hour behind the 19:07 line, so the lit trail visibly follows the wave. Always `dir="ltr"` (geography), plus a text summary for screen readers ("Meditations recorded in 9 of 27 time zones in this cascade").
2. **Total ring** (tracker 2): the all-time meditation count (localized number) with a slow ring filling toward the next milestone. Default milestones 108, 1,080, 10,800... (easy to change in one constant). Never seeded with fake numbers. At zero it reads as an invitation ("Be among the first"), not "0".
3. **Planning dots** (tracker 3): "17 planning to join in your time zone (UTC-5)" with up to 24 dots (then "+"); your own dot lights when you press Commit. Counts commitments for the *upcoming* session of your band, so it resets by itself when that cascade finishes and the next session becomes "upcoming".

Copy stays honest: numbers are self-reported, shown as "meditations", and the page's privacy line becomes "We count visits, commitments and meditations by time zone, and show the totals. Nothing else." (10 languages, needs your OK since it changes the public promise).

## Code review: what this touches
- **Good fit:** `Controller.rec()` is already the single choke point for events, so the client change is small. `view.js` is the one shared DOM builder, so trackers are built once and only skinned per variant (A/B/C). The `?preview=` modes already skip recording; they will also skip the network and use fixtures.
- **Needs prep first (small, mechanical):** `STRINGS` lives on 10 enormous lines in `core.js`; adding ~10 keys x 10 languages there is error-prone. Move it to `js/strings.js` (pure move, tests unchanged). Move the `record()` placeholder to `js/api.js` so `core.js` stops growing.
- **Plan changes in `endpoint-plan.md`:** the data model keyed on UTC `day` is not enough. Counts must be keyed by *session* (the UTC instant of that band's 19:07) and *band*. The write now also validates the session, and there is a new cacheable read call. CSP `connect-src` must be loosened to the API origin only.
- **Privacy rule still holds:** aggregates per session per band, no identifiers, no event log. The only new thing is that aggregates are public.

## Backend additions (on top of `endpoint-plan.md`)
- Tables: `agg(session INTEGER, band INTEGER, kind TEXT, n INTEGER, PRIMARY KEY(session, band, kind))` and `totals(kind TEXT PRIMARY KEY, n INTEGER)`. One atomic D1 batch per event.
- `POST /v1/event {kind, tz, session}`: server derives the band from `tz` at that session, and checks `session` equals that zone's real 19:07 within +/-1 day. **Meditation is only accepted between session start and start+75 min** (server clock, +/-5 min tolerance), which also blunts scripted inflation. Commitment is accepted only for the *upcoming* session.
- `GET /v1/stats?band=-5` returns `{total, wave:[{band, meditated}], zone:{band, planning, session}, asOf}`: roughly 1-2 KB. `band` must be an integer -12..27; public, no cookies, edge-cached 30 s (only 27 cache variants), so load stays tiny however popular the site gets.
- Rate limit and origin checks as in `endpoint-plan.md`. No third-party anti-bot (keeps the no-third-party rule).

## Client additions
- `js/band.js` (pure, unit-tested): offset to band, band labels, which band is "in session now".
- `js/stats.js`: fetch with timeout and `credentials: "omit"`, defensive shape checks, last-good cache, polling every ~45 s with jitter **only while the page is visible and online** (same rule as the audio fix), immediate refresh on return, back-off to 5 min on errors, optimistic +1 after your own Commit / I Meditated.
- `js/trackers.js`: the three builders, called from `view.js`; per-variant skins in `css/variant-*.css`.
- Failure is silent: if the API is down or blocked, the trackers simply do not appear (no error text, no broken layout).
- Accessibility and i18n: text summaries instead of relying on colour, localized number formatting via `Intl.NumberFormat`, no animation under reduced motion or pause, no live-region chatter, 10 languages x ~10 new strings under the existing key-parity test.

## Phases
| Phase | Work | Needs from you |
|---|---|---|
| 0 | Prep refactor (`strings.js`, `api.js`) | nothing |
| 1 | **UI with mock data** for all three skins: trackers, strings, empty/error states, `?mock=` fixtures, tests, a11y + mobile audits. You see and approve the visuals with no backend. | go-ahead |
| 2 | Backend: schema, POST + GET, node tests (band rounding for India/Nepal/Newfoundland/Chatham, DST days, window and session checks, caching) | Cloudflare account + the 3 answers in `endpoint-plan.md` |
| 3 | Wire live: replace mock, CSP, polling lifecycle, optimistic updates, end-to-end with the real clock | deploy access |
| 4 | Audits again (axe, mobile, real-clock hour, contrast over canvas, bundle size) and translator review of new copy | native speakers |

Rough size: Phase 1 and Phase 2 are each a medium chunk of work, Phases 0, 3, 4 small. About four focused sessions of mine, plus your Cloudflare setup and translator time.

## Risks and things to watch
- **Self-reported and gameable.** Window check + rate limit make casual inflation hard, not impossible. Copy must never imply verification.
- **Sparse early data.** Empty states must feel inviting, not like a ghost town; never seed numbers.
- **Clock skew.** A phone with a wrong clock can be silently rejected by the server window check; the visitor still sees their own optimistic +1 until the next refresh.
- **Band rounding** places half-hour zones up to 30 minutes from their true position on the strip; fine for a visual, wrong for anything precise.
- **Wording.** "Manifestors" in copy is fine as a community word, but any number is "meditations".

## Still open (defaults used unless you say otherwise)
1. Milestones 108 / 1,080 / 10,800... OK?
2. Meditation window 19:07 to 20:22 (start+75 min) OK?
3. Do commitments count toward the total? Default: no, only completed meditations.
4. The three backend answers from `endpoint-plan.md` (Cloudflare Workers + D1, API subdomain). Tracker 2 is effectively a yes to the public counter.
