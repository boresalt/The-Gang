# Progress

| # | Section | Status |
|---|---------|--------|
| 0 | Plan, decisions | done |
| 1 | Numbers (converter, tests, drills, explorer, phone numbers, cheat sheet) | done: 107 unit tests + browser smoke test pass |
| 2 | Alphabet & sounds (letters, accents, quizzes, spell my name, sound rules) | done |
| 3 | Se présenter (Q&A tu/vous, nationalities, places, introduction builder, speaking drill) | done |
| 4 | In class (objects by gender, instructions, survival phrases, flashcards, un ou une quiz) | done |
| 5 | Phrase packs (4 packs, 70% suggestion, open early, flashcards) + Today 10-minute plan | done |
| 6 | Claude inside the app (check my French, chat, more practice, explain, photo help, db sync) | done: tested against a mocked runtime |
| 7 | README + publish | done: published as a private artifact (sample + images, db, user) |
| 8 | Round 2: number variety, time & dates, être/avoir, family & jobs, friends' web version | done: 157 unit tests; smoke, mock and public-build tests pass |

## How it was checked
- `node french/test/numbers.test.js`: 157 passed (numbers, time, dates); first round had 107, 0 failed (all 40 numbers from the brief, plus guides, ages, phone pairs and a 0–2000 sweep).
- `french/test/smoke.js`: every tab and sub-tab at 360 px in light and dark, with no console errors and no sideways scrolling. It answers number, alphabet and un/une quizzes, checks the guide toggle hides every guide, and checks settings and progress survive a reload. Coach is hidden without claude.ai.
- `french/test/claude-mock.js`: with a fake claude.ai runtime, no Claude call happens on load; Explain, 10 more questions, Check my French, Chat and Photo help render. Progress syncs to `data/users/<id>/progress`, newer db progress wins on load, and a `not_granted` refusal hides every Claude feature while the rest keeps working.

## Not verified
- Real audio: the test browser has no voices, so the "no French voice" note shows there. Check sound on your phone.
- Real Claude answers and the consent prompt: these only happen inside claude.ai. The code was tested against a mock that follows the documented API.
