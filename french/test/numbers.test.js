// Run: node french/test/numbers.test.js
// Loads the <script id="fr-core"> block from index.html so the tested code is the shipped code.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/<script id="fr-core">([\s\S]*?)<\/script>/);
if (!m) throw new Error("fr-core script block not found in index.html");
const sandbox = { module: { exports: {} } };
vm.runInNewContext(m[1], sandbox);
const FR = sandbox.module.exports;

let pass = 0, fail = 0;
function check(label, actual, expected) {
  try { assert.strictEqual(actual, expected); pass++; }
  catch (e) { fail++; console.log(`FAIL ${label}\n  expected: ${expected}\n  actual:   ${actual}`); }
}

const WORDS = {
  0: "zéro", 1: "un", 16: "seize", 17: "dix-sept", 21: "vingt et un", 22: "vingt-deux", 31: "trente et un",
  60: "soixante", 61: "soixante et un", 70: "soixante-dix", 71: "soixante et onze", 72: "soixante-douze",
  77: "soixante-dix-sept", 79: "soixante-dix-neuf", 80: "quatre-vingts", 81: "quatre-vingt-un", 89: "quatre-vingt-neuf",
  90: "quatre-vingt-dix", 91: "quatre-vingt-onze", 99: "quatre-vingt-dix-neuf", 100: "cent", 101: "cent un",
  180: "cent quatre-vingts", 200: "deux cents", 201: "deux cent un", 280: "deux cent quatre-vingts", 1000: "mille",
  1001: "mille un", 2000: "deux mille", 21000: "vingt et un mille", 80000: "quatre-vingt mille",
  80080: "quatre-vingt mille quatre-vingts", 200000: "deux cent mille", 201000: "deux cent un mille",
  999999: "neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf", 1000000: "un million",
  1500000: "un million cinq cent mille", 2000000: "deux millions", 80000000: "quatre-vingts millions",
  200000000: "deux cents millions",
  // extra coverage
  11: "onze", 18: "dix-huit", 19: "dix-neuf", 20: "vingt", 41: "quarante et un", 51: "cinquante et un", 69: "soixante-neuf",
  78: "soixante-dix-huit", 82: "quatre-vingt-deux", 97: "quatre-vingt-dix-sept", 300: "trois cents", 310: "trois cent dix",
  580: "cinq cent quatre-vingts", 1080: "mille quatre-vingts", 1100: "mille cent", 1200: "mille deux cents",
  2021: "deux mille vingt et un", 71000: "soixante et onze mille", 81000: "quatre-vingt-un mille",
  300000: "trois cent mille", 1000001: "un million un", 2300000: "deux millions trois cent mille",
  999999999: "neuf cent quatre-vingt-dix-neuf millions neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf",
};
for (const [n, w] of Object.entries(WORDS)) check(`toFrench(${n})`, FR.toFrench(+n), w);

const GUIDES = {
  97: "kat-ruh van dee SET", 0: "zay-ROH", 6: "SEES", 600: "see SAHN", 10: "DEES", 10000: "dee MEEL",
  18: "deez WEET", 19: "deez NUHF", 17: "dee SET", 8: "WEET", 800: "wee SAHN", 18000: "deez wee MEEL",
  20: "VAN", 21: "vant ay UHN", 23: "vant TRWAH", 20000: "van MEEL", 80: "kat-ruh VAN", 81: "kat-ruh van UHN",
  4: "KAT-ruh", 5: "SANK", 500: "sank SAHN", 71: "swa-sahnt ay ONZ", 1000000: "uhn mee-LYON", 101: "sahn UHN",
  26000: "vant see MEEL",
};
for (const [n, g] of Object.entries(GUIDES)) check(`numberGuide(${n})`, FR.numberGuide(+n), g);

const AGES = { 1: "uhn-NAHN", 2: "duh-ZAHN", 9: "nuh-VAHN", 20: "van-TAHN", 21: "vant ay uhn-NAHN", 30: "trahn-TAHN", 4: "ka-TRAHN", 18: "deez wee-TAHN", 80: "kat-ruh van-ZAHN" };
for (const [n, g] of Object.entries(AGES)) check(`ageGuide(${n})`, FR.ageGuide(+n), g);
check("agePhrase(1)", FR.agePhrase(1), "un an");
check("agePhrase(30)", FR.agePhrase(30), "trente ans");

