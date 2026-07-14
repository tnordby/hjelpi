# design-sync notes — Hjelpi

- The DS is repo-local at `packages/ds` (no npm publish). Build with
  `cd packages/ds && node build.mjs && ../../node_modules/.bin/tsc -p tsconfig.json --emitDeclarationOnly`
  BEFORE the converter; the converter entry is `--entry packages/ds/dist/index.js`
  with `--node-modules ./node_modules` (repo root).
- Components render with fallback serif fonts unless wrapped in `.hj-root` —
  `cfg.provider = {"component": "HjRoot"}` handles this for previews, and app
  consumers must wrap their tree in `<HjRoot>` (documented in conventions.md).
- playwright 1.61.0 matches the cached chromium-1228 in ~/Library/Caches/ms-playwright
  (repo has no playwright dep; it's installed in .ds-sync/).

## Known render warns

(none yet)

## Re-sync risks

- The DS package must be rebuilt (buildCmd) before the converter on every
  re-sync — dist/ is gitignored, so a fresh clone has no dist until built.
- Fonts are bundled woff2 (latin subsets) downloaded from Google Fonts —
  Norwegian æøå covered, but extended charsets are not.

## Folded wave learnings (2026-07-14)

- Chip: `.hj-chip--selected` must stay AFTER the tone modifiers in components.css —
  fixed 2026-07-14 (selected+neutral used to lose the cascade). Preview combines
  selected with both tones safely now, but the current authored preview only
  shows selected on accent tone.
- Sparkle has no `style` passthrough — wrap in a positioned div to place it.
- Controlled SearchField previews need an onChange no-op (React warning otherwise).
- Rating rounds to whole stars by design (value text shows decimals, stars round).
- Card `flush`: bring your own text padding; images need display:block+objectFit.
- StepItem: the wrapping <ol> must zero its own margin/padding (browser default
  ol margin adds top space).
- Capture sheets allocate very tall cells per export — whitespace below rows is
  normal, not a collapsed render.
