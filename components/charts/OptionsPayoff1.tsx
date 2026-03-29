'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts'

type Strategy =
  | 'long-call' | 'long-put'
  | 'short-call' | 'short-put'
  | 'bear-call-spread' | 'bull-put-spread'
  | 'iron-condor' | 'iron-butterfly'
  | 'long-straddle' | 'long-strangle'

interface OptionsPayoffProps {
  strategy: Strategy
  shortStrike?: number
  longStrike?: number
  shortStrike2?: number   // for condor/butterfly upper
  longStrike2?: number    // for condor upper wing
  spot?: number           // current underlying price
  entry: number           // premium paid (debit) or received (credit)
  expiry?: string
  annotation?: string
}

function calcPayoff(strategy: Strategy, price: number, props: OptionsPayoffProps): number {
  // Coerce to numbers — Keystatic CMS passes form values as strings
  const shortStrike = Number(props.shortStrike) || 0
  const longStrike  = Number(props.longStrike)  || 0
  const shortStrike2 = Number(props.shortStrike2) || 0
  const longStrike2  = Number(props.longStrike2)  || 0
  const entry = Number(props.entry) || 0

  switch (strategy) {
    case 'long-call':
      return Math.max(0, price - longStrike) - entry
    case 'long-put':
      return Math.max(0, longStrike - price) - entry
    case 'short-call':
      return entry - Math.max(0, price - shortStrike)
    case 'short-put':
      return entry - Math.max(0, shortStrike - price)
    case 'bear-call-spread': {
      const shortPnL = entry
      const longProtect = -Math.max(0, price - longStrike)
      const shortLoss = -Math.max(0, price - shortStrike)
      return shortPnL + shortLoss + longProtect
    }
    case 'bull-put-spread': {
      return entry - Math.max(0, shortStrike - price) + Math.max(0, longStrike - price)
    }
    case 'iron-condor': {
      // sell put spread + sell call spread
      const putSpread = entry / 2 - Math.max(0, shortStrike - price) + Math.max(0, longStrike - price)
      const callSpread = entry / 2 - Math.max(0, price - shortStrike2) + Math.max(0, price - longStrike2)
      return putSpread + callSpread
    }
    case 'iron-butterfly': {
      const body = shortStrike  // ATM short strike
      const putWing = longStrike
      const callWing = longStrike2 || shortStrike2
      return entry
        - Math.max(0, body - price) + Math.max(0, putWing - price)
        - Math.max(0, price - body) + Math.max(0, price - callWing)
    }
    case 'long-straddle': {
      return Math.max(0, price - shortStrike) + Math.max(0, shortStrike - price) - entry
    }
    case 'long-strangle': {
      return Math.max(0, price - longStrike) + Math.max(0, shortStrike - price) - entry
    }
    default: return 0
  }
}

const STRATEGY_LABELS: Record<Strategy, string> = {
  'long-call': 'Long Call',
  'long-put': 'Long Put',
  'short-call': 'Short Call',
  'short-put': 'Short Put',
  'bear-call-spread': 'Bear Call Spread',
  'bull-put-spread': 'Bull Put Spread',
  'iron-condor': 'Iron Condor',
  'iron-butterfly': 'Iron Butterfly',
  'long-straddle': 'Long Straddle',
  'long-strangle': 'Long Strangle',
}

export default function OptionsPayoff(props: OptionsPayoffProps) {
  const { strategy, spot, entry, annotation, shortStrike, longStrike } = props

  const centerPrice = Number(spot) || Number(props.shortStrike) || Number(props.longStrike) || 5400
  const range = centerPrice * 0.025  // ±2.5%

  const data = useMemo(() => {
    const points = 120
    return Array.from({ length: points }, (_, i) => {
      const price = centerPrice - range + (i / (points - 1)) * range * 2
      const pnl = calcPayoff(strategy, price, props)
      return { price: Math.round(price), pnl: Math.round(pnl * 100) / 100 }
    })
  }, [strategy, centerPrice, range, props])

  const maxPnL = Math.max(...data.map(d => d.pnl))
  const minPnL = Math.min(...data.map(d => d.pnl))
  const maxLoss = minPnL < 0 ? Math.abs(minPnL) : 0
  const maxProfit = maxPnL > 0 ? maxPnL : 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const { price, pnl } = payload[0].payload
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
        borderRadius: 8, padding: '0.6rem 1rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Price: <span style={{ color: 'var(--text-primary)' }}>{price}</span></div>
        <div style={{ color: 'var(--text-secondary)' }}>P&L: <span style={{ color: pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{pnl >= 0 ? '+' : ''}{pnl}</span></div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Options Payoff
          </span>
          <div style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold-light)', marginTop: 2 }}>
            {STRATEGY_LABELS[strategy]}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          {maxProfit > 0 && (
            <div style={{ color: 'var(--green)' }}>Max profit: +{maxProfit.toFixed(2)}</div>
          )}
          {maxLoss > 0 && (
            <div style={{ color: 'var(--red)' }}>Max loss: -{maxLoss.toFixed(2)}</div>
          )}
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: 2 }}>
            {props.expiry || 'At expiry'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1rem 0.5rem' }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf82" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4caf82" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#e05252" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e05252" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
            <XAxis
              dataKey="price"
              tickFormatter={v => v.toString()}
              tick={{ fill: '#9a9080', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'rgba(201,168,76,0.15)' }}
            />
            <YAxis
              tickFormatter={v => v > 0 ? `+${v}` : v.toString()}
              tick={{ fill: '#9a9080', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'rgba(201,168,76,0.15)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(201,168,76,0.4)" strokeWidth={1.5} />
            {spot && (
              <ReferenceLine
                x={spot}
                stroke="rgba(201,168,76,0.6)"
                strokeDasharray="4 4"
                label={{ value: 'SPOT', fill: 'var(--gold)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="var(--gold)"
              strokeWidth={2}
              fill="url(#profitGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--gold)', stroke: 'var(--bg-card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {annotation && (
        <div style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.04)',
          display: 'flex', gap: '0.75rem',
        }}>
          <span style={{ color: 'var(--gold)' }}>📌</span>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {annotation}
          </p>
        </div>
      )}
    </div>
  )
}
