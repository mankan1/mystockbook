# The Livermore Protocol — Field Manual

A living, interactive trading book built on Next.js + MDX.
Each post is a chapter. Each chart is a live React component.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Content | MDX (Markdown + React) |
| Charts | TradingView Lightweight Charts, Recharts |
| Styling | CSS variables (Livermore dark gold theme) |
| Data feed | Your Railway `yahoo_data_proxy.py` |
| TOS captures | Railway cron + Puppeteer |
| Deployment | Vercel (blog) + Railway (proxy + cron) |
| Book export | KDP via Pandoc + Puppeteer PDF |

---

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

Set your Railway proxy URL:
```bash
echo "YAHOO_PROXY_URL=https://your-app.railway.app" > .env.local
```

---

## Writing a New Post

1. Create `content/posts/your-slug.mdx`
2. Add frontmatter:

```yaml
---
title: "Your Post Title"
date: "2026-04-01"
category: "chart-analysis"          # see CATEGORIES in lib/mdx.ts
excerpt: "One paragraph summary"
readTime: "8 min"
tier: "free"                         # or "subscriber"
frameworks: ["wyckoff", "gex"]
tags: ["ES futures", "0DTE"]
---
```

3. Import and use chart components:

```mdx
import ESLiveChart from '@/components/charts/ESLiveChart'
import OptionsPayoff from '@/components/charts/OptionsPayoff'
import SellOffClock from '@/components/charts/SellOffClock'
import TOSCapture from '@/components/charts/TOSCapture'
import AnnotatedChart from '@/components/teaching/AnnotatedChart'
import ChartQuiz from '@/components/teaching/ChartQuiz'
```

---

## Component Reference

### `<ESLiveChart />`
Live /ES price chart via your Yahoo Finance proxy.
```mdx
<ESLiveChart
  height={400}
  showVolume={true}
  annotation="Notice the gap fill at VWAP — this is where dealers stepped in."
/>
```

### `<OptionsPayoff />`
Interactive options payoff diagram.
```mdx
<OptionsPayoff
  strategy="bear-call-spread"   # see OptionsPayoff.tsx for all strategies
  shortStrike={5480}
  longStrike={5500}
  spot={5450}
  entry={1.25}
  expiry="0DTE"
  annotation="Short the 5480, long the 5500. Max loss $1,875/contract."
/>
```

### `<SellOffClock />`
The 5–7 session sell-off clock visualization.
```mdx
<SellOffClock
  nextWindow="2026-04-02"
  confidence={87}
  intervalDays={[5, 7]}
  lastSellOff="2026-03-24"
/>
```

### `<TOSCapture />`
Auto-updating ThinkOrSwim screenshot.
```mdx
<TOSCapture
  chartName="es-daily"
  title="/ES Daily — Wyckoff Distribution"
  annotation="The spring printed here on March 15 — the test of the ice was the tell."
/>
```

### `<AnnotatedChart />`
Step-by-step chart breakdown with numbered annotation points.
```mdx
<AnnotatedChart
  title="Sell-Off Day Anatomy"
  description="Clicking each numbered point reveals the teaching note."
  annotations={[
    { id: 1, label: "1", title: "Gap Open", category: "structure", body: "Teaching text..." },
    { id: 2, label: "2", title: "Confirmation", category: "entry", body: "Teaching text..." },
  ]}
/>
```

### `<ChartQuiz />`
Interactive "What would you do here?" quiz.
```mdx
<ChartQuiz
  framework="Wyckoff"
  difficulty="advanced"
  scenario="It is 10:15 ET. Price has tested the low twice..."
  question="What is the correct action?"
  choices={[
    { id: "a", label: "Buy immediately", isCorrect: false, explanation: "Why this is wrong..." },
    { id: "b", label: "Wait for volume confirmation", isCorrect: true, explanation: "Why this is right..." },
  ]}
/>
```

---

## TOS Screenshot Pipeline

Deploy `tos-cron/capture.js` as a Railway worker service.

**Railway env vars required:**
```
TOS_USERNAME=your@email.com
TOS_PASSWORD=yourpassword
OUTPUT_DIR=/app/public/tos-captures   # shared volume with Next.js app
R2_ACCOUNT_ID=...                      # optional: Cloudflare R2
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET=livermore-tos
```

**Railway cron schedule:**
```
*/5 13-21 * * 1-5
```
(Every 5 min, 8 AM–4 PM ET, weekdays)

---

## Converting to KDP

When ready to publish the book:

```bash
# 1. Export all posts as static HTML
npm run build
npx next export

# 2. Generate PDF via Puppeteer (all chart components render as images)
node scripts/export-to-pdf.js

# 3. Convert to DOCX for KDP
pandoc livermore-protocol.pdf -o livermore-protocol.docx \
  --reference-doc=kdp-template.docx

# 4. Upload to KDP
# kdp.amazon.com → Bookshelf → Add new title
```

The book references the live site: "Interactive charts available at [domain]"
This makes the print book evergreen — the framework doesn't expire.

---

## Adding to the Book's Table of Contents

Edit `app/page.tsx` → `BOOK_PARTS` array.
Change chapter `status` from `'draft'` to `'published'` and add the `slug` when ready.

---

## Updating the Dataset

Edit `data/sessions.json` with new session data after each significant pattern event.
The `SellOffClock` and pattern stat components read from this file at build time.

---

## Monetization (Coming Soon)

Wire the same Google OAuth + Stripe pattern from `stockoptions.lol`:
- Free tier: all posts, text only, no live charts
- Subscriber ($29/mo): live charts, dataset updates, quiz explanations
- Stripe webhook updates `data/subscribers.json` (or PostgreSQL on Railway)
- Middleware checks `req.cookies.session` → redirects to `/subscribe` if not authorized

---

*"Waiting is a position until confirmation."*
