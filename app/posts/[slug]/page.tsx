import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import ESLiveChart from '@/components/charts/ESLiveChart'
import OptionsPayoff from '@/components/charts/OptionsPayoff'
import SellOffClock from '@/components/charts/SellOffClock'
import AnnotatedChart from '@/components/teaching/AnnotatedChart'
import ChartQuiz from '@/components/teaching/ChartQuiz'
import { notFound } from 'next/navigation'

const components = {
  ESLiveChart,
  OptionsPayoff,
  SellOffClock,
  AnnotatedChart,
  ChartQuiz,
}

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

  const { meta, content } = post

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Post header */}
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--gold)', textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {meta.category.replace('-', ' ')}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            {meta.readTime} read
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            {new Date(meta.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {meta.tier === 'free' ? (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              color: 'var(--green)', border: '1px solid var(--green)',
              padding: '0.1rem 0.4rem', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Free
            </span>
          ) : (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              color: 'var(--gold)', border: '1px solid var(--gold)',
              padding: '0.1rem 0.4rem', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Subscriber
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}>
          {meta.title}
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          fontStyle: 'italic',
          borderLeft: '3px solid var(--gold)',
          paddingLeft: '1.25rem',
          margin: 0,
        }}>
          {meta.excerpt}
        </p>
      </header>

      {/* Framework tags */}
      {meta.frameworks?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginRight: 4 }}>
            Frameworks:
          </span>
          {meta.frameworks.map(f => (
            <span key={f} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              padding: '0.2rem 0.5rem',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {f}
            </span>
          ))}
        </div>
      )}

      {/* MDX content */}
      <div className="prose">
        <MDXRemote source={content} components={components} />
      </div>

      {/* Post footer */}
      <div style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ← Table of Contents
        </a>
        <a href="/subscribe" style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
          color: 'var(--gold)', border: '1px solid var(--border-bright)',
          padding: '0.5rem 1rem', borderRadius: 6,
        }}>
          Get live charts & updates →
        </a>
      </div>
    </div>
  )
}
