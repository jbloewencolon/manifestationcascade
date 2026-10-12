# Archived designs: B (Meridian) and C (Ma)

Retired on 2026-10-12 when the owner committed to A (Tidal Rings). Kept here, unlinked, in case they are wanted again.

- **B Meridian:** dot-matrix world map with the 19:07 line sweeping west, mono type, orange palette at night. Needs `vendor/` (topojson-client + land-110m, ISC licence) and the Instrument Sans and IBM Plex Mono fonts.
- **C Ma:** a brush ring that draws, holds, fades and redraws forever around the theme, serif type. Needs the Newsreader fonts.

The complete working three-design site (tab switcher included) is the commit **`df6ae57`** on branch `claude/compassionate-cray-sgcz8r`:

    git show df6ae57:index.html
    git checkout df6ae57 -- .      # whole site as it was, in a scratch worktree

The `*.legacy.*` files here are the old shell, view, base CSS and A stylesheet from that commit (they take the per-design options that were later removed from `view.js`). This folder is served by GitHub Pages like everything in the repo, but nothing links to it.
