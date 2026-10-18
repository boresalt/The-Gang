// Run: NODE_PATH=$(npm root -g) node french/test/public.js
// Rebuilds the friends' version (francais/index.html) and checks it works as a standalone web page.
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

execFileSync("node", [path.join(__dirname, "..", "build-public.js")], { stdio: "inherit" });
const file = "file://" + path.join(__dirname, "..", "..", "francais", "index.html");

(async () => {
  const problems = [], fail = (m) => problems.push(m);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fail("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) fail("console: " + m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await p.goto(file);
  await p.waitForTimeout(500);
  if (await p.evaluate(() => document.compatMode) !== "CSS1Compat") fail("page is in quirks mode (missing doctype)");
  if (!(await p.evaluate(() => PUBLIC))) fail("PUBLIC flag not set");
  if (await p.isVisible('[data-tab="coach"]')) fail("Coach tab visible in the public version");
  if ((await p.textContent("#v-today h2")).trim() !== "Bonjour !") fail("Today greeting should be plain before a name is set");
  // No personal defaults anywhere the friend can see.
  for (const tab of ["today", "numbers", "sounds", "me", "verbs", "class", "phrases"]) {
    await p.click(`[data-tab="${tab}"]`);
    const subs = await p.$$eval(`#v-${tab} [data-seg]:not([data-seg$="-mode"]) button[data-val]`, (bs) => bs.map((x) => [x.closest("[data-seg]").dataset.seg, x.dataset.val]));
    for (const [sg, val] of subs.length ? subs.filter((x) => x[0] === subs[0][0]) : [[null, null]]) {
      if (sg) await p.click(`#v-${tab} [data-seg="${sg}"] button[data-val="${val}"]`);
      const text = await p.evaluate(() => document.body.innerText + [...document.querySelectorAll("input")].map((i) => i.value).join(" "));
      if (/aiyan/i.test(text)) fail(`personal name shown in ${tab}/${val}`);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 375) fail(`${tab}/${val}: horizontal overflow ${sw}px`);
    }
  }
  // A friend sets their name; it sticks after a reload.
  await p.click('[data-tab="me"]');
  await p.click('#v-me [data-seg="me-sub"] button[data-val="builder"]');
  await p.fill("#pf-name", "Mei");
  await p.reload(); await p.waitForTimeout(300);
  await p.click('[data-tab="today"]');
  if ((await p.textContent("#v-today h2")).trim() !== "Bonjour, Mei !") fail("name not kept after reload");
  await b.close();
  if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
  console.log("public build OK");
})().catch((e) => { console.error(e); process.exit(1); });
