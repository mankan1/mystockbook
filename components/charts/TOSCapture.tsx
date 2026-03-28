'use client'

import { useState, useEffect } from 'react'

interface TOSCaptureProps {
  chartName: string      // e.g. "es-daily", "es-5min"
  title?: string
  annotation?: string
}

interface ChartMeta {
  name: string
  symbol: string
  capturedAt: string | null
  outputFile: string
  placeholder?: boolean
}

export default function TOSCapture({ chartName, title, annotation }: TOSCaptureProps) {
  const [meta, setMeta] = useState<ChartMeta | null>(null)
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    fetch(`/tos-captures/${chartName}-meta.json`)
      .then(r => r.json())
      .then((data: ChartMeta) => {
        setMeta(data)
        if (data.capturedAt) {
          const age = Date.now() - new Date(data.capturedAt).getTime()
          setIsStale(age > 10 * 60 * 1000)  // stale if >10 min
        }
      })
      .catch(() => setMeta(null))
  }, [chartName])

  const formatAge = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isStale ? 'rgba(224,82,82,0.3)' : 'var(--border)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
            TOS CAPTURE
          </span>
          {title && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              — {title}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {meta?.capturedAt && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: isStale ? 'var(--red)' : 'var(--text-dim)',
            }}>
              {isStale ? '⚠ stale · ' : '● live · '}
              {formatAge(meta.capturedAt)}
            </span>
          )}
          {meta?.placeholder && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              cron not configured
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      {meta && !meta.placeholder ? (
        <img
          src={`/tos-captures/${meta.outputFile}?t=${meta.capturedAt}`}
          alt={title || chartName}
          style={{ width: '100%', display: 'block' }}
          onError={e => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div style={{
          height: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          background: 'var(--bg-elevated)',
        }}>
          <span style={{ fontSize: '2rem' }}>📊</span>
          <span>TOS chart: {chartName}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            Deploy tos-cron on Railway to enable auto-capture
          </span>
        </div>
      )}

      {annotation && (
        <div style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.04)',
          display: 'flex',
          gap: '0.75rem',
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
