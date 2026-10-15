# Decisions log

Choices made overnight without asking. Each one is easy to reverse.

## Project layout
- **The app lives in `french/`**, not the repo root. The root `index.html` is an existing
  app ("The Gang Online") and `spending/` is Pocket Ledger; I didn't touch either.
- **No `inspire/` folder exists** in the repo, so the vocabulary comes from the lists in the
  brief, checked against standard A1 / Inspire 1 Unités 1–2 usage.
- **Work is on the branch `french-practice`**, pushed to GitHub so it survives the cloud
  container. No PR was opened and nothing is deployed (no Pages/Netlify).
- **`index.html` is a page fragment** (starts with `<title>`, no `<!doctype>`/`<html>`),
  because that is the shape the claude.ai artifact publisher expects. Browsers open it fine
  directly; the tests wrap it in a doctype before loading it.
- **The tests read the converter out of `index.html`** (`<script id="fr-core">`) instead of
  keeping a separate `numbers.js`, so there is one source of truth.

## The sound-alike guide
- Syllables inside a word are joined with `-`; words are separated by spaces. Words that
  run together in speech (elision, liaison, enchaînement) are joined with `-`, e.g.
  *vous habitez* → `voo-za-bee-TAY`.
- Only the last syllable of a phrase is in capitals. A weak trailing release after a
  consonant cluster stays lower-case and is not counted as the stressed syllable:
  *quatre* → `KAT-ruh`, *livre* → `LEE-vruh`, *Allemagne* → `al-MAN-yuh`.
- Nasal vowels, four spellings:
  - `ahn` = an / en / am / em (*cent* `SAHN`, *France* `FRAHNS`)
  - `an` = in / ain / ein / im (*vingt* `VAN`, *cinq* `SANK`, *bien* `BYAN`) — this keeps the
    brief's own examples (*vingt* = "van", *cinq* = "sank").
  - `on` = on / om (*bonjour* `bon-ZHOOR`, *onze* `ONZ`)
  - `uhn` = un (*un* `UHN`)
  The how-to card says: say it through the nose and don't close on the n.
- Other symbols: `zh` (measure), `ew` (say "ee" with rounded lips: French *u*), `uh`
  (*je*, *deux*), `ay` (*é*, *-er*, *-ez*), `eh` (*è*, *ê*, *ai*), `oo` (*ou*), `wah` (*oi*),
  `ny` (*gn*), `r` = throaty R.
- Numbers follow the brief's context rules exactly (six/dix/huit/vingt/cinq). Two extra
  calls: *cent un* has no liaison (`sahn UHN`), and *quatre* before a consonant is `kat-ruh`
  (as in the brief's 97 example) but alone is `KAT-ruh`.
- Ages use liaison with *ans* (*vingt ans* `van-TAHN`, *neuf ans* `nuh-VAHN`,
  *deux ans* `duh-ZAHN`).
- Names the user types (e.g. *Aiyan*) are left as typed inside the guide; there is no
  reliable respelling for arbitrary names.

## French choices
- Traditional (pre-1990) spelling: hyphens only between tens and units below 100 and no
  hyphens around *cent* / *mille* (*deux cent un*, *vingt et un mille*). *Million* is a noun:
  *deux millions*, *quatre-vingts millions*.
- *Professeur* is given as *un professeur / une professeure* (the inclusive form current in
  French textbooks, as in the brief).
- *Bonne* is respelled `bun`.
- Audio for forms written with (e) (*Enchanté(e)*) uses the masculine spelling, which sounds
  the same; where the feminine sounds different the two forms get separate play buttons.
- Phone numbers: French mobile `06 12 34 56 78` read as five pairs; Singapore numbers are
  read as four pairs (*quatre-vingt-onze, vingt-trois, …*), which is how French speakers
  usually read an 8-digit number.

## App behaviour
- Default number level 0–100, guide ON, slow audio OFF.
- Letters are spoken by passing the capital letter to the French voice; a word is spelled
  as one utterance per letter so voices don't read it as a word.
- Spelling quiz words are unaccented so typing on a phone is fair.
- Next phrase pack is suggested at 70% learned, and every pack can be opened early.
- Claude features live in a "Coach" tab plus "Explain" / "More practice" buttons; all of
  them stay hidden until `claude.use("sample")` resolves to a function, and hide again for
  the visit if the first call is refused.
