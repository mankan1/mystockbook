'use client'

import { useEffect, useState, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'https://stkbt-production-6bad.up.railway.app'
const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK || ''
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

type Status = 'loading' | 'signed-out' | 'signed-in' | 'pro'

export default function SubscribePage() {
  const [status, setStatus] = useState<Status>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPro = useCallback(async (em: string, tok?: string) => {
    try {
      const url = new URL(`${API}/api/check-pro`)
      url.searchParams.set('email', em)
      const headers: Record<string, string> = {}
      if (tok) headers['Authorization'] = `Bearer ${tok}`
      const res = await fetch(url.toString(), { headers })
      const data = await res.json()
      return data.pro === true
    } catch { return false }
  }, [])

  const handleGoogleSignIn = useCallback(async (response: any) => {
    setError(null)
    try {
      console.log('Sending credential to backend, length:', response?.credential?.length)
      if (!response?.credential) {
        throw new Error('No credential received from Google')
      }
      const res = await fetch(`${API}/api/verify-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      const text = await res.text()
      console.log('Backend response:', res.status, text)
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${text}`)
      }
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error('Invalid JSON response') }
      if (data.token && data.email) {
        localStorage.setItem('lp_session', data.token)
        localStorage.setItem('lp_email', data.email)
        setSessionToken(data.token)
        setEmail(data.email)
        // Use is_pro from response directly — no extra round trip needed
        setStatus(data.is_pro ? 'pro' : 'signed-in')
      }
    } catch (e: any) {
      setError(e.message || 'Sign in failed — please try again')
      setStatus('signed-out')
    }
  }, [checkPro])

  useEffect(() => {
    // Check existing session first
    const saved = localStorage.getItem('lp_session')
    const savedEmail = localStorage.getItem('lp_email')
    if (saved && savedEmail) {
      setEmail(savedEmail)
      setSessionToken(saved)
      checkPro(savedEmail, saved).then(isPro => {
        setStatus(isPro ? 'pro' : 'signed-in')
      })
      return
    }

    // Load Google Sign In
    if (!GOOGLE_CLIENT_ID) {
      setStatus('signed-out')
      return
    }

    // Expose callback globally for Google's script
    ;(window as any).handleGoogleSignIn = handleGoogleSignIn

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      const g = (window as any).google
      if (!g) return
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          console.log('Google callback fired, credential length:', response?.credential?.length)
          handleGoogleSignIn(response)
        },
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
        itp_support: true,
      })
      g.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'filled_black', size: 'large', width: 300, text: 'continue_with', shape: 'rectangular' }
      )
    }
    document.head.appendChild(script)
    setStatus('signed-out')

    return () => {
      delete (window as any).handleGoogleSignIn
    }
  }, [checkPro, handleGoogleSignIn])

  function handleSubscribe() {
    if (!email || !STRIPE_LINK) return
    window.open(`${STRIPE_LINK}?prefilled_email=${encodeURIComponent(email)}`, '_blank')
    setPolling(true)
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const isPro = await checkPro(email, sessionToken || undefined)
      if (isPro) {
        clearInterval(interval)
        setPolling(false)
        setStatus('pro')
      }
      if (attempts > 40) {
        clearInterval(interval)
        setPolling(false)
      }
    }, 3000)
  }

  function handleSignOut() {
    localStorage.removeItem('lp_session')
    localStorage.removeItem('lp_email')
    setStatus('signed-out')
    setEmail(null)
    setSessionToken(null)
    // Re-render Google button
    setTimeout(() => {
      const g = (window as any).google
      if (g) {
        g.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'filled_black', size: 'large', width: 300, text: 'continue_with' }
        )
      }
    }, 100)
  }

  const features = [
    'All posts & chapters — no paywalls',
    'Live /ES candlestick charts in every post',
    'Interactive options payoff diagrams',
    'Sell-off clock & GEX level updates',
    'Wyckoff & 0DTE framework deep dives',
    'Weekly market analysis posts',
  ]

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Subscribe
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 2.75rem)', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.2 }}>
        The Livermore Protocol
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
        Full access to all posts, live /ES charts, and dataset updates.
      </p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(201,168,76,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>$29</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>per month · cancel anytime</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', textAlign: 'left' }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)' }}>
            ⚠ {error}
          </div>
        )}

        {status === 'loading' && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', padding: '1rem' }}>
            Checking session...
          </div>
        )}

        {status === 'signed-out' && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              Sign in with Google to subscribe
            </div>
            <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
            {!GOOGLE_CLIENT_ID && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginTop: '0.5rem' }}>
                NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured
              </div>
            )}
          </div>
        )}

        {status === 'signed-in' && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              Signed in as <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={polling || !STRIPE_LINK}
              style={{
                display: 'block', width: '100%',
                background: polling ? 'var(--bg-elevated)' : 'var(--gold)',
                color: polling ? 'var(--text-dim)' : 'var(--bg-primary)',
                padding: '0.875rem', borderRadius: 8, border: 'none',
                fontFamily: 'var(--font-mono)', fontWeight: 700,
                fontSize: '0.9rem', letterSpacing: '0.06em',
                cursor: polling ? 'default' : 'pointer',
              }}
            >
              {polling ? '⏳ Confirming payment...' : '⚡ SUBSCRIBE — $29/mo'}
            </button>
            <button onClick={handleSignOut} style={{ marginTop: '0.75rem', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        )}

        {status === 'pro' && (
          <div style={{ background: 'rgba(76,175,130,0.08)', border: '1px solid var(--green)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--green)', fontWeight: 700, marginBottom: '0.25rem' }}>
              You're subscribed!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Full access active for {email}
            </div>
            <a href="/posts" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>
              Read all posts →
            </a>
            <br />
            <button onClick={handleSignOut} style={{ marginTop: '0.75rem', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
        For educational purposes only. Not financial advice.
      </p>
    </div>
  )
}
