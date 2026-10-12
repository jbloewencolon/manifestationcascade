# Tasks

## Phase 0: Decisions
- [x] Cadence: daily; design: A Tidal Rings (committed); tone: secular with alchemical hints
- [ ] Remaining: duration (full hour vs any length), meaning of 7:07, theme governance, public reporting
- [ ] Receive design document

## Phase 1: Front end polish
- [ ] Fluent human review of all 10 translations (new alchemical copy, "cascade" in ar/he uses waterfall words, safety line)
- [ ] Non-Latin fonts: latin subset only vendored; other scripts use system fonts (deliberate, keeps weight low)
- [ ] Real-device check of background audio (iOS Safari, Android Chrome): switch app, lock screen, return; also the calendar download and wake lock
- [ ] Screen-reader run-through with real devices (VoiceOver, NVDA, TalkBack); native-speaker check of aria labels. See `accessibility-audit.md`

- [ ] Owner: confirm the softened "This is going to happen" line in the About copy
- [ ] Native-speaker review of the new About copy and "Add to calendar" label (10 languages)

## Phase 2: Counting endpoint (plan and confirm before implementing)
- [ ] Owner confirms `endpoint-plan.md` (3 questions at its end)
- [ ] Implement visit / commit / meditated with IANA tz validation and rate limiting
- [ ] Replace the `record()` placeholder in `js/api.js`; loosen CSP `connect-src` to the endpoint only

## Phase 2b: Cascade trackers (plan in `trackers-plan.md`, awaiting go-ahead)
- [x] Decisions: total counts meditations; whole-hour bands; your band for "planning"; row under the timer
- [ ] Owner: confirm milestones (108...), meditation window (start+75 min), commitments excluded from total
- [x] P0 prep: `STRINGS` -> `js/strings.js`, helpers -> `js/util.js`, `record()` -> `js/api.js`
- [ ] P1 UI with mock data (single Tidal Rings skin) + strings x10 + empty/error states + tests/audits
- [ ] P2 backend: session/band schema, POST validation, cached GET /v1/stats, tests
- [ ] P3 wire live, CSP, polling (visible only), optimistic updates
- [ ] P4 audits + translator review + privacy-line change (10 languages)

## Phase 3: Launch
- [ ] Owner: merge the branch into the Pages branch (Pages source: root), DNS A records, enforce HTTPS
- [ ] Consider Cloudflare in front for real security headers
- [ ] Privacy statement and evidence-framing copy review