check("phoneFrench FR", FR.phoneFrench("0612345678").join(", "), "zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit");
check("phoneGuide FR", FR.phoneGuide("0612345678").join(", "), "zay-roh SEES, DOOZ, trahnt KAT-ruh, san-kahnt SEES, swa-sahnt deez WEET");
check("phoneFrench SG", FR.phoneFrench("91234567").join(", "), "quatre-vingt-onze, vingt-trois, quarante-cinq, soixante-sept");
check("phoneFrench 00", FR.phoneFrench("0800").join(", "), "zéro huit, zéro zéro");
check("formatDigits", FR.formatDigits(1500000), "1 500 000");

let threw = false; try { FR.toFrench(-1); } catch (e) { threw = true; } check("rejects -1", threw, true);
threw = false; try { FR.toFrench(1.5); } catch (e) { threw = true; } check("rejects 1.5", threw, true);

// Every number up to 2000 must convert and produce a guide without leftover unknown words.
const KNOWN = /^(zéro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cents?|mille|millions?|et)$/;
let bad = 0;
for (let n = 0; n <= 2000; n++) {
  const w = FR.toFrench(n);
  if (!w.split(/[\s-]+/).every((x) => KNOWN.test(x))) bad++;
  if (/[a-z]{3,}[A-Z]|undefined/.test(FR.numberGuide(n))) bad++;
}
check("0–2000 sweep", bad, 0);


// Telling the time
const T = (h, m, st) => FR.timeFrench(h, m, st);
const TIMES = [
  [14, 30, "24", "Il est quatorze heures trente.", "ee-leh ka-tor-zuhr TRAHNT"],
  [1, 0, "24", "Il est une heure.", "ee-leh-tew-NUHR"],
  [0, 0, "24", "Il est zéro heure.", "ee-leh zay-roh UHR"],
  [21, 1, "24", "Il est vingt et une heures une.", "ee-leh vant ay ew-nuhr EWN"],
  [9, 5, "24", "Il est neuf heures cinq.", "ee-leh nuh-vuhr SANK"],
  [2, 30, "day", "Il est deux heures et demie du matin.", "ee-leh duh-zuhr ay duh-mee dew ma-TAN"],
  [12, 30, "day", "Il est midi et demi.", "ee-leh mee-dee ay duh-MEE"],
  [11, 45, "day", "Il est midi moins le quart.", "ee-leh mee-dee mwan luh KAR"],
  [14, 45, "day", "Il est trois heures moins le quart de l'après-midi.", "ee-leh trwah-zuhr mwan luh kar duh la-preh mee-DEE"],
  [23, 50, "day", "Il est minuit moins dix.", "ee-leh mee-nwee mwan DEES"],
  [17, 40, "day", "Il est six heures moins vingt du soir.", "ee-leh see-zuhr mwan van dew SWAHR"],
  [13, 0, "day", "Il est une heure de l'après-midi.", "ee-leh-tew-nuhr duh la-preh mee-DEE"],
  [8, 15, "day", "Il est huit heures et quart du matin.", "ee-leh wee-tuhr ay kar dew ma-TAN"],
  [0, 20, "day", "Il est minuit vingt.", "ee-leh mee-nwee VAN"],
  [6, 55, "day", "Il est sept heures moins cinq du matin.", "ee-leh se-tuhr mwan sank dew ma-TAN"],
];
for (const [h, m, st, fr, g] of TIMES) { const r = T(h, m, st); check(`time ${h}:${m} ${st}`, r.fr, fr); check(`time guide ${h}:${m} ${st}`, r.g, g); }

// Dates
const DATES = [
  [[18, 9, 2026], "le dix-huit octobre deux mille vingt-six", "le 18 octobre 2026", "luh deez weet ok-to-bruh duh meel vant SEES"],
  [[1, 0, 2027], "le premier janvier deux mille vingt-sept", "le 1er janvier 2027", "luh pruh-myay zhahn-vyay duh meel vant SET"],
  [[6, 3], "le six avril", "le 6 avril", "luh seez a-VREEL"],
  [[10, 7], "le dix août", "le 10 août", "luh deez OOT"],
  [[21, 4], "le vingt et un mai", "le 21 mai", "luh vant ay uhn MEH"],
  [[3, 11, 1998], "le trois décembre mille neuf cent quatre-vingt-dix-huit", "le 3 décembre 1998", "luh trwah day-sahn-bruh meel nuhf sahn kat-ruh van deez WEET"],
];
for (const [[d, mo, y], fr, text, g] of DATES) { const r = FR.dateFrench(d, mo, y); check(`date ${text} fr`, r.fr, fr); check(`date ${text} text`, r.text, text); check(`date ${text} guide`, r.g, g); }
check("date with weekday", FR.dateFrench(15, 9, null, 4).text, "jeudi 15 octobre");
check("date with weekday guide", FR.dateFrench(15, 9, null, 4).g, "zhuh-dee kanz ok-TO-bruh");

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
