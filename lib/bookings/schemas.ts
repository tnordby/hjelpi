import { z } from 'zod'

export const createBookingRequestSchema = z
  .object({
    provider_id: z.string().uuid(),
    provider_service_id: z.string().uuid(),
    scheduled_at: z
      .string()
      .min(1)
      .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'scheduled_invalid' }),
    duration_minutes: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().optional(),
    ),
    buyer_message: z
      .string()
      .max(4000)
      .optional()
      .transform((s) => (s == null ? '' : s.trim())),
    pricing_type: z.enum(['fixed', 'hourly', 'quote']),
  })
  .superRefine((data, ctx) => {
    const d = new Date(data.scheduled_at)
    if (d.getTime() < Date.now() - 60_000) {
      ctx.addIssue({ code: 'custom', message: 'scheduled_past', path: ['scheduled_at'] })
    }
    if (data.pricing_type === 'hourly') {
      const dm = data.duration_minutes
      if (dm == null || !Number.isFinite(dm)) {
        ctx.addIssue({ code: 'custom', message: 'duration_required', path: ['duration_minutes'] })
        return
      }
      if (dm < 30 || dm > 16 * 60 || dm % 30 !== 0) {
        ctx.addIssue({ code: 'custom', message: 'duration_invalid', path: ['duration_minutes'] })
      }
    }
    if (data.pricing_type === 'quote') {
      if (data.buyer_message.length < 10) {
        ctx.addIssue({ code: 'custom', message: 'message_short', path: ['buyer_message'] })
      }
    }
  })
