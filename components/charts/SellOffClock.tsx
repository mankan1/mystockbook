'use client'

import { useMemo } from 'react'

interface SellOffClockProps {
  nextWindow: string       // ISO date string e.g. "2026-04-02"
  confidence: number       // 0-100
  intervalDays?: [number, number]  // default [5, 7]
  lastSellOff?: string     // ISO date of last confirmed sell-off
}

export default function SellOffClock({
  nextWindow,
  confidence,
  intervalDays = [5, 7],
  lastSellOff,
}: SellOffClockProps) {
  const daysUntil = useMemo(() => {
    const now = new Date()
    const target = new Date(nextWindow)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [nextWindow])

  const urgency = daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'high' : 'normal'
  const urgencyColor = urgency === 'critical' ? 'var(--red)' : urgency === 'high' ? 'var(--gold)' : 'var(--green)'

  // Clock segments: 7-day cycle
  const totalDays = intervalDays[1]
  const elapsedDays = lastSellOff
    ? Math.floor((new Date().getTime() - new Date(lastSellOff).getTime()) / (1000 * 60 * 60 * 24))
    : totalDays - daysUntil

  const segments = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1
    const isElapsed = day <= elapsedDays
    const isWindow = day >= intervalDays[0]
    const isCurrent = day === elapsedDays
    return { day, isElapsed, isWindow, isCurrent }
  })

  // Donut arc math
  const cx = 120, cy = 120, r = 90, strokeWidth = 18
  const circumference = 2 * Math.PI * r
  const segmentGap = 0.04
  const segmentAngle = (2 * Math.PI) / totalDays

  function polarToCartesian(angle: number) {
    return {
      x: cx + r * Math.cos(angle - Math.PI / 2),
      y: cy + r * Math.sin(angle - Math.PI / 2),
    }
  }

  function arcPath(index: number) {
    const startAngle = index * segmentAngle + segmentGap
    const endAngle = (index + 1) * segmentAngle - segmentGap
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${urgency === 'critical' ? 'rgba(224,82,82,0.4)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '2rem 0',
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gap: '2rem',
      alignItems: 'center',
    }}>
      {/* SVG Clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <svg viewBox="0 0 240 240" width="220" height="220">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth={strokeWidth} />

          {/* Segments */}
          {segments.map((seg, i) => (
            <path
              key={i}
              d={arcPath(i)}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              stroke={
                seg.isCurrent
                  ? urgencyColor
                  : seg.isElapsed && seg.isWindow
                  ? 'rgba(201,168,76,0.6)'
                  : seg.isElapsed
                  ? 'rgba(201,168,76,0.25)'
                  : seg.isWindow
                  ? 'rgba(224,82,82,0.15)'
                  : 'rgba(201,168,76,0.06)'
              }
            />
          ))}

          {/* Day labels */}
          {segments.map((seg, i) => {
            const angle = (i + 0.5) * segmentAngle - Math.PI / 2
            const labelR = r + strokeWidth + 14
            const x = cx + labelR * Math.cos(angle)
            const y = cy + labelR * Math.sin(angle)
            return (
              <text
                key={i}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fill={seg.isCurrent ? urgencyColor : seg.isElapsed ? '#9a9080' : '#5a5448'}
                fontWeight={seg.isCurrent ? '700' : '400'}
              >
                D{seg.day}
              </text>
            )
          })}

          {/* Center readout */}
          <text x={cx} y={cy - 18} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="#9a9080">
            SESSION
          </text>
          <text
            x={cx} y={cy + 6}
            textAnchor="middle"
            fontSize="34"
            fontFamily="Playfair Display"
            fontWeight="900"
            fill={urgencyColor}
          >
            {elapsedDays > 0 ? `${elapsedDays}` : '?'}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fill="#5a5448">
            OF {totalDays}
          </text>
        </svg>

        {/* Confidence badge */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '0.25rem 0.875rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--gold)',
        }}>
          {confidence}% confidence
        </div>
      </div>

      {/* Stats panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dim)', marginBottom: '0.25rem' }}>
            Next Sell-Off Window
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: urgencyColor }}>
            {formatDate(nextWindow)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {daysUntil <= 0 ? '⚠ IN WINDOW NOW' : `${daysUntil} trading session${daysUntil === 1 ? '' : 's'} away`}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase' }}>Interval</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {intervalDays[0]}–{intervalDays[1]} sessions
            </div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase' }}>Bounce Rate</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)', fontWeight: 600 }}>
              100% (60 sessions)
            </div>
          </div>
        </div>

        {lastSellOff && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Last confirmed: {formatDate(lastSellOff)}
          </div>
        )}

        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          ⚠ <strong style={{ color: 'var(--gold)' }}>Waiting is a position.</strong> The clock does not trigger a trade —
          it raises awareness. Enter only on confirmation.
        </div>
      </div>
    </div>
  )
}
