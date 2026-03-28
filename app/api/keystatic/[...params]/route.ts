import { NextRequest, NextResponse } from 'next/server'

// Dynamically load keystatic only when env vars are present
// This prevents build failures when OAuth vars aren't configured yet
async function getHandler() {
  const hasConfig =
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET

  if (!hasConfig && process.env.NODE_ENV === 'production') {
    return null
  }

  const { makeRouteHandler } = await import('@keystatic/next/route-handler')
  const { default: config } = await import('../../../../keystatic.config')
  return makeRouteHandler({ config })
}

export async function GET(req: NextRequest) {
  const handler = await getHandler()
  if (!handler) return NextResponse.json({ error: 'CMS not configured' }, { status: 503 })
  return handler.GET(req)
}

export async function POST(req: NextRequest) {
  const handler = await getHandler()
  if (!handler) return NextResponse.json({ error: 'CMS not configured' }, { status: 503 })
  return handler.POST(req)
}
