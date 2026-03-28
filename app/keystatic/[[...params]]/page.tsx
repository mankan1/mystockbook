// app/keystatic/[[...params]]/page.tsx
// This renders the full Keystatic editor UI at /keystatic.
// Keep this as-is — Keystatic handles everything internally.

import { makeNextRouteHandler } from '@keystatic/next/ui/app'
import config from '../../../keystatic.config'

export default makeNextRouteHandler({ config })
