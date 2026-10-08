# Tasks

## Phase 0: Decisions
- [x] Cadence: daily; variant: A (all three tabs kept for now); tone: secular with alchemical hints
- [ ] Remaining: duration (full hour vs any length), meaning of 7:07, theme governance, public reporting
- [ ] Receive design document

## Phase 1: Front end polish
- [ ] Fluent human review of all 10 translations (new alchemical copy, "cascade" in ar/he uses waterfall words, safety line)
- [ ] Final cleanup once the owner drops B and C (remove tab bar, unused CSS/fonts/vendor map data)
- [ ] Mobile: "YOU" label can overlap buttons in variant B (moot if B is dropped)
- [ ] Non-Latin fonts: latin subset only vendored; other scripts use system fonts (deliberate, keeps weight low)
- [ ] Screen-reader run-through with a real device (automated contrast check passed)

## Phase 2: Counting endpoint (plan and confirm before implementing)
- [ ] Owner confirms `endpoint-plan.md` (3 questions at its end)
- [ ] Implement visit / commit / meditated with IANA tz validation and rate limiting
- [ ] Replace `record()` placeholder in `site/js/core.js`; loosen CSP `connect-src` to the endpoint only

## Phase 3: Launch
- [ ] Owner: merge the branch into the Pages branch (Pages source: root), DNS A records, enforce HTTPS
- [ ] Consider Cloudflare in front for real security headers
- [ ] Privacy statement and evidence-framing copy review
