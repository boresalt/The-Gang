# Plan — French practice app ("Cahier")

A phone-first, single-file practice app for Inspire 1 (A1), Unités 1–2.

## Shape
- `french/index.html` — the whole app: inline CSS + JS, no build step. Written as a page
  fragment (no `<!doctype>/<html>/<head>/<body>`) because the claude.ai artifact publisher
  wraps it in its own skeleton.
- `french/test/numbers.test.js` — Node tests. They pull the `<script id="fr-core">` block
  straight out of `index.html` and run it in a `vm` sandbox, so the converter that ships is
  the converter that is tested (no copy to drift).
- `french/test/smoke.js` — Playwright (pre-installed Chromium) loads the page at 360×780,
  visits every tab in light and dark, fails on console errors, saves screenshots.

## Building blocks (inside index.html)
1. **fr-core** (pure, testable): `toFrench(n)`, `numberGuide(n)`, `ageGuide(n)`,
   `pairsFrench()` for phone numbers, `capLast()`.
2. **Store**: one state object. localStorage cache on every change; artifact `db`
   (`data/users/<id>/…` doc) when `claude.use("db")` resolves, debounced writes. Never blocks
   first render.
3. **Speech**: `speechSynthesis`, fr-FR voice picked on `voiceschanged`, slow toggle (0.7),
   tap-only, "no French voice" help note.
4. **UI kit**: `item(fr, guide, en)` row with play button; guide shown/hidden by one class on
   `<html>`; quiz feedback component (correct French + guide + replay).
5. Sections, in priority order: Numbers → Alphabet & sounds → Se présenter → In class →
   Phrases (packs + Today panel) → Claude features.

## Order of work (commit after each)
1. Docs (this file, DECISIONS, PROGRESS) — commit.
2. Core + Numbers section + tests + smoke test — commit.
3. Alphabet & sounds — commit.
4. Se présenter — commit.
5. In class — commit.
6. Phrases + Today — commit.
7. Claude features + db sync — commit.
8. Final review pass, README, publish artifact (sample, db, user), link in README.
