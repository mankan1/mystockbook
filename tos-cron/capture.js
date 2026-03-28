#!/usr/bin/env node
/**
 * TOS Screenshot Cron — Railway Worker
 * 
 * Runs every 5 minutes during market hours (8:30 AM – 4:15 PM ET)
 * Captures configured TOS chart layouts and uploads to R2/S3
 * 
 * Railway cron schedule: *\/5 13-21 * * 1-5
 * (UTC 13:00–21:00 Mon–Fri = ET 8:00 AM–4:00 PM)
 * 
 * Deploy this as a separate Railway service from your Next.js app.
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG = {
  // TOS credentials (set as Railway env vars — never hardcode)
  tosUsername: process.env.TOS_USERNAME,
  tosPassword: process.env.TOS_PASSWORD,

  // Output: local path for dev, R2/S3 URL for prod
  outputDir: process.env.OUTPUT_DIR || './public/tos-captures',

  // R2/S3 config (optional — if set, uploads to cloud)
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKey: process.env.R2_ACCESS_KEY,
  r2SecretKey: process.env.R2_SECRET_KEY,
  r2Bucket: process.env.R2_BUCKET,

  // Charts to capture (add/edit as needed)
  charts: [
    {
      name: 'es-daily',
      description: '/ES Daily with Wyckoff annotations',
      symbol: '/ES',
      timeframe: 'D',
      outputFile: 'es-daily.png',
    },
    {
      name: 'es-5min',
      description: '/ES 5-minute intraday',
      symbol: '/ES',
      timeframe: '5',
      outputFile: 'es-5min.png',
    },
    {
      name: 'es-1hour',
      description: '/ES 1-hour with VWAP and volume profile',
      symbol: '/ES',
      timeframe: '60',
      outputFile: 'es-1hour.png',
    },
  ],
}

// ── Market hours check ────────────────────────────────────────────────────────

function isMarketHours() {
  const now = new Date()
  const etOffset = -5 * 60  // ET UTC offset (non-DST: -5, DST: -4)
  const etNow = new Date(now.getTime() + (now.getTimezoneOffset() + etOffset) * 60000)
  const hours = etNow.getHours()
  const minutes = etNow.getMinutes()
  const day = etNow.getDay()

  // Weekdays only
  if (day === 0 || day === 6) return false
  // 8:30 AM – 4:15 PM ET
  const totalMinutes = hours * 60 + minutes
  return totalMinutes >= 510 && totalMinutes <= 975
}

// ── Screenshot logic ──────────────────────────────────────────────────────────

async function captureChart(browser, chart) {
  console.log(`[capture] Starting: ${chart.name}`)
  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 })

    // Note: TOS web (trade.thinkorswim.com) — you must be logged in
    // This captures the active workspace chart for the configured symbol
    // You may need to navigate to specific workspace URLs once logged in

    const url = `https://trade.thinkorswim.com/trade#charts/${chart.symbol}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Wait for chart to render
    await page.waitForTimeout(3000)

    // Find chart container (selector may need adjustment for TOS UI version)
    const chartSelector = '.chart-page, .charting-container, canvas'
    await page.waitForSelector(chartSelector, { timeout: 10000 })

    const outputPath = path.join(CONFIG.outputDir, chart.outputFile)
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: await page.$eval(chartSelector, el => {
        const rect = el.getBoundingClientRect()
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      }),
    })

    // Save metadata
    const meta = {
      name: chart.name,
      symbol: chart.symbol,
      timeframe: chart.timeframe,
      capturedAt: new Date().toISOString(),
      outputFile: chart.outputFile,
    }
    fs.writeFileSync(
      path.join(CONFIG.outputDir, `${chart.name}-meta.json`),
      JSON.stringify(meta, null, 2)
    )

    console.log(`[capture] ✓ ${chart.name} → ${outputPath}`)
    return { success: true, chart: chart.name, path: outputPath }

  } catch (err) {
    console.error(`[capture] ✗ ${chart.name}: ${err.message}`)
    return { success: false, chart: chart.name, error: err.message }

  } finally {
    await page.close()
  }
}

// ── Upload to R2/S3 (optional) ────────────────────────────────────────────────

async function uploadToR2(filePath, key) {
  if (!CONFIG.r2AccountId) return  // Skip if not configured

  try {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${CONFIG.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CONFIG.r2AccessKey,
        secretAccessKey: CONFIG.r2SecretKey,
      },
    })

    const fileContent = fs.readFileSync(filePath)
    await client.send(new PutObjectCommand({
      Bucket: CONFIG.r2Bucket,
      Key: key,
      Body: fileContent,
      ContentType: 'image/png',
      CacheControl: 'max-age=300',  // 5 min cache
    }))

    console.log(`[r2] Uploaded: ${key}`)
  } catch (err) {
    console.error(`[r2] Upload failed: ${err.message}`)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!isMarketHours()) {
    console.log('[cron] Outside market hours — skipping capture')
    process.exit(0)
  }

  if (!CONFIG.tosUsername || !CONFIG.tosPassword) {
    console.warn('[cron] TOS_USERNAME / TOS_PASSWORD not set — using placeholder images')
    // Write placeholder metadata so the site doesn't break
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
    CONFIG.charts.forEach(chart => {
      const meta = { name: chart.name, capturedAt: null, outputFile: chart.outputFile, placeholder: true }
      fs.writeFileSync(path.join(CONFIG.outputDir, `${chart.name}-meta.json`), JSON.stringify(meta, null, 2))
    })
    process.exit(0)
  }

  fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  try {
    // Login to TOS once
    const loginPage = await browser.newPage()
    await loginPage.goto('https://trade.thinkorswim.com', { waitUntil: 'networkidle2' })
    
    // Fill login form (selectors depend on TOS web version)
    try {
      await loginPage.type('#username0', CONFIG.tosUsername)
      await loginPage.type('#password', CONFIG.tosPassword)
      await loginPage.click('[type="submit"]')
      await loginPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
    } catch {
      console.warn('[login] Could not auto-login — TOS may require manual auth')
    }
    await loginPage.close()

    // Capture each chart
    const results = await Promise.allSettled(
      CONFIG.charts.map(chart => captureChart(browser, chart))
    )

    // Upload to R2 if configured
    if (CONFIG.r2AccountId) {
      for (const chart of CONFIG.charts) {
        const filePath = path.join(CONFIG.outputDir, chart.outputFile)
        if (fs.existsSync(filePath)) {
          await uploadToR2(filePath, `tos-captures/${chart.outputFile}`)
        }
      }
    }

    const successes = results.filter(r => r.status === 'fulfilled' && r.value?.success).length
    console.log(`[cron] Complete: ${successes}/${CONFIG.charts.length} captures successful`)

  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('[cron] Fatal error:', err)
  process.exit(1)
})
