'use client'

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, ScatterChart,
  Scatter, ZAxis
} from 'recharts'

// ── Session Type Distribution ─────────────────────────────────────────────────

interface SessionTypeStat {
  type: string
  count: number
  avgRange: number
  color: string
}

export function SessionTypeChart({ data }: { data?: SessionTypeStat[] }) {
  const DEFAULT: SessionTypeStat[] = [
    { type: 'Range',      count: 28, avgRange: 11.8, color: 'var(--blue)'   },
    { type: 'Trend',      count: 22, avgRange: 24.3, color: 'var(--green)'  },
    { type: 'Gap & Go',   count:  6, avgRange: 31.2, color: 'var(--gold)'   },
    { type: 'Reversal',   count:  4, avgRange: 28.7, color: 'var(--purple)' },
  ]
  const chartData = data || DEFAULT

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', margin: '2rem 0' }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>60-Session Dataset</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Session Type Distribution</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
        {/* Count chart */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem 0.5rem 0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Frequency</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
              <XAxis dataKey="type" tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} />
              <YAxis tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}
                formatter={(v: any) => [`${v} sessions`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg range chart */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem 0.5rem 0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Range (pts)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
              <XAxis dataKey="type" tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} />
              <YAxis tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}
                formatter={(v: any) => [`${v} pts`, 'Avg Range']}
              />
              <Bar dataKey="avgRange" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderTop: '1px solid var(--border)' }}>
        {chartData.map(d => (
          <div key={d.type} style={{ background: 'var(--bg-elevated)', padding: '0.75rem 1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: d.color }}>{d.count}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{d.type}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 1 }}>{((d.count / 60) * 100).toFixed(0)}% of sessions</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ORB P&L Scatter ───────────────────────────────────────────────────────────

interface ORBTrade {
  date: string
  range: number
  pnl: number
  direction: 'long' | 'short' | 'none'
  outcome: 'win' | 'loss' | 'skip'
}

export function ORBScatterChart({ trades }: { trades?: ORBTrade[] }) {
  const DEFAULT: ORBTrade[] = [
    { date: '2026-01-06', range: 14.5, pnl: 1.8,  direction: 'long',  outcome: 'win'  },
    { date: '2026-01-07', range: 22.1, pnl: 2.4,  direction: 'short', outcome: 'win'  },
    { date: '2026-01-08', range: 11.2, pnl: -1.0, direction: 'long',  outcome: 'loss' },
    { date: '2026-01-09', range: 19.8, pnl: 3.1,  direction: 'short', outcome: 'win'  },
    { date: '2026-01-13', range: 16.3, pnl: 1.5,  direction: 'long',  outcome: 'win'  },
    { date: '2026-01-14', range: 24.5, pnl: 4.2,  direction: 'short', outcome: 'win'  },
    { date: '2026-01-15', range: 13.7, pnl: 1.2,  direction: 'long',  outcome: 'win'  },
    { date: '2026-01-16', range: 9.8,  pnl: 0,    direction: 'none',  outcome: 'skip' },
    { date: '2026-01-21', range: 28.2, pnl: 5.1,  direction: 'short', outcome: 'win'  },
    { date: '2026-01-22', range: 17.4, pnl: -1.3, direction: 'long',  outcome: 'loss' },
    { date: '2026-01-23', range: 21.0, pnl: 2.9,  direction: 'short', outcome: 'win'  },
    { date: '2026-01-27', range: 12.1, pnl: 0.8,  direction: 'long',  outcome: 'win'  },
  ]
  const data = trades || DEFAULT
  const wins = data.filter(d => d.outcome === 'win')
  const losses = data.filter(d => d.outcome === 'loss')
  const skips = data.filter(d => d.outcome === 'skip')
  const totalPnL = data.reduce((s, d) => s + d.pnl, 0)
  const winRate = wins.length / (wins.length + losses.length)

  const TooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as ORBTrade
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '0.6rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--gold)', marginBottom: 4 }}>{d.date}</div>
        <div style={{ color: 'var(--text-secondary)' }}>Range: <span style={{ color: 'var(--text-primary)' }}>{d.range} pts</span></div>
        <div style={{ color: 'var(--text-secondary)' }}>P&L: <span style={{ color: d.pnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{d.pnl >= 0 ? '+' : ''}{d.pnl}</span></div>
        <div style={{ color: 'var(--text-secondary)' }}>Dir: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{d.direction}</span></div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', margin: '2rem 0' }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>First-Hour Range</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>ORB Setup P&L by Range Size</div>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--green)', fontWeight: 700 }}>{(winRate * 100).toFixed(0)}%</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase' }}>Win Rate</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(1)}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase' }}>Total P&L</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem 0.5rem' }}>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
            <XAxis dataKey="range" name="Range" unit=" pts" tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} label={{ value: 'First-Hour Range (pts)', position: 'insideBottom', offset: -3, fill: '#5a5448', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <YAxis dataKey="pnl" name="P&L" tick={{ fill: '#9a9080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'rgba(201,168,76,0.15)' }} />
            <ZAxis range={[60, 60]} />
            <ReferenceLine y={0} stroke="rgba(201,168,76,0.3)" />
            <Tooltip content={<TooltipContent />} />
            <Scatter name="Wins" data={wins} fill="var(--green)" fillOpacity={0.8} />
            <Scatter name="Losses" data={losses} fill="var(--red)" fillOpacity={0.8} />
            <Scatter name="Skips" data={skips} fill="var(--text-dim)" fillOpacity={0.4} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
        {[
          { color: 'var(--green)', label: `Wins (${wins.length})` },
          { color: 'var(--red)',   label: `Losses (${losses.length})` },
          { color: 'var(--text-dim)', label: `Skipped (${skips.length}) — range too small or no setup` },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-dim)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Weekly Pattern Heatmap ────────────────────────────────────────────────────

export function WeeklyPatternChart() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const metrics = [
    { label: 'Avg Range (pts)', values: [15.2, 18.9, 17.4, 22.1, 16.8] },
    { label: 'Trend Day %',     values: [28, 42, 38, 48, 24] },
    { label: 'Win Rate %',      values: [54, 72, 68, 58, 62] },
    { label: 'Sell-Off Risk',   values: [25, 15, 20, 65, 30] },
  ]
  const colors = ['var(--blue)', 'var(--green)', 'var(--gold)', 'var(--red)']

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', margin: '2rem 0' }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>60-Session Dataset</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Weekly Pattern Analysis</div>
      </div>

      <div style={{ padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 400, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Metric</th>
              {days.map(d => (
                <th key={d} style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>{d.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, mi) => (
              <tr key={metric.label} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{metric.label}</td>
                {metric.values.map((val, di) => {
                  const normalized = (val - Math.min(...metric.values)) / (Math.max(...metric.values) - Math.min(...metric.values))
                  return (
                    <td key={di} style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        background: `rgba(${mi === 3 ? '224,82,82' : '201,168,76'}, ${0.05 + normalized * 0.25})`,
                        color: mi === 3
                          ? normalized > 0.6 ? 'var(--red)' : 'var(--text-secondary)'
                          : normalized > 0.6 ? 'var(--gold-light)' : 'var(--text-secondary)',
                        fontWeight: normalized > 0.6 ? 700 : 400,
                        fontSize: '0.78rem',
                      }}>
                        {val}{metric.label.includes('%') ? '%' : ''}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        ⚠ Sell-Off Risk peaks on <span style={{ color: 'var(--red)' }}>Thursday</span> — aligns with sell-off clock data and end-of-week gamma expiry dynamics.
        Best setup days: <span style={{ color: 'var(--gold)' }}>Tuesday & Wednesday</span>.
      </div>
    </div>
  )
}
