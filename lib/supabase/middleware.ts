import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

/**
 * Refreshes the Supabase session before i18n routing runs.
 *
 * When tokens are rotated, `setAll` must:
 * 1. Update `request.cookies` so Server Components in the same request see the new session.
 * 2. Record cookies + cache headers to merge onto the final middleware response.
 *
 * Without (1), `/logg-inn` can see `getUser()` while `/min-side` does not → redirect loop.
 */
export async function prepareSupabaseSession(
  request: NextRequest,
): Promise<(response: NextResponse) => void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return () => {}
  }

  let cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []
  let cacheHeaders: Record<string, string> = {}

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(toSet, headers) {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value)
        }
        cookiesToSet = toSet
        cacheHeaders = headers ?? {}
      },
    },
  })

  await supabase.auth.getUser()

  return (response: NextResponse) => {
    for (const { name, value, options } of cookiesToSet) {
      response.cookies.set(name, value, options)
    }
    for (const [key, value] of Object.entries(cacheHeaders)) {
      response.headers.set(key, value)
    }
  }
}
