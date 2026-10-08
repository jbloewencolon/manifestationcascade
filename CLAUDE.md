# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Three design variants (A Tidal Rings, B Meridian, C Ma) are live behind a tab bar; A is the owner's pick but all three are kept for now. The site lives at the repo root (GitHub Pages branch mode only serves `/` or `/docs`). Counting is still a `localStorage` placeholder (no server). The source of truth for intent is `manifestation-cascade-concept.md`; a design document is still to come from the owner.

## Commands

- `npm test` runs the Node unit tests (`test/core.test.js`: state machine incl. DST, formatting, translation key parity). No dependencies to install.
- `npm run serve` serves the repo root at http://localhost:8080. Append `?preview=waiting|active|activeEnd|complete` to fake the clock (previews never record counts) and `#a|#b|#c` to pick a variant.
- Deploy: GitHub Pages from the repo root (`/`) for manifestationcascade.com (root `CNAME`, `.nojekyll`, `404.html`). Pages cannot set HTTP headers, so the CSP is a `<meta>` tag in `index.html`. Dev files (tests, md notes) are public too; keep secrets out of the repo.

## What this is

Manifestation Cascade: a daily global collective meditation at **7:07 pm in each visitor's local time zone**, so the practice rolls around the planet as a "cascade". First theme: *End the War* (must be a single editable config value). The site tells visitors when their session starts, guides the hour, and counts participation.

## Architecture

- **No build step, no framework, no third-party requests.** Plain ES modules under `js/`, fonts and map data vendored in `fonts/` and `vendor/` (licences in `vendor/LICENSES.txt`). The CSP forbids inline scripts and `style` attributes: build DOM with `textContent`/`createElement` and set styles via CSS classes or `element.style.x`, never `innerHTML` or `setAttribute("style")`.
- `js/core.js`: pure clock state machine (`compute(now)`: waiting -> active -> complete from absolute timestamps, local 19:07), all translation strings (`STRINGS`, DRAFT, need human review), synthesized audio engine, and the `Controller`. One Controller is shared by every variant (one visit count, one audio engine); it emits a cached snapshot (`ctrl.cur`) every 250 ms. `record()` is the placeholder for the future serverless endpoint.
- `js/view.js` builds the one DOM structure all variants share; `js/loop.js` is the canvas loop (DPR, eased mix, throttled when `prefers-reduced-motion`). `js/variant-{a,b,c}.js` each export `mount(stage, ctrl)` returning a dispose function and own only the canvas art, audio config and view options. Visual styling lives in `css/variant-*.css`, keyed on `body.v-a|b|c` and `body.is-active`.
- `js/app.js` is the variant shell (hash routing; the switcher is a plain `<nav>` of links with `aria-current`, plus a JS-handled skip link).

## Non-negotiable constraints

- **Privacy:** record only visit counts, IANA time zone (from `Intl.DateTimeFormat().resolvedOptions().timeZone`), and meditation/commit counts. No IPs, names, emails, or persistent identifiers. Aggregates per day per time zone, not event logs. No third-party analytics or trackers. The page states: "We count visits and meditations by time zone. Nothing else."
- **Integrity:** counts are self-reported and must be described that way. Duplicate guard via `localStorage` is a convenience only. Server-side rate limiting is required. The server must validate the time zone against the IANA list and accept only the three known actions.
- **Claims:** present the practice as shared intention and solidarity, never as a guaranteed way to end a war. Research citations in the brief (Orme-Johnson 1988; Hagelin 1999) are from memory and contested; verify before any public use.
- **Audio:** only starts after a user gesture; always mutable; mute preference stored locally; royalty-free with clear licensing; small files.
- **Accessibility** (audited, see `accessibility-audit.md`): respect `prefers-reduced-motion` and keep the in-page "pause animation" control; contrast >= 4.5:1 even where canvas art passes behind text; full keyboard use and visible focus; all controls >= 44px; font sizes in `rem`; every user-facing string, including aria labels, lives in `STRINGS` per language; move focus to the confirmation when a pressed button disappears; Screen Wake Lock during the session.
- **Performance:** small page weight for slow connections.

## Decisions

- Cadence: **daily**. Variant: **A** (keep all three tabs for now). Tone: **secular with alchemical hints** (settling, transmuting heaviness, kindling a flame, releasing into the world); no outcome promises.
- Counting plan is in `endpoint-plan.md`, awaiting owner confirmation. Do not implement before that.

## Open decisions (ask the owner before assuming)

Backend choice, full hour vs. any-length window, meaning of "7:07", theme governance, public reporting, human review of the 10 translations.
