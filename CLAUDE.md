# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield. As of the first commit there is no code, build, lint, or test tooling. Add those commands here once they exist. The source of truth for intent is the concept brief (`manifestation-cascade-concept.md`); a design document is still to come from the owner.

## What this is

Manifestation Cascade: a daily global collective meditation at **7:07 pm in each visitor's local time zone**, so the practice rolls around the planet as a "cascade". First theme: *End the War* (must be a single editable config value). The site tells visitors when their session starts, guides the hour, and counts participation.

## Architecture (planned, per the brief)

- **Front end:** one static page (HTML/CSS/JS), one small translation file per language, hosted on GitHub Pages. No framework unless a need is demonstrated.
- **Back end:** a tiny serverless endpoint (e.g. Cloudflare Workers + KV/D1) with three calls: record visit, record commitment, record meditation. Counters are keyed by date + IANA time zone.
- **State machine (client-only, from device clock):** Waiting (8:07 pm to 7:07 pm, countdown) -> Active (7:07 to 8:07 pm, 60 min countdown; late joiners see remaining time) -> Complete (8:07 pm, closing message, then back to Waiting). Compute from absolute timestamps on every tick, never a decrementing counter, so sleeping tabs stay correct; let the browser handle DST.
- **Language:** order is saved choice, then `navigator.languages`, then IP country default, then English. Use logical CSS properties from the start (RTL: Arabic, Hebrew, Persian, Urdu). Language names are shown in their own script. Translation of the theme needs fluent human review.

## Non-negotiable constraints

- **Privacy:** record only visit counts, IANA time zone (from `Intl.DateTimeFormat().resolvedOptions().timeZone`), and meditation/commit counts. No IPs, names, emails, or persistent identifiers. Aggregates per day per time zone, not event logs. No third-party analytics or trackers. The page states: "We count visits and meditations by time zone. Nothing else."
- **Integrity:** counts are self-reported and must be described that way. Duplicate guard via `localStorage` is a convenience only. Server-side rate limiting is required. The server must validate the time zone against the IANA list and accept only the three known actions.
- **Claims:** present the practice as shared intention and solidarity, never as a guaranteed way to end a war. Research citations in the brief (Orme-Johnson 1988; Hagelin 1999) are from memory and contested; verify before any public use.
- **Audio:** only starts after a user gesture; always mutable; mute preference stored locally; royalty-free with clear licensing; small files.
- **Accessibility:** respect `prefers-reduced-motion`, sufficient contrast in both visual states, full keyboard use, screen reader labels, Screen Wake Lock during the session.
- **Performance:** small page weight for slow connections.

## Open decisions (ask the owner before assuming)

Cadence (single/daily/weekly), full hour vs. any-length window, meaning of "7:07", secular vs. interfaith tone, theme governance, public reporting.
