'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'

interface GEXLevel {
  strike: number
  gex: number          // positive = long gamma (dealer), negative = short gamma
  openInterest?: number
  callOI?: number
  putOI?: number
}

interface GEXProfileProps {
  levels?: GEXLevel[]
  spot?: number
  zeroGamma?: number
  callWall?: number
  putWall?: number
  annotation?: string
  title?: string
}

// Default demo data when no levels provided
const DEFAULT_LEVELS: GEXLevel[] = [
  { strike: 5250, gex: -2.1, callOI: 1200, putOI: 8900 },
  { strike: 5275, gex: -1.4, callOI: 1800, putOI: 6200 },
  { strike: 5300, gex: -0.8, callOI: 2400, putOI: 4100 },
  { strike: 5325, gex: 0.4,  callOI: 3100, putOI: 2800 },
  { strike: 5350, gex: 3.2,  callOI: 8900, putOI: 1900 },  // put wall
  { strike: 5375, gex: 2.1,  callOI: 5200, putOI: 1400 },
  { strike: 5400, gex: 0.6,  callOI: 3800, putOI: 1100 },  // ~zero gamma
  { strike: 5420, gex: -0.3, callOI: 2900, putOI: 900  },
  { strike: 5450, gex: -1.8, callOI: 2100, putOI: 600  },
  { strike: 5475, gex: -2.9, callOI: 1600, putOI: 400  },
  { strike: 5500, gex: -4.2, callOI: 9800, putOI: 300  },  // call wall
  { strike: 5525, gex: -2.4, callOI: 3200, putOI: 200  },
  { strike: 5550, gex: -1.1, callOI: 1800, putOI: 150  },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as GEXLevel
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-bright)',
      borderRadius: 8,
      padding: '0.75rem 1rem',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.78rem',
      minWidth: 180,
    }}>
      <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 6, fontSize: '0.85rem' }}>
        Strike {d.strike}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-dim)' }}>GEX</span>
        <span style={{ color: d.gex >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
          {d.gex >= 0 ? '+' : ''}{d.gex.toFixed(1)}B
        </span>
      </div>
      {d.callOI && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: 3 }}>
          <span style={{ color: 'var(--text-dim)' }}>Call OI</span>
          <span style={{ color: 'var(--green)' }}>{d.callOI.toLocaleString()}</span>
        </div>
      )}
      {d.putOI && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Put OI</span>
          <span style={{ color: 'var(--red)' }}>{d.putOI.toLocaleString()}</span>
        </div>
      )}
      <div style={{
        marginTop: 8, paddingTop: 6,
        borderTop: '1px solid var(--border)',
        color: d.gex >= 0 ? 'var(--green)' : 'var(--red)',
        fontSize: '0.68rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {d.gex >= 0 ? '▲ Dealer Long Gamma — Dampens moves' : '▼ Dealer Short Gamma — Amplifies moves'}
      </div>
    </div>
  )
}

export default function GEXProfile({
  levels,
  safeSpot,
  safeZeroGamma,
  safeCallWall,
  safePutWall,
  annotation,
  title,
}: GEXProfileProps) {
  // Coerce all props safely
  const safeSpot = Number(spot) || 5420
  const safeZeroGamma = Number(zeroGamma) || 5400
  const safeCallWall = Number(callWall) || 5500
  const safePutWall = Number(putWall) || 5350
  const safeTitle = title || 'GEX / Dealer Gamma Profile'
  const safeLevels = Array.isArray(levels) && levels.length > 0 ? levels : DEFAULT_LEVELS

  const sortedLevels = useMemo(() =>
    [...safeLevels].sort((a, b) => a.strike - b.strike),
    [safeLevels]
  )

  const absMax = Math.max(...sortedLevels.map(l => Math.abs(l.gex)))

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
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
            Dealer Flow
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {safeTitle}
          </div>
        </div>

        {/* Key levels legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
          {[
            { label: 'Spot', value: safeSpot, color: 'var(--gold)' },
            { label: 'Call Wall', value: safeCallWall, color: 'var(--green)' },
            { label: 'Put Wall', value: safePutWall, color: 'var(--red)' },
            { label: '0-Gamma', value: safeZeroGamma, color: 'var(--blue)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color, fontWeight: 700 }}>{value}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={sortedLevels}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" horizontal={false} />
            <XAxis
              type="number"
              domain={[-absMax * 1.1, absMax * 1.1]}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}B`}
              tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'rgba(201,168,76,0.15)' }}
            />
            <YAxis
              type="category"
              dataKey="strike"
              tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'rgba(201,168,76,0.15)' }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
            <ReferenceLine x={0} stroke="rgba(201,168,76,0.35)" strokeWidth={1.5} />

            {/* Spot price line */}
            <ReferenceLine
              y={safeSpot}
              stroke="var(--gold)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{ value: `SPOT ${safeSpot}`, position: 'right', fill: 'var(--gold)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            />

            {/* Call wall */}
            <ReferenceLine
              y={safeCallWall}
              stroke="var(--green)"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{ value: 'CALL WALL', position: 'right', fill: 'var(--green)', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            />

            {/* Put wall */}
            <ReferenceLine
              y={safePutWall}
              stroke="var(--red)"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{ value: 'PUT WALL', position: 'right', fill: 'var(--red)', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            />

            <Bar dataKey="gex" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {sortedLevels.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.gex >= 0 ? 'rgba(76,175,130,0.8)' : 'rgba(224,82,82,0.8)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation key */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '1px', background: 'var(--border)',
        borderTop: '1px solid var(--border)',
      }}>
        {[
          {
            color: 'var(--green)',
            icon: '▲',
            label: 'Long Gamma Zone (green bars)',
            desc: 'Dealers are long gamma here. They SELL into rallies and BUY dips — price-dampening. Market tends to mean-revert.',
          },
          {
            color: 'var(--red)',
            icon: '▼',
            label: 'Short Gamma Zone (red bars)',
            desc: 'Dealers are short gamma here. They BUY into rallies and SELL dips — price-amplifying. Expect trending, volatile moves.',
          },
        ].map(({ color, icon, label, desc }) => (
          <div key={label} style={{ background: 'var(--bg-card)', padding: '0.875rem 1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {icon} {label}
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {desc}
            </p>
          </div>
        ))}
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
