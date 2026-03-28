import { makeNextRouteHandler } from '@keystatic/next/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // In production, /keystatic is protected by GitHub OAuth automatically.
  // Uncomment below to fully hide the CMS route if needed:
  // if (req.nextUrl.pathname.startsWith('/keystatic') && process.env.NODE_ENV === 'production') {
  //   if (process.env.ALLOW_KEYSTATIC !== 'true') {
  //     return NextResponse.redirect(new URL('/', req.url))
  //   }
  // }
  return NextResponse.next()
}

export const config = {
  matcher: ['/keystatic/:path*'],
}
