import { z } from 'zod'

/** FormData omits missing keys → `get` is `null`, not `undefined` — coerce for Zod. */
export function formDataText(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v : ''
}

export const profileNamesLocationSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().max(60),
    /** Empty when no location select in the form or placeholder chosen */
    locationId: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (typeof v === 'string' ? v.trim() : '')),
  })
  .refine(
    (d) => d.locationId === '' || z.string().uuid().safeParse(d.locationId).success,
    { path: ['locationId'] },
  )

export const profileEmailSchema = z.object({
  email: z.string().min(1).email().max(320),
})

const maxAvatarBytes = 5 * 1024 * 1024
const allowedAvatarMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function validateAvatarFile(file: File): { ok: true } | { ok: false; reason: 'empty' | 'size' | 'type' } {
  if (!file || file.size === 0) return { ok: false, reason: 'empty' }
  if (file.size > maxAvatarBytes) return { ok: false, reason: 'size' }
  if (!allowedAvatarMime.has(file.type)) return { ok: false, reason: 'type' }
  return { ok: true }
}
