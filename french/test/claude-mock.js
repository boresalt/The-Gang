// Run: NODE_PATH=$(npm root -g) node french/test/claude-mock.js [outDir]
// Fakes the claude.ai runtime (sample, db, user) to exercise the Claude features and db sync.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const outDir = process.argv[2] || path.join(os.tmpdir(), "cahier-shots");
fs.mkdirSync(outDir, { recursive: true });
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
const tmp = path.join(outDir, "page-mock.html");
fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${page}</body></html>`);

const MOCK = (mode) => `
(() => {
  const mode = ${JSON.stringify(mode)};
  window.__calls = []; window.__db = window.__db || {};
  const quiz = { questions: Array.from({ length: 10 }, (_, i) => ({ prompt: "Which is " + (70 + i) + "?", fr: "", guide: "",
    options: [{ text: "soixante-dix", guide: "swa-sahnt DEES" }, { text: "quatre-vingts", guide: "kat-ruh VAN" }, { text: "soixante", guide: "swa-SAHNT" }, { text: "dix-sept", guide: "dee SET" }], answer: 0, explain: "60 + 10." })) };
  async function sample(input, opts) {
    window.__calls.push(typeof input === "string" ? input : JSON.stringify(input));
    if (mode === "denied") throw { code: "not_granted", message: "no" };
    if (opts && opts.onText) opts.onText({ text: "Exercise 1 asks you to…", delta: "x" });
    return { text: "Exercise 1 asks you to match. ✓ all correct.", truncated: false };
  }
  sample.json = async (input) => {
    window.__calls.push(input);
    if (mode === "denied") throw { code: "not_granted", message: "no" };
    if (/multiple-choice/.test(input)) return quiz;
    if (/Explain this French phrase/.test(input)) return { meaning: "Hello!", guide: "bon-ZHOOR", words: [{ fr: "bon", en: "good" }, { fr: "jour", en: "day" }], grammar: ["Used all day."], use: "Any time." };
    if (/Correct it/.test(input)) return { ok: false, corrected: "Je suis singapourienne.", guide: "zhuh swee san-ga-poo-RYEN", english: "I am Singaporean.", mistakes: [{ wrong: "singapourien", right: "singapourienne", why: "Feminine." }], tip: "Bien !" };
    if (/conversation partner/.test(input)) return { reply_fr: "Enchanté, Aiyan ! Tu habites où ?", reply_guide: "ahn-shahn-tay, aiyan. tew a-beet OO", reply_en: "Nice to meet you! Where do you live?", correction: null };
    return {};
  };
  sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 1, maxInputBytes: 2e7, mediaTypes: ["image/jpeg", "image/png"] } });
  const deepFreeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const doc = (p) => ({ get: async () => ({ exists: p in window.__db, data: () => deepFreeze(JSON.parse(JSON.stringify(window.__db[p]))) }), set: async (d) => { window.__db[p] = JSON.parse(JSON.stringify(d)); } });
  const db = { collection: (c) => ({ doc: (id) => doc(c + "/" + id) }), doc };
  const user = { id: async () => "u_test", isOwner: async () => true };
  window.claude = { use: async (name) => { await new Promise((r) => setTimeout(r, 50)); return name === "sample" ? sample : name === "db" ? db : name === "user" ? user : null; } };
})();`;

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  const fail = (m) => problems.push(m);

  // 1. Granted: features appear and work.
  let ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  let p = await ctx.newPage();
  p.on("pageerror", (e) => fail("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) fail("console: " + m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await p.addInitScript(MOCK("granted"));
  await p.goto("file://" + tmp);
  await p.waitForTimeout(600);
  if ((await p.evaluate(() => window.__calls.length)) !== 0) fail("Claude was called on page load");
  if (!(await p.isVisible('[data-tab="coach"]'))) fail("Coach tab hidden although sample is available");
  // Explain on a phrase
  await p.click('[data-tab="phrases"]');
  await p.click('#v-phrases [data-seg="ph-sub"] button[data-val="packs"]');
  await p.click('[data-pack="1"]');
  await p.click("[data-explain]");
  await p.waitForSelector("#ex-out table");
  await p.screenshot({ path: path.join(outDir, "mock-explain.png") });
  await p.click("#sheet [data-close]");
  // More practice from numbers
  await p.click('[data-tab="numbers"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  await p.click('[data-more="numbers"]');
  await p.waitForSelector("#mq-out .opt");
  for (let i = 0; i < 10; i++) {
    await p.click("#mq-out .opt >> nth=0");
    if (!(await p.isVisible("#mq-fb .fb"))) { fail("more practice: no feedback on question " + (i + 1)); break; }
    await p.click("#mq-next");
  }
  if (!/\/ 10/.test(await p.textContent("#mq-out"))) fail("more practice: no final score");
  await p.click("#sheet [data-close]");
  // Coach: check my French, chat, photo
  await p.click('[data-tab="coach"]');
  await p.click("#ck-intro");
  await p.click("#ck-go");
  await p.waitForSelector("#ck-out .item");
  await p.screenshot({ path: path.join(outDir, "mock-check.png"), fullPage: true });
  await p.click('#v-coach [data-seg="co-sub"] button[data-val="chat"]');
  await p.fill("#chat-in", "Je m'appelle Aiyan.");
  await p.click('#chat-form button[type="submit"]');
  await p.waitForFunction(() => document.querySelectorAll("#chat-log .card").length === 2);
  const lastCall = await p.evaluate(() => window.__calls[window.__calls.length - 1]);
  if (!lastCall.includes("Je m'appelle Aiyan.") || !lastCall.includes("Claude: Bonjour")) fail("chat call missing the conversation so far");
  await p.screenshot({ path: path.join(outDir, "mock-chat.png"), fullPage: true });
  if (!(await p.isVisible('#v-coach button[data-val="photo"]'))) fail("photo help hidden although images are supported");
  // db sync: progress written to the per-user document
  await p.click('[data-tab="today"]');
  await p.click("#tog-slow");
  await p.waitForTimeout(1900);
  const saved = await p.evaluate(() => window.__db["data/users/u_test/progress"]);
  if (!saved || !saved.state || saved.state.settings.slow !== true) fail("progress not written to db");
  await ctx.close();

  // 2. db holds newer progress than this browser: it wins on load.
  ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
  p = await ctx.newPage();
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await p.addInitScript(`window.__db = {"data/users/u_test/progress": {state: {updatedAt: ${Date.now() + 1000}, settings: {guide: false, slow: true}, phrases: {learned: {k1_merci: true}, open: 2}, daily: {"${new Date().toISOString().slice(0, 10)}": {num: 30}}, num: {played: {l0_100: 30}, right: {l0_100: 21}, best: {l0_100: 5}}}}};`);
  await p.addInitScript(MOCK("granted"));
  await p.goto("file://" + tmp);
  await p.waitForTimeout(700);
  if (!(await p.evaluate(() => document.documentElement.classList.contains("noguide") && S.phrases.open === 2))) fail("newer db progress not applied on load");
  // Regression: progress loaded from the (read-only) db must stay editable — flashcard buttons and drills keep working.
  p.on("pageerror", (e) => fail("pageerror after db load: " + e.message));
  await p.click('[data-tab="phrases"]');
  await p.click('#v-phrases [data-seg="ph-sub"] button[data-val="cards"]');
  for (let i = 0; i < 3; i++) { await p.click("#pc-flip"); await p.click('#pc-back [data-k="' + (i % 2) + '"]'); }
  if (!(await p.isVisible("#pc-flip"))) fail("flashcards stuck after Knew it / Not yet with db-loaded progress");
  if ((await p.evaluate(() => dailyCount("phr"))) !== 3) fail("flashcard marks not counted with db-loaded progress");
  await p.click('[data-tab="numbers"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  await p.click('[data-seg="num-mode"] button[data-val="read"]');
  for (const d of String(await p.evaluate(() => Numbers.q.n))) await p.click(`#num-pad [data-key="${d}"]`);
  await p.click('#num-pad [data-key="ok"]');
  if (!(await p.isVisible("#num-fb .fb.ok"))) fail("numbers drill broken with db-loaded progress");
  await ctx.close();

  // 3. Denied: first call rejects not_granted → features hide, app keeps working.
  ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
  p = await ctx.newPage();
  p.on("pageerror", (e) => fail("pageerror (denied): " + e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await p.addInitScript(MOCK("denied"));
  await p.goto("file://" + tmp);
  await p.waitForTimeout(600);
  await p.click('[data-tab="coach"]');
  await p.click("#ck-intro");
  await p.click("#ck-go");
  await p.waitForSelector("#ck-out .warn");
  await p.waitForTimeout(2800);
  if (await p.isVisible('[data-tab="coach"]')) fail("Coach tab still visible after not_granted");
  if ((await p.$$(".claude-ui")).length) fail("Claude buttons still present after not_granted");
  await p.click('[data-tab="numbers"]');
  if (!(await p.isVisible("#num-q"))) fail("numbers broken after Claude refusal");
  await ctx.close();

  await browser.close();
  if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
  console.log("claude mock OK");
})().catch((e) => { console.error(e); process.exit(1); });
