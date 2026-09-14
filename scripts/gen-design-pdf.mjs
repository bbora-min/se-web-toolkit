// docs/DESIGN.md → docs/DESIGN.pdf (marked + 템플릿 앱의 Playwright chromium). pnpm gen:design-pdf
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { marked } from 'marked'
const require = createRequire(resolve('templates/app-vite-react/package.json'))
const { chromium } = require('@playwright/test')

const md = readFileSync('docs/DESIGN.md', 'utf8')
const css = `
  body{font-family:"Noto Sans KR",sans-serif;font-size:11pt;line-height:1.6;color:#1f1f1f;max-width:840px;margin:0 auto;padding:24px}
  h1{font-size:24pt;margin:0 0 8px}h2{font-size:16pt;margin:28px 0 8px;padding-top:12px;border-top:1px solid #e5e5e5}h3{font-size:12.5pt;margin:18px 0 6px}
  code,pre{font-family:"IBM Plex Mono","Noto Sans KR",monospace;font-size:9.5pt}pre{background:#f6f6f6;padding:10px 12px;border-radius:6px;white-space:pre-wrap}
  code:not(pre code){background:#f2f2f2;padding:1px 4px;border-radius:3px}
  table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:8px 0}th,td{border:1px solid #ddd;padding:5px 8px;vertical-align:top;text-align:left}th{background:#f6f6f6}
  blockquote{border-left:3px solid #c9c9c9;margin:8px 0;padding:2px 12px;color:#444}hr{border:0;border-top:1px solid #e5e5e5;margin:20px 0}
  h2,h3,table,pre{break-inside:avoid}`
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>${css}</style></head><body>${marked.parse(md)}</body></html>`
writeFileSync('docs/.design.html', html)
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.goto('file://' + resolve('docs/.design.html'), { waitUntil: 'networkidle' })
const footer = '<div style="width:100%;text-align:center;font-size:8px;color:#888;font-family:sans-serif">SE Web Toolkit — <span class="pageNumber"></span>/<span class="totalPages"></span></div>'
await page.pdf({ path: 'docs/DESIGN.pdf', format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' }, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer })
await browser.close()
console.log('✓ docs/DESIGN.pdf')
