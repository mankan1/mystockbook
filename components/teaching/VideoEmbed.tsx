'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  url: string                     // YouTube, Loom, or direct mp4
  title?: string
  description?: string
  duration?: string               // e.g. "12:34"
  chapters?: { time: string; label: string }[]
  annotation?: string
}

function getEmbedUrl(url: string): { type: 'youtube' | 'loom' | 'mp4'; embedUrl: string } {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1] || ''
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` }
  }
  if (url.includes('loom.com')) {
    const id = url.match(/\/share\/([a-zA-Z0-9]+)/)?.[1] || ''
    return { type: 'loom', embedUrl: `https://www.loom.com/embed/${id}` }
  }
  return { type: 'mp4', embedUrl: url }
}

export default function VideoEmbed({
  url,
  title,
  description,
  duration,
  chapters = [],
  annotation,
}: VideoEmbedProps) {
  const [activeChapter, setActiveChapter] = useState<number | null>(null)
  const { type, embedUrl } = getEmbedUrl(url)

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>🎬</span>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Video Walkthrough
            </div>
            {title && (
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {title}
              </div>
            )}
          </div>
        </div>
        {duration && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '0.2rem 0.6rem', borderRadius: 4, border: '1px solid var(--border)' }}>
            {duration}
          </span>
        )}
      </div>

      {description && (
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      )}

      {/* Video */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
        {type === 'mp4' ? (
          <video
            src={embedUrl}
            controls
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        ) : (
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Video walkthrough'}
          />
        )}
      </div>

      {/* Chapter markers */}
      {chapters.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '0.5rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)' }}>
            Chapters
          </div>
          {chapters.map((ch, i) => (
            <div
              key={i}
              onClick={() => setActiveChapter(activeChapter === i ? null : i)}
              style={{
                padding: '0.5rem 1.25rem',
                borderBottom: i < chapters.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                cursor: 'pointer',
                background: activeChapter === i ? 'rgba(201,168,76,0.05)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold)', minWidth: 40 }}>
                {ch.time}
              </span>
              <span style={{ fontSize: '0.85rem', color: activeChapter === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {ch.label}
              </span>
            </div>
          ))}
        </div>
      )}

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
