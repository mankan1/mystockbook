import { NextResponse } from 'next/server'

// Replace with your Railway deployment URL
const PROXY_URL = process.env.YAHOO_PROXY_URL || 'https://your-railway-app.railway.app'

// Lightweight mock for local dev — replace with real proxy in prod
function generateMockCandles() {
  const now = Math.floor(Date.now() / 1000)
  const base = 5420
  const candles = []

  for (let i = 78; i >= 0; i--) {
    const time = now - i * 300  // 5-min bars
    const open = base + (Math.random() - 0.48) * 8
    const close = open + (Math.random() - 0.48) * 6
    const high = Math.max(open, close) + Math.random() * 4
    const low = Math.min(open, close) - Math.random() * 4
    candles.push({ time, open, high, low, close })
  }

  const last = candles[candles.length - 1]
  const first = candles[0]
  return {
    candles,
    price: last.close,
    change: last.close - first.open,
  }
}

export async function GET() {
  try {
    // Try the real Railway proxy first
    const res = await fetch(`${PROXY_URL}/quote?symbol=ES%3DF`, {
      next: { revalidate: 5 },
      signal: AbortSignal.timeout(3000),
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch {
    // Fall through to mock
  }

  // Dev fallback: mock data
  return NextResponse.json(generateMockCandles())
}
