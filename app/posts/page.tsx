import { getAllPosts } from '@/lib/mdx'

const CATEGORY_LABELS: Record<string, string> = {
  'market-structure':  'Market Structure',
  'pattern-analysis':  'Pattern Analysis',
  'options-mechanics': 'Options Mechanics',
  'trade-execution':   'Trade Execution',
  'chart-analysis':    'Chart Analysis',
  'live-analysis':     'Live Market Analysis',
}

export default function PostsPage() {
  const posts = getAllPosts()

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          All Posts
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
          The Livermore Protocol
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {posts.length} post{posts.length !== 1 ? 's' : ''} published
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            No posts yet — write your first one in the CMS at /keystatic
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {posts.map((post) => (
            <a key={post.slug} href={`/posts/${post.slug}`} style={{ display: 'block', background: 'var(--bg-card)', padding: '1.25rem 1.5rem', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>{post.readTime}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: post.tier === 'free' ? 'var(--green)' : 'var(--gold)', border: `1px solid ${post.tier === 'free' ? 'var(--green)' : 'var(--gold)'}`, padding: '0.1rem 0.4rem', borderRadius: 3, textTransform: 'uppercase' }}>
                      {post.tier === 'free' ? 'Free' : 'Pro'}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <span style={{ color: 'var(--gold-dim)', fontSize: '1rem', flexShrink: 0 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
