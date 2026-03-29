'use client'

import { useState } from 'react'

type Phase = 'accumulation' | 'markup' | 'distribution' | 'markdown'
type Event =
  | 'PS' | 'SC' | 'AR' | 'ST' | 'Spring' | 'Test' | 'SOS' | 'LPS'   // accumulation
  | 'PSY' | 'BC' | 'AR_D' | 'UT' | 'UTAD' | 'SOW' | 'LPSY'           // distribution

interface WyckoffPhaseProps {
  activePhase?: Phase
  highlightEvents?: Event[]
  annotation?: string
  mode?: 'full' | 'accumulation' | 'distribution'
}

const PHASE_COLORS: Record<Phase, string> = {
  accumulation: 'var(--green)',
  markup:       'var(--blue)',
  distribution: 'var(--red)',
  markdown:     'var(--purple)',
}

const EVENT_DESCRIPTIONS: Record<string, string> = {
  PS:    'Preliminary Support — first attempt to arrest the decline. Volume increases but selling still dominates.',
  SC:    'Selling Climax — heavy volume panic selling. The smart money begins absorbing supply here.',
  AR:    'Automatic Rally — short covering and new buying after the climax. Sets the upper boundary of the range.',
  ST:    'Secondary Test — price revisits the SC area on lower volume. Confirms the bottom is holding.',
  Spring:'Spring — false breakdown below range support. Tests supply, traps shorts. The most powerful entry signal.',
  Test:  'Test of Spring — low-volume pullback after the spring. Confirms lack of supply. This is the LPS entry.',
  SOS:   'Sign of Strength — rally on expanding volume, breaking above resistance. Demand is now dominant.',
  LPS:   'Last Point of Support — pullback to former resistance, now support. Final entry before markup.',
  PSY:   'Preliminary Supply — first resistance. Volume expands but price recovers — distribution begins here.',
  BC:    'Buying Climax — euphoric buying absorbed by smart money distribution. Often on highest volume.',
  AR_D:  'Automatic Reaction — sharp decline after BC. Sets the lower boundary of the distribution range.',
  UT:    'Upthrust — false break above range resistance. Tests demand, traps longs. Mirror of the Spring.',
  UTAD:  'Upthrust After Distribution — terminal shakeout of remaining longs above resistance.',
  SOW:   'Sign of Weakness — decline on high volume through support. Confirms distribution is complete.',
  LPSY:  'Last Point of Supply — dead-cat bounce before markdown. Final shorting opportunity.',
}

