import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // /keystatic is protected by GitHub OAuth automatically in production.
  // Uncomment below to fully hide the route if needed:
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
