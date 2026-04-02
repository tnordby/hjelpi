import { z } from 'zod'

export const completeSellerProfileSchema = z.object({
  bio: z
    .string()
    .max(2000)
    .optional()
    .transform((s) => (s == null ? '' : s.trim())),
  service_radius_km: z.coerce.number().int().min(5).max(200).default(20),
  location_id: z.string().uuid().optional(),
})
