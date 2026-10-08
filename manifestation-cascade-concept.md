# Manifestation Cascade: Concept Brief

## 1. Core Idea

The Manifestation Cascade is a recurring, globally distributed collective meditation. Participants meditate at **7:07 pm in their own local time zone** on a single shared theme. Because local time is the trigger, the practice moves around the planet as a continuous wave (a "cascade") rather than occurring at one simultaneous moment.

**First theme:** *End the War*

**Supporting artifact:** a minimal website that (a) tells each visitor when their local session begins, (b) guides them through the hour, and (c) collects only the most basic participation counts.

### Why the cascade structure matters

- A fixed local clock time produces a rolling wave, with each time zone entering the practice in sequence. Roughly 24 hours of the day contain an active session somewhere.
- Time zones with 30 or 45 minute offsets (for example India, Nepal, parts of Australia) produce staggered sub-waves, which makes the visual of the cascade richer.
- The wave is the central visual and narrative metaphor, and the site can make it visible (see Section 6).

## 2. Framing and Evidence Notes

The site's integrity depends on how it describes efficacy. The literature on group meditation and collective effects is small and contested, so the framing should be intentional rather than promissory.

- Orme-Johnson et al. (1988) reported associations between group Transcendental Meditation practice and reduced conflict indicators in the Middle East (*Journal of Conflict Resolution*, 32(4), 776-812).
- Hagelin et al. (1999) reported reduced violent crime associated with a large group practice in Washington, D.C. (*Social Indicators Research*, 47, 153-201).
- Both studies have faced substantial methodological criticism (quasi-experimental designs, confounds, and questions about causal inference). They are best cited as context, not proof.

**Recommendation:** Present the project as a *shared practice of collective intention and solidarity*, not as a guaranteed mechanism for ending a war. This protects credibility, avoids overclaiming, and still honors the participants' purpose. Citations above are from memory and should be verified before any public use.

## 3. User Experience Specification

### 3.1 Main screen (waiting state)

| Element | Behavior |
|---|---|
| Theme | Large, centered text: **End the War** (theme should be a single editable config value) |
| Countdown | Time remaining until the next 7:07 pm in the visitor's local time zone |
| Instructions | 3 to 4 short lines (see Section 3.5) |
| Language selector | Prominent, always visible, top corner |
| Actions | "Commit to a Cascade" button |
| Music control | Mute/unmute toggle |

### 3.2 State machine

The site has three states, determined entirely by the visitor's device clock:

1. **Waiting:** from 8:07 pm (previous session end) until 7:07 pm. Shows countdown to the next session.
2. **Active:** from 7:07 pm to 8:07 pm. Shows a 60 minute meditation countdown. Colors, animation, and music change.
3. **Complete:** at 8:07 pm. Shows a brief closing message and the "I Meditated" confirmation, then resets to Waiting with the countdown pointing to the next 7:07 pm.

Your spec says the timer "resets at 8:07pm when their meditation is over." This maps directly onto the transition from Active to Complete to Waiting.

### 3.3 Active state (7:07 pm to 8:07 pm)

- A one hour countdown (mm:ss) replaces the waiting timer.
- Visual shift: slower, deeper palette (for example, from daylight neutrals to deep indigo and gold) with a gentle, slow animation such as expanding concentric rings that echo the "cascade" idea.
- Audio shift: from the waiting-state ambient track to a dedicated meditation track.
- The **I Meditated** button should appear during the last few minutes and remain available until the reset, so people who join late can still record participation.
- Consider a "joined late" path: if someone arrives at 7:40 pm, show the remaining 27 minutes rather than a full hour.

### 3.4 Audio

- Mutable at all times, with a persistent mute control.
- Browsers block autoplay with sound, so audio must begin only after a user gesture. Use a gentle "Enter" or "Begin" interaction, or start muted with a clear unmute prompt.
- Remember mute preference locally on the device.
- Use royalty-free or commissioned audio with clear licensing. Keep files small for low-bandwidth regions.

### 3.5 Instructions (draft)

1. At 7:07 pm your local time, find a quiet place and begin.
2. Bring your attention to the theme: *End the War*.
3. Breathe slowly. Hold the intention for the full hour, or as long as you are able.
4. When you finish, press **I Meditated**.

### 3.6 Language handling

