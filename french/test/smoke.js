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

// Behaviour checks: answering quizzes, the guide toggle, and progress surviving a reload.
async function functional(p, problems) {
  const fail = (m) => problems.push("functional: " + m);
  await p.click('[data-tab="numbers"]');
  await p.click('#v-numbers [data-seg="num-sub"] button[data-val="drill"]');
  await p.click('[data-seg="num-mode"] button[data-val="read"]');
  const n = await p.evaluate(() => Numbers.q.n);
  await p.fill("#num-in", String(n));
  await p.click('#num-form button[type="submit"]');
  if (!(await p.isVisible("#num-fb .fb.ok"))) fail("numbers read mode: correct answer not marked correct");
  await p.click("#num-next");
  await p.fill("#num-in", "123456789");
  await p.click('#num-form button[type="submit"]');
  if (!(await p.isVisible("#num-fb .fb.bad .fr"))) fail("numbers: wrong answer feedback lacks the French");
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
  if (typeof extraChecks === "function") await extraChecks(p, fail);
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
