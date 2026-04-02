import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

/** Auth and profile are enforced by `min-side/layout.tsx`; pages gate seller-only data. */
export default function HjelperDashboardSegmentLayout({ children }: { children: ReactNode }) {
  return children
}