- **Initial language:** Detect automatically. Note that the browser's language preference (`navigator.languages` / `Accept-Language` header) is generally a **better signal than IP geolocation**, because IP location reflects where a person is, not what language they read (travelers, VPN users, multilingual countries, diaspora communities). Recommended order: saved choice, then browser language, then IP-based country default, then English.
- **Manual override:** A clearly labeled selector (globe icon plus the current language name written in that language) that is always visible. Language names should be displayed in their own script (for example "Español", "العربية", "日本語").
- **Right-to-left support:** Required for Arabic, Hebrew, Persian, and Urdu. Build layout with logical CSS properties from the start.
- **Translation scope:** Very small string set (theme, instructions, two buttons, timer labels). Consider that the theme itself ("End the War") needs careful, culturally aware translation by fluent speakers rather than machine translation alone, since phrasing carries different weight across languages.
- **Launch set suggestion:** English, Spanish, French, Arabic, Ukrainian, Russian, Hebrew, Mandarin, Hindi, Portuguese, plus whichever languages are most relevant to the conflicts in question. Others can be added over time.

## 4. Buttons and Data

### 4.1 Actions

| Button | Meaning | Data recorded |
|---|---|---|
| **Commit to a Cascade** | "I intend to meditate at the next 7:07 pm" | +1 commitment, with time zone |
| **I Meditated** | "I completed the practice" | +1 meditator, with time zone |

### 4.2 Minimal data policy

Collect only three things, as specified:

1. **Visitors:** an anonymous count of visits.
2. **Time zones:** IANA time zone identifier (for example `America/Toronto`), obtained from the browser via `Intl.DateTimeFormat().resolvedOptions().timeZone`. This avoids the need to store or process IP addresses at all.
3. **Meditators:** count of "I Meditated" presses (and, optionally, commitments).

**Privacy design principles:**

- Do not store IP addresses, names, emails, or persistent identifiers.
- Store aggregates (counts per time zone per day) rather than individual event logs where possible.
- No third-party analytics or advertising trackers. This also keeps the site fast and trustworthy, and likely simplifies compliance with GDPR and similar frameworks, though this should be confirmed for your jurisdictions.
- State the policy in one plain sentence on the page: "We count visits and meditations by time zone. Nothing else."

### 4.3 Data integrity

- All meditation counts are **self-reported**. This should be stated honestly in any reporting.
- To limit accidental duplicates, use a device-level flag (for example in `localStorage`) permitting one "I Meditated" per session per device. Note this is a convenience, not a security measure, and it deliberately avoids user tracking.
- Add basic server-side rate limiting to prevent scripted inflation.

## 5. Suggested Technical Approach

The simplicity of the concept suggests a lightweight architecture.

- **Front end:** a single static page (HTML, CSS, JavaScript) with a small translation file per language. This can be hosted on GitHub Pages, consistent with your existing site workflow.
- **Back end:** a tiny serverless endpoint (for example Cloudflare Workers with KV or D1, or a comparable service) exposing two or three calls: record visit, record commitment, record meditation. Store counters keyed by date and time zone.
- **Timing logic:** compute everything client-side from the device clock and local time zone, so DST and offset edge cases are handled by the browser. Recompute from absolute timestamps on every tick (do not rely on a decrementing counter) so the timer stays accurate if a tab sleeps.
- **Accessibility:** respect `prefers-reduced-motion`, ensure sufficient color contrast in both states, provide full keyboard operation and screen reader labels, and consider the Screen Wake Lock API so phones do not sleep mid-meditation.
- **Performance:** target a small page weight so it works on slow connections, which matters for a global audience.

## 6. Optional Enhancements (Not Required for Version 1)

- **Live cascade map:** a simple world map showing the 7:07 pm line sweeping across time zones, with aggregate glow where people have meditated. This would make the "cascade" concept visible and shareable.
- **Aggregate counter:** "X people have meditated today across Y time zones," displayed after the Complete state.
- **Share button:** a simple link or image to invite others.
- **Archive of themes:** a config-driven way to change the theme for future cascades.

## 7. Open Design Decisions

1. **Cadence:** Is this a single event, a daily practice, or a recurring series (for example weekly)? This affects the countdown logic, data model, and messaging more than any other decision.
2. **Duration:** Is the full hour expected of participants, or is it a window in which they may meditate for any length of time?
3. **Meaning of "7:07":** If there is a symbolic reason for the time, the site could say so in one line.
4. **Tone and tradition:** Should the practice be framed as secular, interfaith, or rooted in a particular tradition? This determines wording of the instructions and the choice of music.
5. **Theme governance:** Who decides future themes, and how are they chosen?
6. **Reporting:** Will aggregate results be shared publicly, and in what form?

## 8. One-Paragraph Summary

The Manifestation Cascade is a rolling, worldwide collective meditation held daily (or on a chosen cadence) at 7:07 pm local time, starting with the theme *End the War*. A minimal, multilingual website centers the theme, counts down to each visitor's local session, transforms visually and audibly during the one hour practice, and offers two simple buttons, "Commit to a Cascade" and "I Meditated." It collects only visits, time zones, and meditation counts, with no personal identifiers, and it presents the practice as a collective act of solidarity and intention rather than a guaranteed causal intervention.
