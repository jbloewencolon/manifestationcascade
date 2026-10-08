# Accessibility audit

Scope: WCAG 2.2 AA plus best practice, variants A/B/C, states waiting/active/complete, languages en/ar/he/ru/zh.
Method: axe-core 4.14 in Chromium (9 variant/state pages plus 4 languages), scripted keyboard, reflow, text-size, reduced-motion, forced-colors and pixel-sampled contrast checks over the animated canvas.
The test scripts are not committed; rerun them against `npm run serve` if the design changes.

## Passed on first run
Single `h1`, landmarks (`nav`, `header`, `main`, `footer`), page title and `lang`/`dir` per language, `role="timer"` (not live, so no per-second chatter), polite status region announcing state changes only, decorative canvas hidden from AT, no autoplay audio, sound off by default, no flashing, visible 2px focus rings on every control (including the visually hidden `<select>` via its label), logical tab order, About disclosure with `aria-expanded`/`aria-controls`, no horizontal scroll at 320px (all variants), no clipping under WCAG 1.4.12 text-spacing overrides, forced-colors mode readable, transitions removed under `prefers-reduced-motion`.

## Fixed
| Finding | WCAG | Fix |
|---|---|---|
| Continuous animation had no in-page pause (only the OS setting) | 2.2.2 A | "Pause animation" button (`aria-pressed`, persisted in `localStorage`, localized); also stops palette fades |
| No bypass block | 2.4.1 A | Localized skip link (JS-handled because the hash routes variants), `<main id="main">` |
| Focus dropped to the page top when Commit / I Meditated disappeared | 2.4.3 A | Focus moves to the confirmation message |
| Language options not marked with their own language | 3.1.2 AA | `lang` on every `<option>` |
| Variant switcher used ARIA tabs without tab panels | 4.1.2 A | Plain `<nav>` with links and `aria-current="page"` |
| Fixed-px font sizes ignored the user's default text size; some text under 14px | 1.4.4 AA / best practice | All font sizes in `rem` (verified at 200%), 14px floor, native `<option>` sized |
| Language picker and About link 40-41px tall | 2.5.8 / best practice | 44px minimum on every control |
| Variant A light-mode muted text 3.4:1 where a ring crosses behind it | 1.4.3 AA | Muted colour darkened to #36404B (>= 4.5:1 over the worst ring pixel) |
| `Language` / `Sound` aria labels English only | 3.1.2 AA | Localized in all 10 languages |

## Known, not fixed (exploratory variants only)
- Variant B: the "YOU" map marker can sit directly behind the countdown or labels depending on the visitor's time zone, giving local contrast below 4.5:1. Variant C passes. Both go away or get a proper fix once the owner drops them.

## Still needs a human
- Real screen-reader pass (VoiceOver, NVDA, TalkBack), especially the status announcements and the RTL layouts.
- Native-speaker check of the localized aria labels and skip link.
- Re-run after the design document lands.
