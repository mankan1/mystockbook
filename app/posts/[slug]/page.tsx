import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { compileMDX } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic imports with ssr:false prevent server-side crash
// from chart libraries (Recharts, lightweight-charts) that need a browser
const ESLiveChart    = dynamic(() => import('@/components/charts/ESLiveChart'),    { ssr: false })
const OptionsPayoff  = dynamic(() => import('@/components/charts/OptionsPayoff'),  { ssr: false })
const SellOffClock   = dynamic(() => import('@/components/charts/SellOffClock'),   { ssr: false })
const GEXProfile     = dynamic(() => import('@/components/charts/GEXProfile'),     { ssr: false })
const WyckoffPhase   = dynamic(() => import('@/components/charts/WyckoffPhase'),   { ssr: false })
const TOSCapture     = dynamic(() => import('@/components/charts/TOSCapture'),     { ssr: false })
const AnnotatedChart = dynamic(() => import('@/components/teaching/AnnotatedChart'), { ssr: false })
const ChartQuiz      = dynamic(() => import('@/components/teaching/ChartQuiz'),      { ssr: false })
const VideoEmbed     = dynamic(() => import('@/components/teaching/VideoEmbed'),     { ssr: false })

const components = {
  ESLiveChart,
  OptionsPayoff,
  SellOffClock,
  GEXProfile,
  WyckoffPhase,
  TOSCapture,
  AnnotatedChart,
  ChartQuiz,
  VideoEmbed,
} as any

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  let post
  try {
    post = getPostBySlug(params.slug)
  } catch {
    notFound()
  }

  if (!post) notFound()

  const { meta, content } = post

  const { content: mdxContent } = await compileMDX({
    source: content,
    components,
    options: { parseFrontmatter: false },
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {meta.category?.replace(/-/g, ' ')}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>{meta.readTime} read</span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            {new Date(meta.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
            color: meta.tier === 'free' ? 'var(--green)' : 'var(--gold)',
            border: `1px solid ${meta.tier === 'free' ? 'var(--green)' : 'var(--gold)'}`,
            padding: '0.1rem 0.4rem', borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {meta.tier === 'free' ? 'Free' : 'Subscriber'}
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1rem' }}>
          {meta.title}
        </h1>

        {meta.excerpt && (
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: '1.25rem', margin: 0 }}>
            {meta.excerpt}
          </p>
        )}
      </header>

      {meta.frameworks?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginRight: 4 }}>Frameworks:</span>
          {meta.frameworks.map((f: string) => (
            <span key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="prose">{mdxContent}</div>

      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>← Table of Contents</a>
        <a href="/subscribe" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gold)', border: '1px solid var(--border-bright)', padding: '0.5rem 1rem', borderRadius: 6 }}>
          Get live charts & updates →
        </a>
      </div>
    </div>
  )
}
