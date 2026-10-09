# Mobile audit

Scope: variants A/B/C x waiting/active/complete at 8 viewports (320x568, 360x740, 375x667, 390x844, 414x896, 768x1024, 667x375 and 844x390 landscape) with touch emulation and device pixel ratio 2, plus 9 languages (ru, hi, ar, he, zh, fr, pt, es, uk) at 320px, which is the worst case for long words and right-to-left layout. 126 page loads per run.

Checked on each page: horizontal scroll, any element past the viewport edge, clipped text, controls under 44px, theme heading overflow, language select font size (iOS zooms below 16px), viewport meta, JS errors, and whether the countdown shortcut is in the first screen.

## Found and fixed
| Finding | Fix |
|---|---|
| B (320px): header overflowed in Portuguese and Ukrainian, sound button squeezed to 31px | Time-zone chip hidden below 30rem (the zone is still in the countdown caption); icon buttons never shrink |
| C: Commit / I Meditated / calendar buttons 34px tall | 44px minimum height; 44px minimum width for every button (short Arabic label was 41px) |
| C (320px): Russian heading overflowed the 166px ring | Ring is at least 15rem, heading allowed to wrap long words, smaller minimum size |
| Hover styles stick after a tap on touch screens | All hover rules wrapped in `@media (hover: hover)` |
| Language select was 15px, so iOS would zoom the page on focus | 16px |
| The About story (placed at the top as requested) pushed the countdown 1400-1800px down on phones | Superseded: About is now a closed-by-default dropdown, so the countdown is in the first screen; the interim jump link was removed |

## Known / not changed
- The expanded About panel pushes the countdown down while it is open (user-initiated); it closes with a second tap.
- Safe-area insets (notches) are not handled; none of the layouts place controls at the very edge, but a real-device check on an iPhone with a notch in landscape is still worth doing.
- This used Chromium's mobile emulation, not real iOS Safari or Android Chrome. Wake Lock, audio start and the calendar download in particular should be tried on real devices.
