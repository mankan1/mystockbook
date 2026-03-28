#!/usr/bin/env node
/**
 * KDP Export Script
 * 
 * Renders all published posts to a single PDF suitable for Amazon KDP.
 * Charts are rendered as high-res images via Puppeteer.
 * 
 * Usage:
 *   node scripts/export-to-kdp.js
 *   node scripts/export-to-kdp.js --posts sell-off-clock,gex-dealer-flow
 *   node scripts/export-to-kdp.js --preview   # First 3 posts only
 * 
 * Output: ./export/livermore-protocol.pdf
 * 
 * After export:
 *   pandoc export/livermore-protocol.pdf -o export/livermore-protocol.docx \
 *     --reference-doc=templates/kdp-template.docx
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const BASE_URL = process.env.EXPORT_URL || 'http://localhost:3000'
const OUTPUT_DIR = path.join(process.cwd(), 'export')
const POSTS_DIR = path.join(process.cwd(), 'content/posts')

// KDP 6×9 inch trim size at 300dpi
const KDP_WIDTH_PX = 1800
const KDP_HEIGHT_PX = 2700

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const isPreview = args.includes('--preview')
const specificPosts = args.find(a => a.startsWith('--posts='))?.split('=')?.[1]?.split(',') || null

// ── Get published posts ───────────────────────────────────────────────────────

function getPublishedPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      const { data } = matter(raw)
      return { slug, ...data }
    })
    .filter(post => {
      if (specificPosts) return specificPosts.includes(post.slug)
      return true  // include all; filter by 'published' status if you add it
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, isPreview ? 3 : undefined)
}

// ── Render single post to PDF buffer ─────────────────────────────────────────

async function renderPost(browser, post) {
  console.log(`[render] ${post.title}`)
  const page = await browser.newPage()

  await page.setViewport({
    width: KDP_WIDTH_PX,
    height: KDP_HEIGHT_PX,
    deviceScaleFactor: 2,
  })

  // Add KDP-specific print styles
  await page.addStyleTag({ content: `
    :root {
      --bg-primary: #ffffff !important;
      --bg-secondary: #f8f8f8 !important;
      --bg-card: #f5f5f5 !important;
      --bg-elevated: #eeeeee !important;
      --text-primary: #1a1a1a !important;
      --text-secondary: #444444 !important;
      --text-dim: #888888 !important;
      --border: #dddddd !important;
      --border-bright: #cccccc !important;
      --gold: #8a6f30 !important;
      --gold-light: #6b5520 !important;
      --gold-dim: #a08040 !important;
    }
    body { background: white !important; }
    nav, footer, .no-print { display: none !important; }
    .prose { max-width: 100% !important; }
    @page { margin: 1in; size: 6in 9in; }
  ` })

  const url = `${BASE_URL}/posts/${post.slug}`
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

  // Wait for charts to render
  await page.waitForTimeout(3000)

  const pdf = await page.pdf({
    format: undefined,
    width: '6in',
    height: '9in',
    margin: { top: '0.75in', bottom: '0.75in', left: '0.875in', right: '0.625in' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'Playfair Display', serif; font-size: 8pt; color: #888; width: 100%; text-align: center; padding: 0 0.5in;">
        The Livermore Protocol
      </div>
    `,
    footerTemplate: `
      <div style="font-family: JetBrains Mono, monospace; font-size: 7pt; color: #aaa; width: 100%; padding: 0 0.875in; display: flex; justify-content: space-between;">
        <span>${post.category?.replace('-', ' ').toUpperCase() || ''}</span>
        <span class="pageNumber"></span>
      </div>
    `,
  })

  await page.close()
  return pdf
}

// ── Generate cover page ───────────────────────────────────────────────────────

async function renderCoverPage(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: KDP_WIDTH_PX, height: KDP_HEIGHT_PX, deviceScaleFactor: 2 })

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
        body {
          margin: 0; padding: 0;
          width: 6in; height: 9in;
          background: #0a0a0b;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
        }
        .gold { color: #c9a84c; }
        .dim  { color: #5a5448; }
        .rule { width: 60%; height: 1px; background: #c9a84c; opacity: 0.3; margin: 2rem 0; }
      </style>
    </head>
    <body>
      <div class="dim" style="font-family: JetBrains Mono; font-size: 11pt; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 3rem;">
        A Trader's Field Manual
      </div>
      <div class="rule"></div>
      <h1 class="gold" style="font-size: 52pt; font-weight: 900; text-align: center; line-height: 1.1; margin: 0;">
        The<br/>Livermore<br/>Protocol
      </h1>
      <div class="rule"></div>
      <div style="color: #9a9080; font-family: JetBrains Mono; font-size: 10pt; text-align: center; line-height: 1.8; margin-top: 2rem;">
        Advanced /ES Futures & Options Analysis<br/>
        Wyckoff · GEX · 0DTE · The Sell-Off Clock
      </div>
      <div style="position: absolute; bottom: 1in; color: #5a5448; font-family: JetBrains Mono; font-size: 8pt; letter-spacing: 0.12em;">
        LIVERMORE PROTOCOL PUBLISHING · ${new Date().getFullYear()}
      </div>
    </body>
    </html>
  `, { waitUntil: 'networkidle2' })

  const pdf = await page.pdf({
    width: '6in', height: '9in',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  })

  await page.close()
  return pdf
}

// ── Merge PDFs ────────────────────────────────────────────────────────────────

async function mergePDFs(buffers, outputPath) {
  // Using pdf-lib for merging (install if needed: npm i pdf-lib)
  try {
    const { PDFDocument } = require('pdf-lib')
    const mergedDoc = await PDFDocument.create()

    for (const buffer of buffers) {
      const doc = await PDFDocument.load(buffer)
      const pages = await mergedDoc.copyPages(doc, doc.getPageIndices())
      pages.forEach(p => mergedDoc.addPage(p))
    }

    const mergedBytes = await mergedDoc.save()
    fs.writeFileSync(outputPath, mergedBytes)
    console.log(`[export] ✓ PDF merged → ${outputPath}`)

  } catch (err) {
    // Fallback: write first buffer only if pdf-lib not installed
    console.warn('[export] pdf-lib not installed — writing single post PDF')
    console.warn('         Install with: npm i pdf-lib')
    fs.writeFileSync(outputPath, buffers[0])
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const posts = getPublishedPosts()
  console.log(`[export] Found ${posts.length} posts to export${isPreview ? ' (preview mode)' : ''}`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const pdfBuffers = []

    // Cover
    console.log('[export] Rendering cover page...')
    pdfBuffers.push(await renderCoverPage(browser))

    // Posts
    for (const post of posts) {
      const pdf = await renderPost(browser, post)
      pdfBuffers.push(pdf)
    }

    const outputPath = path.join(OUTPUT_DIR, 'livermore-protocol.pdf')
    await mergePDFs(pdfBuffers, outputPath)

    console.log(`\n[export] ✓ Complete!`)
    console.log(`[export] Output: ${outputPath}`)
    console.log(`[export] Posts: ${posts.length}`)
    console.log(`\nNext steps:`)
    console.log(`  1. Review PDF in Adobe Acrobat or Kindle Previewer`)
    console.log(`  2. Convert to DOCX: pandoc export/livermore-protocol.pdf -o export/livermore-protocol.docx`)
    console.log(`  3. Upload to kdp.amazon.com`)

  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('[export] Fatal error:', err)
  process.exit(1)
})
