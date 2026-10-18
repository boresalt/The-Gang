// Build the friends' version: a normal web page for GitHub Pages, from the same app.
// Run: node french/build-public.js   →   writes francais/index.html (+ icon) at the repo root.
// The claude.ai runtime doesn't exist there, so the Claude features stay hidden and progress
// is saved in each visitor's browser.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "francais");
fs.mkdirSync(outDir, { recursive: true });
const app = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const title = (app.match(/<title>([^<]*)<\/title>/) || [])[1] || "Cahier de français";
const body = app.replace(/<title>[^<]*<\/title>\s*/, "").replace(/<meta name="claude:viewport-fit-sides"[^>]*>\s*/, "");
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2340c8"/><path d="M14 18h36M14 26h36M14 34h36M14 42h36" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><path d="M20 10v44" stroke="#d6455d" stroke-width="3"/><text x="38" y="44" font-family="Georgia,serif" font-style="italic" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">Fr</text></svg>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="French practice for beginners (A1): numbers, time, alphabet, introductions, être and avoir, family, jobs and classroom phrases, with audio and an English sound-alike guide.">
<meta name="theme-color" content="#fbfcff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f1226" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Cahier">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}">
<link rel="apple-touch-icon" href="icon-180.png">
<script>window.CAHIER_PUBLIC = true;</script>
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(outDir, "index.html"), html);
fs.writeFileSync(path.join(outDir, "icon.svg"), icon);
console.log("wrote francais/index.html (" + Math.round(html.length / 1024) + " KB)");
