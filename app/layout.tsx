import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'The Livermore Protocol — A Trader\'s Field Manual',
  description: 'Advanced /ES futures & options analysis. Wyckoff, GEX, 0DTE, and the Sell-Off Clock — built from 60 sessions of proprietary data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(10,10,11,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 2rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--gold)' }}>
              The Livermore Protocol
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-dim)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginTop: 2,
            }}>
              Field Manual
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
            {[
              { href: '/', label: 'Table of Contents' },
              { href: '/posts', label: 'All Posts' },
              { href: '/dashboard', label: 'Live Dashboard' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {label}
              </a>
            ))}
            <a href="/subscribe" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--bg-primary)',
              background: 'var(--gold)',
              padding: '0.35rem 0.875rem',
              borderRadius: 6,
              fontWeight: 700,
              letterSpacing: '0.06em',
              transition: 'background 0.2s',
            }}>
              Subscribe
            </a>
          </div>
        </nav>

        <main style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold-dim)', marginBottom: '0.5rem' }}>
            The Livermore Protocol
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
            For educational purposes only. Not financial advice.<br />
            All pattern statistics derived from proprietary /ES dataset (Jan–Mar 2026, 60 sessions).
          </div>
        </footer>
      </body>
    </html>
  )
}
