'use client'

import { useState } from 'react'

interface Annotation {
  id: number
  label: string           // short label e.g. "1"
  title: string           // e.g. "Wyckoff Spring"
  body: string            // teaching explanation
  category: 'entry' | 'exit' | 'warning' | 'structure' | 'confirmation'
}

interface AnnotatedChartProps {
  title: string
  description?: string
  chartImageUrl?: string  // TOS capture or static image
  annotations: Annotation[]
  beforeAfter?: {
    beforeUrl: string
    afterUrl: string
    beforeLabel?: string
    afterLabel?: string
  }
}

const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  entry:        { color: 'var(--green)',  icon: '▲' },
  exit:         { color: 'var(--red)',    icon: '▼' },
  warning:      { color: 'var(--gold)',   icon: '⚠' },
  structure:    { color: 'var(--blue)',   icon: '◆' },
  confirmation: { color: 'var(--purple)', icon: '✓' },
}

export default function AnnotatedChart({
  title,
  description,
  chartImageUrl,
  annotations,
  beforeAfter,
}: AnnotatedChartProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null)
  const [view, setView] = useState<'annotated' | 'before' | 'after'>('annotated')

  const active = annotations.find(a => a.id === activeAnnotation)

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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
              Chart Breakdown
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {title}
            </div>
          </div>
          {beforeAfter && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['annotated', 'before', 'after'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: view === v ? 'var(--gold)' : 'var(--bg-card)',
                    color: view === v ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
        {description && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>

      {/* Chart area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px' }}>
        {/* Image */}
        <div style={{ borderRight: '1px solid var(--border)', position: 'relative', minHeight: 320 }}>
          {view === 'annotated' && chartImageUrl ? (
            <img src={chartImageUrl} alt={title} style={{ width: '100%', display: 'block' }} />
          ) : view === 'before' && beforeAfter ? (
            <img src={beforeAfter.beforeUrl} alt="Before" style={{ width: '100%', display: 'block' }} />
          ) : view === 'after' && beforeAfter ? (
            <img src={beforeAfter.afterUrl} alt="After" style={{ width: '100%', display: 'block' }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              background: 'var(--bg-elevated)',
            }}>
              <span style={{ fontSize: '2rem' }}>📷</span>
              <span>TOS capture renders here</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Auto-updated via Railway cron
              </span>
            </div>
          )}

          {/* Annotation number badges overlay (for annotated view) */}
          {view === 'annotated' && annotations.map(ann => (
            <button
              key={ann.id}
              onClick={() => setActiveAnnotation(activeAnnotation === ann.id ? null : ann.id)}
              style={{
                position: 'absolute',
                // Note: in production, set top/left from ann.x, ann.y percentage coords
                top: `${10 + ann.id * 12}%`,
                left: `${15 + ann.id * 10}%`,
                width: 26, height: 26,
                borderRadius: '50%',
                background: CATEGORY_STYLES[ann.category].color,
                border: activeAnnotation === ann.id ? '2px solid white' : '2px solid transparent',
                color: 'white',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'transform 0.15s',
                transform: activeAnnotation === ann.id ? 'scale(1.2)' : 'scale(1)',
                zIndex: 10,
              }}
            >
              {ann.id}
            </button>
          ))}
        </div>

        {/* Annotations panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Annotation list */}
          <div style={{ flex: 1, overflow: 'auto', maxHeight: 380 }}>
            {annotations.map(ann => {
              const style = CATEGORY_STYLES[ann.category]
              const isActive = activeAnnotation === ann.id
              return (
                <button
                  key={ann.id}
                  onClick={() => setActiveAnnotation(isActive ? null : ann.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: style.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.65rem', fontWeight: 700,
                    flexShrink: 0, marginTop: 1,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {ann.id}
                  </span>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                      color: style.color, textTransform: 'uppercase',
                      letterSpacing: '0.06em', marginBottom: 2,
                    }}>
                      {style.icon} {ann.category}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {ann.title}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active annotation detail */}
          {active && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid var(--border-bright)',
              background: 'rgba(201,168,76,0.04)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: CATEGORY_STYLES[active.category].color,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: '0.4rem',
              }}>
                {CATEGORY_STYLES[active.category].icon} Point {active.id}: {active.title}
              </div>
              <p style={{
                margin: 0, fontSize: '0.82rem',
                color: 'var(--text-secondary)', lineHeight: 1.65,
              }}>
                {active.body}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        {Object.entries(CATEGORY_STYLES).map(([cat, s]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: s.color, fontSize: '0.75rem' }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
              {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
