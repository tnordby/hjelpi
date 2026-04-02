import { z } from 'zod'
import type { ServiceFaqItem } from '@/lib/provider-services/types'

const pricingTypeSchema = z.enum(['fixed', 'hourly', 'quote'])

const faqItemSchema = z.object({
  q: z.string().trim().min(1).max(200),
  a: z.string().trim().min(1).max(2000),
})

function parsePriceKr(raw: unknown): number | null {
  if (raw == null) return null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const s = String(raw).trim().replace(/\s/g, '').replace(',', '.')
  if (s === '') return null
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : null
}

export function parseSearchTagsFromForm(formData: FormData): string[] {
  const raw = formData.getAll('search_tag')
  const out: string[] = []
  for (const v of raw) {
    if (typeof v !== 'string') continue
    const t = v.trim().slice(0, 50)
    if (t.length > 0) out.push(t)
  }
  return [...new Set(out)].slice(0, 5)
}

export function parseFaqJsonFromForm(formData: FormData): unknown {
  const raw = formData.get('faq_json')
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return []
  }
}

export const upsertProviderServiceSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z
      .string()
      .trim()
      .min(5, 'title_short')
      .max(100, 'title_long')
      .refine((t) => !/[&/+"]/.test(t), { message: 'title_chars' }),
    description: z
      .string()
      .optional()
      .transform((s) => (s == null ? '' : s.trim()))
      .pipe(z.string().max(1200, 'description_long').min(20, 'description_short')),
    subcategory_id: z.string().uuid('subcategory_invalid'),
    pricing_type: pricingTypeSchema,
    price_kr: z.union([z.string(), z.number()]).optional(),
    is_active: z.boolean().default(true),
    search_tags: z.array(z.string().trim().min(1).max(50)).max(5),
    delivery_days: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : v),
      z.coerce.number().int().min(1).max(365).nullable(),
    ),
    revisions_included: z.coerce.number().int().min(0).max(20),
    faq: z.preprocess(
      (raw) => (Array.isArray(raw) ? raw : []),
      z.array(faqItemSchema).max(10),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.pricing_type !== 'quote') {
      const kr = parsePriceKr(data.price_kr)
      if (kr == null || kr <= 0) {
        ctx.addIssue({ code: 'custom', message: 'price_invalid', path: ['price_kr'] })
      }
    }
    if (data.pricing_type !== 'quote' && data.delivery_days == null) {
      ctx.addIssue({ code: 'custom', message: 'delivery_required', path: ['delivery_days'] })
    }
  })

export type UpsertProviderServiceInput = z.infer<typeof upsertProviderServiceSchema>

export function serviceBasePriceOreFromInput(
  pricingType: UpsertProviderServiceInput['pricing_type'],
  priceKrRaw: unknown,
): number | null {
  if (pricingType === 'quote') return null
  const kr = parsePriceKr(priceKrRaw)
  if (kr == null || kr <= 0) return null
  return Math.round(kr * 100)
}

export function normalizeFaqFromUnknown(raw: unknown): ServiceFaqItem[] {
  const parsed = z.array(faqItemSchema).max(10).safeParse(raw)
  return parsed.success ? parsed.data : []
}
