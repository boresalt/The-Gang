// Inlines the built app (../planner) into one HTML fragment for a claude.ai artifact preview.
// Usage: node scripts/build-artifact.mjs <output.html>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../../planner/', import.meta.url).pathname
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const read = (src) => readFileSync(join(dist, src.replace(/^\.\//, '')), 'utf8')

const js = read(html.match(/<script type="module"[^>]*src="([^"]+)"/)[1]).replace(/<\/script/gi, '<\\/script')
const css = read(html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)[1])
const themeScript = html.match(/<script>[\s\S]*?<\/script>/)[0]

const out = `<title>Planner</title>
<meta name="theme-color" content="#7c3aed">
<style>${css}</style>
${themeScript}
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(process.argv[2], out)
console.log('wrote', process.argv[2], Math.round(out.length / 1024) + ' KB')