export default function WyckoffPhase({
  activePhase = 'accumulation',
  highlightEvents,
  annotation,
  mode = 'accumulation',
}: WyckoffPhaseProps) {
  // Coerce — Keystatic may pass undefined or non-array
  const safeHighlightEvents: string[] = Array.isArray(highlightEvents) ? highlightEvents : []
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  const displayEvent = hoveredEvent || (safeHighlightEvents[0] ?? null)

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
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
            Wyckoff Method
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {mode === 'accumulation' ? 'Accumulation Schematic' : 'Distribution Schematic'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['accumulation', 'distribution'] as const).map(p => (
            <span key={p} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              textTransform: 'capitalize', letterSpacing: '0.06em',
              padding: '0.25rem 0.6rem', borderRadius: 4,
              border: `1px solid ${PHASE_COLORS[p]}`,
              color: p === mode ? 'var(--bg-primary)' : PHASE_COLORS[p],
              background: p === mode ? PHASE_COLORS[p] : 'transparent',
            }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px' }}>
        {/* SVG Schematic */}
        <div style={{ borderRight: '1px solid var(--border)', padding: '1rem' }}>
          {mode === 'accumulation' ? (
            <AccumulationSVG
              highlightEvents={safeHighlightEvents}
              hoveredEvent={hoveredEvent}
              onHover={setHoveredEvent}
            />
          ) : (
            <DistributionSVG
              highlightEvents={safeHighlightEvents}
              hoveredEvent={hoveredEvent}
              onHover={setHoveredEvent}
            />
          )}
        </div>

        {/* Event detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {Object.entries(mode === 'accumulation'
              ? { PS: 0, SC: 0, AR: 0, ST: 0, Spring: 0, Test: 0, SOS: 0, LPS: 0 }
              : { PSY: 0, BC: 0, AR_D: 0, UT: 0, UTAD: 0, SOW: 0, LPSY: 0 }
            ).map(([event]) => {
              const isHighlighted = safeHighlightEvents.includes(event as Event)
              const isHovered = hoveredEvent === event
              return (
                <div
                  key={event}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  style={{
                    padding: '0.625rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    background: isHovered ? 'rgba(201,168,76,0.08)' : isHighlighted ? 'rgba(201,168,76,0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isHovered || isHighlighted ? 'var(--gold)' : 'var(--text-secondary)',
                    marginBottom: 2,
                  }}>
                    {event}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
                    {EVENT_DESCRIPTIONS[event]?.split('—')[0]}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Active description */}
          {displayEvent && EVENT_DESCRIPTIONS[displayEvent] && (
            <div style={{
              padding: '0.875rem 1rem',
              borderTop: '1px solid var(--border-bright)',
              background: 'rgba(201,168,76,0.05)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>
                {displayEvent}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {EVENT_DESCRIPTIONS[displayEvent]}
              </p>
            </div>
          )}
        </div>
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

// ── Accumulation SVG ──────────────────────────────────────────────────────────

function AccumulationSVG({ highlightEvents, hoveredEvent, onHover }: {
  highlightEvents: string[]
  hoveredEvent: string | null
  onHover: (e: string | null) => void
}) {
  const safeHL = Array.isArray(highlightEvents) ? highlightEvents : []
  const W = 500, H = 280

  // Schematic price path for accumulation
  const path = `
    M 20,160 L 60,190 L 90,230 L 120,80 L 155,200 L 185,170
    L 215,210 L 245,100 L 270,180 L 300,150 L 330,130 L 360,90 L 400,50 L 480,30
  `

  // Event label positions [x, y, event, anchorX, anchorY]
  const events: [number, number, string, number, number][] = [
    [50,  230, 'PS',     50,  250],
    [90,  230, 'SC',     90,  250],
    [120, 80,  'AR',     120, 60],
    [155, 200, 'ST',     160, 250],
    [245, 100, 'Spring', 245, 60],
    [270, 180, 'Test',   290, 250],
    [330, 130, 'SOS',    350, 100],
    [360, 90,  'LPS',    375, 250],
  ]

  // Phase regions
  const phases = [
    { label: 'Phase A', x1: 20,  x2: 155, color: 'rgba(76,175,130,0.06)'  },
    { label: 'Phase B', x1: 155, x2: 245, color: 'rgba(91,141,238,0.06)'  },
    { label: 'Phase C', x1: 245, x2: 300, color: 'rgba(201,168,76,0.08)'  },
    { label: 'Phase D', x1: 300, x2: 400, color: 'rgba(76,175,130,0.10)'  },
    { label: 'Phase E', x1: 400, x2: 480, color: 'rgba(76,175,130,0.14)'  },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'JetBrains Mono' }}>
      {/* Phase backgrounds */}
      {phases.map(p => (
        <g key={p.label}>
          <rect x={p.x1} y={0} width={p.x2 - p.x1} height={H - 20} fill={p.color} />
          <text x={(p.x1 + p.x2) / 2} y={H - 5} textAnchor="middle" fontSize="8" fill="#5a5448" letterSpacing="0.06em">
            {p.label}
          </text>
          <line x1={p.x2} y1={0} x2={p.x2} y2={H - 20} stroke="rgba(201,168,76,0.08)" strokeDasharray="3 3" />
        </g>
      ))}

      {/* Support/resistance lines */}
      <line x1={20} y1={200} x2={360} y2={200} stroke="rgba(76,175,130,0.3)" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={20} y1={100} x2={360} y2={100} stroke="rgba(224,82,82,0.3)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={365} y={203} fontSize="7" fill="rgba(76,175,130,0.6)">SUPPORT</text>
      <text x={365} y={103} fontSize="7" fill="rgba(224,82,82,0.6)">RESISTANCE</text>

      {/* Price path */}
      <path d={path} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinejoin="round" />

      {/* Event dots and labels */}
      {events.map(([x, y, event, lx, ly]) => {
        const isActive = hoveredEvent === event || safeHL.includes(event)
        return (
          <g
            key={event}
            onMouseEnter={() => onHover(event)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x} cy={y} r={isActive ? 7 : 5}
              fill={isActive ? 'var(--gold)' : 'var(--bg-card)'}
              stroke={isActive ? 'var(--gold-light)' : 'var(--gold)'}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <line x1={x} y1={y} x2={lx} y2={ly} stroke="rgba(201,168,76,0.3)" strokeWidth={0.75} />
            <text x={lx} y={ly + (ly > y ? 10 : -4)} textAnchor="middle" fontSize="9"
              fill={isActive ? 'var(--gold-light)' : '#9a9080'} fontWeight={isActive ? '700' : '400'}>
              {event}
            </text>
          </g>
        )
      })}

      {/* Markup arrow */}
      <line x1={400} y1={50} x2={480} y2={30} stroke="var(--green)" strokeWidth={2} />
      <polygon points="480,30 472,34 474,26" fill="var(--green)" />
      <text x={430} y={25} fontSize="8" fill="var(--green)" letterSpacing="0.06em">MARKUP</text>
    </svg>
  )
}

// ── Distribution SVG ──────────────────────────────────────────────────────────

function DistributionSVG({ highlightEvents, hoveredEvent, onHover }: {
  highlightEvents: string[]
  hoveredEvent: string | null
  onHover: (e: string | null) => void
}) {
  const safeHL = Array.isArray(highlightEvents) ? highlightEvents : []
  const W = 500, H = 280
  const path = `
    M 20,180 L 60,80 L 90,160 L 120,60 L 150,30 L 185,110 
    L 215,80 L 245,20 L 270,130 L 300,160 L 340,200 L 400,230 L 480,260
  `

  const events: [number, number, string, number, number][] = [
    [60,  80,  'PSY',  55,  250],
    [90,  160, 'AR_D', 90,  250],
    [120, 60,  'BC',   120, 40],
    [150, 30,  'UT',   155, 10],
    [245, 20,  'UTAD', 250, 10],
    [270, 130, 'SOW',  280, 250],
    [300, 160, 'LPSY', 310, 250],
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', fontFamily: 'JetBrains Mono' }}>
      {/* Support/resistance */}
      <line x1={20} y1={120} x2={370} y2={120} stroke="rgba(224,82,82,0.3)" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={20} y1={60}  x2={370} y2={60}  stroke="rgba(76,175,130,0.3)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={375} y={123} fontSize="7" fill="rgba(224,82,82,0.6)">SUPPORT</text>
      <text x={375} y={63}  fontSize="7" fill="rgba(76,175,130,0.6)">RESISTANCE</text>

      {/* Price path */}
      <path d={path} fill="none" stroke="var(--red)" strokeWidth={2} strokeLinejoin="round" />

      {/* Markup entry arrow */}
      <line x1={20} y1={200} x2={20} y2={180} stroke="var(--green)" strokeWidth={2} />
      <polygon points="20,180 16,188 24,188" fill="var(--green)" />
      <text x={22} y={210} fontSize="8" fill="var(--green)">PRIOR MARKUP</text>

      {/* Markdown arrow */}
      <line x1={400} y1={230} x2={480} y2={260} stroke="var(--purple)" strokeWidth={2} />
      <polygon points="480,260 472,254 476,262" fill="var(--purple)" />
      <text x={410} y={270} fontSize="8" fill="var(--purple)" letterSpacing="0.06em">MARKDOWN</text>

      {/* Event dots */}
      {events.map(([x, y, event, lx, ly]) => {
        const isActive = hoveredEvent === event || safeHL.includes(event)
        return (
          <g key={event} onMouseEnter={() => onHover(event)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={isActive ? 7 : 5}
              fill={isActive ? 'var(--red)' : 'var(--bg-card)'}
              stroke={isActive ? '#ff9999' : 'var(--red)'}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <line x1={x} y1={y} x2={lx} y2={ly} stroke="rgba(224,82,82,0.3)" strokeWidth={0.75} />
            <text x={lx} y={ly + (ly > y ? 10 : -4)} textAnchor="middle" fontSize="9"
              fill={isActive ? '#ff9999' : '#9a9080'} fontWeight={isActive ? '700' : '400'}>
              {event}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
