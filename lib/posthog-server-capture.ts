import { getPostHogClient } from '@/lib/posthog-server'

/** Fire-and-forget server-side event; no-ops when PostHog is not configured. */
export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) return
  try {
    getPostHogClient().capture({
      distinctId,
      event,
      properties: properties ?? {},
    })
  } catch {
    /* ignore analytics failures */
  }
}
