import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface PostMeta {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  readTime: string
  tier: 'free' | 'subscriber'
  frameworks: string[]
  tags: string[]
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data } = matter(raw)
      return { slug, ...data } as PostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string) {
  const file = path.join(postsDir, `${slug}.mdx`)
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return { meta: { slug, ...data } as PostMeta, content }
}

export const CATEGORIES = [
  { id: 'market-structure',  label: 'Market Structure',       icon: '🏗️' },
  { id: 'pattern-analysis',  label: 'Pattern Analysis',       icon: '📊' },
  { id: 'options-mechanics', label: 'Options Mechanics',      icon: '⚙️' },
  { id: 'trade-execution',   label: 'Trade Execution',        icon: '🎯' },
  { id: 'chart-analysis',    label: 'Chart Analysis',         icon: '📈' },
  { id: 'live-analysis',     label: 'Live Market Analysis',   icon: '🔴' },
]
