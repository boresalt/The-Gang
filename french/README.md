# Cahier de français

A phone-first French practice app for **Inspire 1 (A1)**: numbers, time and dates, the
alphabet and sounds, introducing yourself, family and jobs, être and avoir, classroom
language, and weekly phrase packs. Every French
item has a play button and an English sound-alike guide.

## Open it on your phone

**Private claude.ai artifact:** https://claude.ai/artifact/BE5Eb2pLrg64vpgj55fgwN

1. Open the link on your phone (in the Claude app, or Safari/Chrome while signed in to claude.ai).
2. Tap the share/menu button and choose **Add to Home Screen** if you want an app icon.
3. Turn your phone's silent switch off, then tap any speaker button to hear French.

## Version for friends (no Claude account needed)

**https://boresalt.github.io/The-Gang/francais/** (live once this branch is merged into `main`)

The same app as a normal web page, without the Claude features. Each friend's name and
progress are saved in their own phone's browser. To rebuild it after changing the app:
`node french/build-public.js` (writes `francais/index.html`).

No French voice? The app shows how to add one. In short:
- **iPhone:** Settings → Accessibility → Spoken Content → Voices → French (France) → download Amélie or Thomas.
- **Android:** Settings → System → Languages → Text-to-speech → Google engine → Install voice data → French (France).

Your progress is saved in the artifact's private storage for your account, so it follows you
between the Claude app and your phone browser. If that storage isn't available, it's saved in
the browser on that device.

The Claude features (the **Coach** tab, **Explain** buttons, **10 more questions**) ask for
permission the first time you use them and use your claude.ai account. If you say no, they
disappear and everything else keeps working.

## What's inside

| Tab | What you can do |
|-----|-----------------|
| Today | A 10-minute plan (numbers drill → 5 phrases → alphabet quiz), progress, and the guide key |
| Numbers | Drill at 8 levels in 4 modes (listen, read, choose, say) with no repeats and review of missed numbers; telling the time (everyday and 24-hour); dates, months, days and years; phone numbers (France and Singapore); explorer; cheat sheet |
| Sounds | 26 letters (E/I and G/J traps first), accents, letter and spelling quizzes, "Spell my name", sound-rules decoder |
| Moi | Questions in tu and vous with answers built from your profile, introduction builder, speaking drill, nationalities and places, family (mon/ma/mes, family-tree quiz), jobs (m/f forms, talking about work, quiz) |
| Verbs | être and avoir: tables with audio, conjugation drill (see or hear), fill-the-gap sentences |
| Class | Classroom objects colour-coded by gender, teacher instructions, survival phrases, flashcards, un ou une quiz |
| Phrases | Four weekly packs; the next one is suggested at 70% learned and can be opened early |
| Coach | Check my French, chat in simple French, photo help with your activity book (claude.ai only) |

Header toggles: **Guide** (sound-alike guide on/off, remembered) and **Slow** audio. The **?**
button explains how to read the guide.

## Files

- `index.html` — the whole app (inline CSS and JS). It's a page fragment because the claude.ai
  artifact publisher adds the `<html>` skeleton.
- `test/numbers.test.js` — 157 tests for numbers, time, dates and their guides; they read the code
  straight out of `index.html`.
- `test/smoke.js` — opens the app at 360 px in light and dark, visits every tab, checks for
  console errors and sideways scrolling, answers quizzes, checks the guide toggle and that
  progress survives a reload. Saves screenshots.
- `build-public.js` — builds the friends' version into `../francais/`.
- `test/public.js` — rebuilds the friends' version and checks it loads as a normal web page,
  hides Claude, shows no personal defaults, and keeps a friend's name after a reload.
- `test/claude-mock.js` — fakes the claude.ai runtime to test the Claude features, the
  refusal path (features hide) and syncing progress to the artifact database.
- `PLAN.md`, `PROGRESS.md`, `DECISIONS.md` — how it was built and the choices made.

Run the tests:

```sh
node french/test/numbers.test.js
NODE_PATH=$(npm root -g) node french/test/smoke.js
NODE_PATH=$(npm root -g) node french/test/claude-mock.js
NODE_PATH=$(npm root -g) node french/test/public.js
```

To republish after editing, publish `french/index.html` to the same artifact with the
capabilities `sample` (with images), `db` and `user`.
