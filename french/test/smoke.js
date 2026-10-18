// Run: NODE_PATH=$(npm root -g) node french/test/smoke.js [outDir]
// Loads index.html at phone size in Chromium, visits every tab and sub-tab in light and dark,
// fails on console errors or horizontal overflow, and saves screenshots.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const outDir = process.argv[2] || path.join(os.tmpdir(), "cahier-shots");
fs.mkdirSync(outDir, { recursive: true });
// The artifact host wraps the fragment in a skeleton; do the same here.
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
const wrapped = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${page}</body></html>`;
const tmp = path.join(outDir, "page.html");
fs.writeFileSync(tmp, wrapped);

// Tap digits on the on-screen keypad, then Check.
async function typeKeys(p, prefix, digits) {
  for (const d of digits) await p.click(`#${prefix}-pad [data-key="${d}"]`);
  await p.click(`#${prefix}-pad [data-key="ok"]`);
}

// Behaviour checks: answering quizzes, the guide toggle, and progress surviving a reload.
async function functional(p, problems) {
  const fail = (m) => problems.push("functional: " + m);
  await p.click('[data-tab="numbers"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  await p.click('[data-seg="num-mode"] button[data-val="read"]');
  const n = await p.evaluate(() => Numbers.q.n);
  await typeKeys(p, "num", String(n));
  if (!(await p.isVisible("#num-fb .fb.ok"))) fail("numbers read mode: correct answer not marked correct");
  await p.click("#num-next");
  await typeKeys(p, "num", "123456789");
  if (!(await p.isHidden("#num-pad"))) fail("numbers: keypad still showing after answering");
  if (!(await p.isVisible("#num-fb .fb.bad .fr"))) fail("numbers: wrong answer feedback lacks the French");
  // The Next button sits where the keypad was, and the keypad and Check are on screen without scrolling.
  await p.click("#num-next");
  const okBox = await p.$eval('#num-pad [data-key="ok"]', (el) => el.getBoundingClientRect().bottom);
  if (okBox > 780 - 62 - 8) fail(`numbers: Check key is below the fold (${Math.round(okBox)}px)`);
  // Hardware keyboard: digits + Enter.
  const k = await p.evaluate(() => Numbers.q.n);
  await p.keyboard.type(String(k)); await p.keyboard.press("Enter");
  if (!(await p.isVisible("#num-fb .fb.ok"))) fail("numbers: hardware keyboard answer not accepted");
  // Phone numbers with the keypad.
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="phone"]');
  await typeKeys(p, "ph", await p.evaluate(() => Phone.q.d));
  if (!(await p.isVisible("#ph-fb .fb.ok"))) fail("phone: correct number not accepted");
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  await p.click('[data-seg="num-mode"] button[data-val="choose"]');
  const c = await p.evaluate(() => Numbers.q.n);
  await p.click(`#num-opts .opt[data-n="${c}"]`);
  if (!(await p.isVisible("#num-fb .fb.ok"))) fail("numbers choose: correct option not marked correct");
  const optCount = await p.$$eval("#num-opts .opt", (o) => o.length);
  if (optCount !== 4) fail("numbers choose: expected 4 options, got " + optCount);
  // Guide toggle hides every guide, and the setting survives a reload.
  await p.click("#tog-guide");
  const shown = await p.$$eval(".guide", (g) => g.filter((x) => getComputedStyle(x).display !== "none").length);
  if (shown) fail(`guide toggle left ${shown} guides visible`);
  const score = await p.evaluate(() => S.num.played[S.num.level]);
  await p.reload();
  await p.waitForTimeout(300);
  if (!(await p.evaluate(() => document.documentElement.classList.contains("noguide")))) fail("guide setting lost on reload");
  if ((await p.evaluate(() => S.num.played[S.num.level])) !== score) fail("number progress lost on reload");
  // Phrase pack: tick a phrase, it survives reload, Today reflects it.
  await p.click('[data-tab="phrases"]');
  await p.click('#v-phrases [data-seg="ph-sub"] button[data-val="packs"]');
  await p.click('[data-pack="1"]');
  await p.check("[data-learn]");
  await p.reload();
  await p.waitForTimeout(300);
  if ((await p.evaluate(() => Object.keys(S.phrases.learned).length)) !== 1) fail("phrase learned flag lost on reload");
  await p.click('[data-tab="today"]');
  await p.click("#td-phr");
  if (!(await p.isVisible("#pc-card"))) fail("Today → 5 phrases did not open flashcards");
  await p.click("#pc-flip");
  await p.click('#pc-back [data-k="1"]');
  // Introduction builder: choosing feminine changes the nationality ending.
  await p.click('[data-tab="me"]');
  await p.click('#v-me [data-seg="me-sub"] button[data-val="builder"]');
  await p.click('[data-g="f"]');
  if (!(await p.textContent("#pf-out")).includes("singapourienne.")) fail("feminine form not applied in introduction");
  // Un ou une: answering shows feedback with the article.
  await p.click('[data-tab="class"]');
  await p.click('#v-class [data-seg="cl-sub"] button[data-val="unune"]');
  await p.click('#uu-q [data-a="un"]');
  if (!(await p.isVisible("#uu-fb .fb .fr"))) fail("un/une feedback missing");
  await p.click("#uu-next");
  await p.click('#uu-q [data-a="une"]');
  const fbs = await p.$$eval("#uu-fb .fb", (x) => x.length);
  if (fbs !== 1) fail("un/une: expected one feedback block, got " + fbs);

  // Numbers: the 0–20 level deals all 21 numbers before any repeat.
  await p.click('[data-tab="numbers"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  const seen = await p.evaluate(() => { S.num.level = "l0_20"; S.num.missed = {}; Numbers.bags = {}; const out = []; for (let i = 0; i < 21; i++) { Numbers.next(false); out.push(Numbers.q.n); } S.num.level = "l0_100"; return out; });
  if (new Set(seen).size !== 21) fail("numbers 0–20 repeated before using all numbers: " + seen.join(","));
  // A missed number comes back for review.
  const back = await p.evaluate(() => { S.num.missed = { l0_100: [77] }; Numbers.sinceReview = 5; let hit = false; for (let i = 0; i < 40 && !hit; i++) { Numbers.sinceReview = 5; Numbers.next(false); hit = Numbers.q.n === 77 && Numbers.q.review; } return hit; });
  if (!back) fail("missed number never came back for review");
  // Each new multiple-choice quiz: answer correctly, see feedback, go next.
  const mcqCheck = async (label, prefix) => {
    await p.click(`#${prefix}-opts .opt[data-ok]`);
    if (!(await p.isVisible(`#${prefix}-fb .fb.ok`))) fail(label + ": correct answer not marked correct");
    await p.click(`#${prefix}-next`);
    if (!(await p.isVisible(`#${prefix}-opts .opt`))) fail(label + ": no next question");
  };
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="time"]');
  await mcqCheck("time read", "tm");
  await p.click('[data-seg="tm-mode"] button[data-val="listen"]');
  const tq = await p.evaluate(() => TimeView.q);
  await typeKeys(p, "tm", String(tq.h) + String(tq.m).padStart(2, "0"));
  if (!(await p.isVisible("#tm-fb .fb.ok"))) fail("time listen: correct time not accepted");
  await p.click('[data-seg="tm-mode"] button[data-val="read"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="dates"]');
  await mcqCheck("dates read", "dt");
  await p.click('[data-seg="dt-mode"] button[data-val="listen"]');
  await mcqCheck("dates listen", "dt");
  await p.click('[data-seg="dt-mode"] button[data-val="year"]');
  await typeKeys(p, "dt", String(await p.evaluate(() => DatesView.q.y)));
  if (!(await p.isVisible("#dt-fb .fb.ok"))) fail("year: correct year not accepted");
  await p.click('[data-seg="dt-mode"] button[data-val="read"]');
  await p.click('[data-tab="verbs"]');
  for (const sub of ["drill", "gap"]) {
    await p.click(`#v-verbs [data-seg="vb-sub"] button[data-val="${sub}"]`);
    await mcqCheck("verbs " + sub, "vb");
  }
  await p.click('#v-verbs [data-seg="vb-sub"] button[data-val="drill"]');
  await p.click('[data-seg="vb-mode"] button[data-val="listen"]');
  await mcqCheck("verbs listen", "vb");
  await p.click('[data-tab="me"]');
  await p.click('#v-me [data-seg="me-sub"] button[data-val="family"]');
  for (const sub of ["poss", "tree"]) { await p.click(`[data-seg="fam-sub"] button[data-val="${sub}"]`); await mcqCheck("family " + sub, "fam"); }
  await p.click('#v-me [data-seg="me-sub"] button[data-val="jobs"]');
  await p.click('[data-seg="job-sub"] button[data-val="quiz"]');
  await mcqCheck("jobs quiz", "job");
  const verbStats = await p.evaluate(() => S.quiz.verbs && S.quiz.verbs.right);
  if (verbStats !== 3) fail("verb quiz results not recorded: " + verbStats);
  // Alphabet quiz: picking the right letter is marked correct.
  await p.click('[data-tab="sounds"]');
  await p.click('#v-sounds [data-seg="snd-sub"] button[data-val="quiz"]');
  const L = await p.evaluate(() => AlphaQuiz.q.L);
  await p.click(`#aq-opts .opt[data-l="${L}"]`);
  if (!(await p.isVisible("#aq-fb .fb.ok"))) fail("alphabet quiz: correct letter not marked correct");
}

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, colorScheme: scheme, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|fonts\.g/.test(m.text())) problems.push(`[${scheme}] console: ${m.text()}`); });
    p.on("pageerror", (e) => problems.push(`[${scheme}] pageerror: ${e.message}`));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await p.goto("file://" + tmp);
    await p.waitForTimeout(300);
    const coachVisible = await p.isVisible('[data-tab="coach"]');
    if (coachVisible) problems.push(`[${scheme}] Coach tab is visible without claude.ai`);
    const tabs = await p.$$eval(".tabs button", (bs) => bs.filter((b) => b.offsetParent !== null).map((b) => b.dataset.tab));
    for (const tab of tabs) {
      await p.click(`[data-tab="${tab}"]`);
      await p.waitForTimeout(150);
      const subs = await p.$$eval(`#v-${tab} [data-seg]:not([data-seg$="-mode"]) button[data-val]`, (bs) => bs.map((b) => [b.closest("[data-seg]").dataset.seg, b.dataset.val]));
      const firstSeg = subs.length ? subs[0][0] : null;
      const list = subs.filter((s) => s[0] === firstSeg);
      if (!list.length) list.push([null, null]);
      for (const [segName, val] of list) {
        if (segName) { await p.click(`#v-${tab} [data-seg="${segName}"] button[data-val="${val}"]`); await p.waitForTimeout(120); }
        const sw = await p.evaluate(() => document.documentElement.scrollWidth);
        if (sw > 360) problems.push(`[${scheme}] ${tab}/${val}: horizontal overflow ${sw}px`);
        await p.screenshot({ path: path.join(outDir, `${scheme}-${tab}${val ? "-" + val : ""}.png`), fullPage: true });
      }
    }
    if (scheme === "light") await functional(p, problems);
    await ctx.close();
  }
  await browser.close();
  if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
  console.log("smoke OK — screenshots in " + outDir);
})().catch((e) => { console.error(e); process.exit(1); });
