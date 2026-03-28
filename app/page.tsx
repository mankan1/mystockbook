import tocData from '@/data/table-of-contents.json'
import siteData from '@/data/site-settings.json'

const STATUS_COLORS: Record<string, string> = {
  published:     '#4caf82',
  'in-progress': '#c9a84c',
  draft:         '#5a5448',
}

export default function HomePage() {
  const parts = tocData.parts
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
      {/* Hero */}
      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <div style={{ fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--gold-dim)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:'1rem' }}>
          {siteData.tagline}
        </div>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(2.5rem,6vw,4rem)',fontWeight:900,background:'linear-gradient(135deg,var(--gold-light) 0%,var(--gold) 50%,var(--gold-dim) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.15,marginBottom:'1.5rem' }}>
          The Livermore<br/>Protocol
        </h1>
        <p style={{ fontFamily:'var(--font-body)',fontSize:'1.05rem',color:'var(--text-secondary)',maxWidth:580,margin:'0 auto 2rem',lineHeight:1.75 }}>
          {siteData.description}
        </p>
        <div style={{ display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap' }}>
          <a href="/posts/sell-off-clock" style={{ background:'var(--gold)',color:'var(--bg-primary)',padding:'0.75rem 1.5rem',borderRadius:8,fontFamily:'var(--font-mono)',fontSize:'0.82rem',fontWeight:700,letterSpacing:'0.06em' }}>
            START READING →
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:'4rem' }}>
        {[
          {value:'60',   label:'Live Sessions Analyzed'},
          {value:'100%', label:'Sell-Off Low Bounce Rate'},
          {value:'5–7',  label:'Session Sell-Off Clock'},
          {value:'0DTE', label:'Options Focus'},
        ].map(({value,label}) => (
          <div key={label} style={{ background:'var(--bg-card)',padding:'1.25rem',textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)',fontSize:'1.75rem',fontWeight:900,color:'var(--gold)',lineHeight:1 }}>{value}</div>
            <div style={{ fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'var(--text-dim)',marginTop:'0.4rem',textTransform:'uppercase',letterSpacing:'0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* TOC */}
      <h2 style={{ fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--gold-dim)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:'2rem' }}>
        Table of Contents
      </h2>
      <div style={{ display:'flex',flexDirection:'column',gap:'2rem' }}>
        {parts.map((part) => (
          <div key={part.part} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem',borderBottom:'1px solid var(--border)',background:'var(--bg-elevated)',display:'flex',alignItems:'flex-start',gap:'1.25rem' }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:900,color:'var(--gold)',lineHeight:1,opacity:0.4,minWidth:40 }}>{part.part}</div>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem',fontWeight:700,color:'var(--text-primary)',marginBottom:'0.3rem' }}>{part.title}</h2>
                <p style={{ margin:0,fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.5 }}>{part.description}</p>
              </div>
            </div>
            {part.chapters.map((ch, i) => (
              <div key={i} style={{ padding:'0.875rem 1.5rem',borderBottom:i<part.chapters.length-1?'1px solid var(--border)':'none',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'0.875rem' }}>
                  <span style={{ fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-dim)',minWidth:28 }}>{String(i+1).padStart(2,'0')}</span>
                  {ch.status==='published'&&ch.slug
                    ? <a href={`/posts/${ch.slug}`} style={{ fontSize:'0.95rem',color:'var(--text-primary)',fontWeight:500 }}>{ch.title}</a>
                    : <span style={{ fontSize:'0.95rem',color:'var(--text-dim)' }}>{ch.title}</span>
                  }
                </div>
                <span style={{ fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:STATUS_COLORS[ch.status]||'var(--text-dim)',textTransform:'uppercase',letterSpacing:'0.08em',border:`1px solid ${STATUS_COLORS[ch.status]||'var(--border)'}`,padding:'0.15rem 0.5rem',borderRadius:4,opacity:ch.status==='draft'?0.5:1 }}>
                  {ch.status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ marginTop:'4rem',textAlign:'center',fontFamily:'var(--font-mono)',fontSize:'0.7rem',color:'var(--text-dim)',lineHeight:1.8 }}>
        {siteData.disclaimer}
      </p>
    </div>
  )
}
