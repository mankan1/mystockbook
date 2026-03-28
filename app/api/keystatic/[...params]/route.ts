// app/keystatic/[...params]/route.ts
// This single file wires Keystatic into your Next.js API.
// The CMS UI lives at /keystatic in your app.

import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../keystatic.config'

export const { POST, GET } = makeRouteHandler({ config })
