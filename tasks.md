# Tasks

## Phase 0: Decisions (blocking)
- [ ] Owner chooses variant A, B or C (then delete the other two and the tab bar)
- [ ] Answer open decisions (cadence, duration, tone, backend)
- [ ] Receive design document

## Phase 1: Front end polish
- [ ] Fluent human review of all 10 translations, especially the theme and "cascade" (ar/he use waterfall words) and the new safety line
- [ ] Localize aria labels ("Language", "Sound") and the About/safety copy review
- [ ] Wire real audio files if synthesized sound is rejected
- [ ] Mobile: "YOU" label can overlap buttons in variant B
- [ ] Cyrillic/Arabic/Devanagari/CJK fonts (latin subset only is vendored; others use system fonts)
- [ ] Accessibility audit pass (contrast of muted text, screen reader run-through)

## Phase 2: Counting endpoint (plan and confirm before implementing)
- [ ] Plan endpoints, get confirmation
- [ ] Implement visit / commit / meditated with IANA tz validation and rate limiting
- [ ] Replace `record()` placeholder in `site/js/core.js`; loosen CSP `connect-src` to the endpoint only

## Phase 3: Launch
- [ ] DNS for manifestationcascade.com -> GitHub Pages, enable HTTPS
- [ ] Merge to the Pages branch; consider Cloudflare in front for real security headers
- [ ] Privacy statement and evidence-framing copy review
