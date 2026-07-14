import { TAXONOMY } from '@/lib/categories/taxonomy'
import { SEARCH_SYNONYMS } from '@/lib/search/synonyms'
import { normalizeSearchText, tokensMatch } from '@/lib/search/normalize'

export type ServiceSuggestion = {
  kind: 'subcategory' | 'category'
  /** Display label, e.g. "Flyttevask" */
  title: string
  /** Parent category title for subcategories (shown as context) */
  categoryTitle?: string
  /** Route without location, e.g. /renhold/flyttevask */
  href: string
  categorySlug: string
  subSlug?: string
}

type Entry = ServiceSuggestion & { haystack: string }

let entries: Entry[] | null = null

function buildEntries(): Entry[] {
  if (entries) return entries
  const out: Entry[] = []
  for (const c of TAXONOMY) {
    out.push({
      kind: 'category',
      title: c.title,
      href: `/${c.slug}`,
      categorySlug: c.slug,
      haystack: normalizeSearchText(c.title),
    })
    for (const s of c.subs) {
      out.push({
        kind: 'subcategory',
        title: s.title,
        categoryTitle: c.title,
        href: `/${c.slug}/${s.slug}`,
        categorySlug: c.slug,
        subSlug: s.slug,
        haystack: normalizeSearchText(`${s.title} ${c.title}`),
      })
    }
  }
  entries = out
  return out
}

function synonymTargets(query: string): Set<string> {
  const q = normalizeSearchText(query)
  const targets = new Set<string>()
  for (const [term, slugs] of Object.entries(SEARCH_SYNONYMS)) {
    if (term.startsWith(q) || q.startsWith(term)) {
      for (const s of slugs) targets.add(s)
    }
  }
  return targets
}

/** Rank service suggestions for a query: synonyms first, then title prefix, then token matches. */
export function searchServices(query: string, limit = 8): ServiceSuggestion[] {
  const q = normalizeSearchText(query)
  if (q.length < 2) return []
  const all = buildEntries()
  const syn = synonymTargets(q)

  const scored: { e: Entry; score: number }[] = []
  for (const e of all) {
    const key = e.subSlug ? `${e.categorySlug}/${e.subSlug}` : e.categorySlug
    let score = -1
    if (syn.has(key)) score = 100
    else if (e.haystack.startsWith(q)) score = 80
    else if (e.haystack.split(' ').some((t) => t.startsWith(q))) score = 60
    else if (tokensMatch(q, e.haystack)) score = 40
    if (score < 0) continue
    // categories edge out their own subs at equal score; shorter titles first
    scored.push({ e, score: score + (e.kind === 'category' ? 5 : 0) - e.title.length / 100 })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ e }) => {
    const { haystack: _, ...rest } = e
    return rest
  })
}
