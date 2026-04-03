'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Link } from '@/i18n/routing'
import type { ProviderServiceSellerRow } from '@/lib/provider-services/data'
import { formatServicePriceLong } from '@/lib/provider-services/display'
import type { PricingType, TaxonomySubcategoryOption } from '@/lib/provider-services/types'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { hjBtnGhost, hjBtnMuted, hjBtnPrimary } from '@/lib/button-classes'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'
const labelClass = 'mb-1.5 block text-sm font-medium text-on-surface'

export type SellerServiceDraft = {
  id?: string
  title: string
  description: string
  subcategory_id: string
  pricing_type: PricingType
  price_kr: string
  is_active: boolean
  searchTags: string[]
  deliveryDays: string
  revisionsIncluded: string
  faq: { q: string; a: string }[]
}

export function draftFromSellerServiceRow(
  s: ProviderServiceSellerRow,
  fallbackSubId: string,
): SellerServiceDraft {
  const kr =
    s.basePriceOre != null ? (s.basePriceOre / 100).toFixed(s.basePriceOre % 100 === 0 ? 0 : 2) : ''
  return {
    id: s.id,
    title: s.title,
    description: s.description ?? '',
    subcategory_id: s.subcategoryId ?? fallbackSubId,
    pricing_type: s.pricingType,
    price_kr: kr,
    is_active: s.isActive,
    searchTags: [...s.searchTags],
    deliveryDays: s.deliveryDays != null ? String(s.deliveryDays) : '',
    revisionsIncluded: String(s.revisionsIncluded ?? 1),
    faq: s.faq.length ? s.faq.map((x) => ({ q: x.q, a: x.a })) : [],
  }
}

export function emptySellerServiceDraft(taxonomy: TaxonomySubcategoryOption[]): SellerServiceDraft {
  const first = taxonomy[0]
  return {
    title: '',
    description: '',
    subcategory_id: first?.id ?? '',
    pricing_type: first?.defaultPricingType ?? 'fixed',
    price_kr: '',
    is_active: true,
    searchTags: [],
    deliveryDays: '',
    revisionsIncluded: '1',
    faq: [],
  }
}

export function buildSellerServiceFormData(draft: SellerServiceDraft): FormData {
  const fd = new FormData()
  if (draft.id) fd.set('id', draft.id)
  fd.set('title', draft.title.trim())
  fd.set('description', draft.description)
  fd.set('subcategory_id', draft.subcategory_id)
  fd.set('pricing_type', draft.pricing_type)
  fd.set('price_kr', draft.pricing_type === 'quote' ? '' : draft.price_kr)
  fd.set('is_active', draft.is_active ? 'true' : 'false')
  for (const tag of draft.searchTags) {
    const t = tag.trim().slice(0, 50)
    if (t.length > 0) fd.append('search_tag', t)
  }
  const faqClean = draft.faq
    .map((x) => ({ q: x.q.trim(), a: x.a.trim() }))
    .filter((x) => x.q.length > 0 && x.a.length > 0)
  fd.set('faq_json', JSON.stringify(faqClean))
  fd.set('delivery_days', draft.pricing_type === 'quote' ? '' : draft.deliveryDays.trim())
  fd.set('revisions_included', (draft.revisionsIncluded.trim() || '1').slice(0, 10))
  return fd
}

type Props = {
  mode: 'add' | 'edit'
  providerId: string
  taxonomy: TaxonomySubcategoryOption[]
  taxonomyById: Map<string, TaxonomySubcategoryOption>
  draft: SellerServiceDraft
  setDraft: React.Dispatch<React.SetStateAction<SellerServiceDraft>>
  formError?: string
  saving: boolean
  onCancel: () => void
  onSave: (fd: FormData) => Promise<void>
}

export function SellerServiceWizard({
  mode,
  providerId,
  taxonomy,
  taxonomyById,
  draft,
  setDraft,
  formError,
  saving,
  onCancel,
  onSave,
}: Props) {
  const t = useTranslations('dashboard.sellerServices')
  const w = useTranslations('dashboard.sellerServices.wizard')
  const [step, setStep] = useState(0)
  const [tagInput, setTagInput] = useState('')
  const [stepHint, setStepHint] = useState<string | undefined>()

  const subLabel = useMemo(() => {
    const row = taxonomyById.get(draft.subcategory_id)
    if (!row) return ''
    return row.categoryName ? `${row.categoryName} — ${row.name}` : row.name
  }, [draft.subcategory_id, taxonomyById])

  function applySubcategoryDefaults(subcategoryId: string) {
    const row = taxonomyById.get(subcategoryId)
    setDraft((d) => ({
      ...d,
      subcategory_id: subcategoryId,
      pricing_type: row?.defaultPricingType ?? d.pricing_type,
    }))
  }

  function addTag() {
    const next = tagInput.trim().slice(0, 50)
    if (!next) return
    if (draft.searchTags.length >= 5) return
    if (draft.searchTags.includes(next)) {
      setTagInput('')
      return
    }
    setDraft((d) => ({ ...d, searchTags: [...d.searchTags, next] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setDraft((d) => ({ ...d, searchTags: d.searchTags.filter((x) => x !== tag) }))
  }

  function addFaqRow() {
    if (draft.faq.length >= 10) return
    setDraft((d) => ({ ...d, faq: [...d.faq, { q: '', a: '' }] }))
  }

  function updateFaq(i: number, field: 'q' | 'a', value: string) {
    setDraft((d) => {
      const faq = [...d.faq]
      const row = faq[i]
      if (!row) return d
      faq[i] = { ...row, [field]: value }
      return { ...d, faq }
    })
  }

  function removeFaqRow(i: number) {
    setDraft((d) => ({ ...d, faq: d.faq.filter((_, idx) => idx !== i) }))
  }

  function validateStep(i: number): boolean {
    setStepHint(undefined)
    if (i === 0) {
      if (draft.title.trim().length < 5) {
        setStepHint(w('hintTitle'))
        return false
      }
      if (!draft.subcategory_id) {
        setStepHint(w('hintSubcategory'))
        return false
      }
    }
    if (i === 1) {
      if (draft.pricing_type !== 'quote') {
        const raw = draft.price_kr.trim().replace(/\s/g, '').replace(',', '.')
        const n = Number.parseFloat(raw)
        if (!Number.isFinite(n) || n <= 0) {
          setStepHint(w('hintPrice'))
          return false
        }
        const d = Number.parseInt(draft.deliveryDays.trim(), 10)
        if (!Number.isFinite(d) || d < 1 || d > 365) {
          setStepHint(w('hintDelivery'))
          return false
        }
      }
      const rev = Number.parseInt(draft.revisionsIncluded.trim(), 10)
      if (!Number.isFinite(rev) || rev < 0 || rev > 20) {
        setStepHint(w('hintRevisions'))
        return false
      }
    }
    if (i === 2) {
      if (draft.description.trim().length < 20) {
        setStepHint(w('hintDescription'))
        return false
      }
      for (const row of draft.faq) {
        const q = row.q.trim()
        const a = row.a.trim()
        if ((q.length > 0 && a.length === 0) || (q.length === 0 && a.length > 0)) {
          setStepHint(w('hintFaqPair'))
          return false
        }
      }
    }
    return true
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, 3))
  }

  function goBack() {
    setStepHint(undefined)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handlePublish() {
    for (let i = 0; i < 3; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }
    const fd = buildSellerServiceFormData(draft)
    await onSave(fd)
  }

  const pricePreviewOre =
    draft.pricing_type === 'quote'
      ? null
      : (() => {
          const raw = draft.price_kr.trim().replace(/\s/g, '').replace(',', '.')
          const n = Number.parseFloat(raw)
          return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
        })()
  const priceLine = formatServicePriceLong(pricePreviewOre, draft.pricing_type)

  const stepTitles = [w('step1Title'), w('step2Title'), w('step3Title'), w('step4Title')]

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            {mode === 'add' ? t('formTitleAdd') : t('formTitleEdit')}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">{w('subtitle')}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-primary hover:underline">
          {t('cancel')}
        </button>
      </div>

      <ol className="mb-8 flex flex-wrap gap-2 border-b border-outline-variant/20 pb-6">
        {stepTitles.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i === step
                  ? 'bg-primary text-on-primary'
                  : i < step
                    ? 'bg-primary/15 text-primary'
                    : 'bg-on-surface-variant/10 text-on-surface-variant'
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:inline ${i === step ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {label}
            </span>
            {i < 3 ? <span className="hidden text-on-surface-variant/40 sm:inline">/</span> : null}
          </li>
        ))}
      </ol>

      {formError ? (
        <p className="mb-4 rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
          {formError}
        </p>
      ) : null}
      {stepHint ? (
        <p className="mb-4 rounded-xl border border-tertiary/25 bg-tertiary/10 px-4 py-3 text-sm text-on-surface" role="status">
          {stepHint}
        </p>
      ) : null}

      {step === 0 ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="wiz-title" className={labelClass}>
              {w('fieldGigTitle')}
            </label>
            <input
              id="wiz-title"
              maxLength={100}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className={inputClass}
              placeholder={w('fieldGigTitlePlaceholder')}
            />
            <p className="mt-1.5 text-xs text-on-surface-variant">{w('fieldGigTitleHint')}</p>
          </div>

          <div>
            <label htmlFor="wiz-sub" className={labelClass}>
              {t('fieldSubcategory')}
            </label>
            <select
              id="wiz-sub"
              value={draft.subcategory_id}
              onChange={(e) => applySubcategoryDefaults(e.target.value)}
              className={inputClass}
            >
              {taxonomy.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.categoryName ? `${row.categoryName} — ${row.name}` : row.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-on-surface-variant">{w('fieldSubcategoryHint')}</p>
            <Link
              href="/tjenester"
              className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {w('browseCategoriesLink')}
            </Link>
          </div>

          <div>
            <span className={labelClass}>{w('fieldTags')}</span>
            <p className="mb-2 text-xs text-on-surface-variant">{w('fieldTagsHint')}</p>
            <div className="flex flex-wrap gap-2">
              {draft.searchTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 hover:bg-primary/20"
                    aria-label={w('removeTag')}
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                </span>
              ))}
            </div>
            {draft.searchTags.length < 5 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={tagInput}
                  maxLength={50}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className={`${inputClass} min-w-[12rem] flex-1`}
                  placeholder={w('fieldTagsPlaceholder')}
                />
                <button type="button" onClick={addTag} className={hjBtnGhost}>
                  {w('addTag')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <span className={labelClass}>{t('fieldPricingType')}</span>
            <div className="flex flex-wrap gap-4">
              {(['fixed', 'hourly', 'quote'] as const).map((pt) => (
                <label key={pt} className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                  <input
                    type="radio"
                    checked={draft.pricing_type === pt}
                    onChange={() => setDraft((d) => ({ ...d, pricing_type: pt }))}
                    className="size-4 accent-primary"
                  />
                  {t(`pricing.${pt}`)}
                </label>
              ))}
            </div>
          </div>

          {draft.pricing_type !== 'quote' ? (
            <>
              <div>
                <label htmlFor="wiz-price" className={labelClass}>
                  {draft.pricing_type === 'hourly' ? t('fieldPriceHourly') : t('fieldPriceFixed')}
                </label>
                <input
                  id="wiz-price"
                  inputMode="decimal"
                  value={draft.price_kr}
                  onChange={(e) => setDraft((d) => ({ ...d, price_kr: e.target.value }))}
                  className={inputClass}
                  placeholder={t('pricePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="wiz-delivery" className={labelClass}>
                  {w('fieldDeliveryDays')}
                </label>
                <input
                  id="wiz-delivery"
                  type="number"
                  min={1}
                  max={365}
                  inputMode="numeric"
                  value={draft.deliveryDays}
                  onChange={(e) => setDraft((d) => ({ ...d, deliveryDays: e.target.value }))}
                  className={inputClass}
                  placeholder="7"
                />
                <p className="mt-1.5 text-xs text-on-surface-variant">{w('fieldDeliveryHint')}</p>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">{w('quoteNoDelivery')}</p>
          )}

          <div>
            <label htmlFor="wiz-revisions" className={labelClass}>
              {w('fieldRevisions')}
            </label>
            <input
              id="wiz-revisions"
              type="number"
              min={0}
              max={20}
              inputMode="numeric"
              value={draft.revisionsIncluded}
              onChange={(e) => setDraft((d) => ({ ...d, revisionsIncluded: e.target.value }))}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-on-surface-variant">{w('fieldRevisionsHint')}</p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="wiz-desc" className={labelClass}>
              {w('fieldDescriptionLong')}
            </label>
            <textarea
              id="wiz-desc"
              rows={8}
              maxLength={1200}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className={inputClass}
              placeholder={w('fieldDescriptionPlaceholder')}
            />
            <p className="mt-1.5 text-xs text-on-surface-variant">
              {w('charCount', { count: draft.description.length, max: 1200 })}
            </p>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <span className={labelClass}>{w('fieldFaq')}</span>
              {draft.faq.length < 10 ? (
                <button type="button" onClick={addFaqRow} className={hjBtnGhost}>
                  <MaterialIcon name="add" className="text-lg" />
                  {w('addFaq')}
                </button>
              ) : null}
            </div>
            <p className="mb-3 text-xs text-on-surface-variant">{w('fieldFaqHint')}</p>
            {draft.faq.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{w('faqEmpty')}</p>
            ) : (
              <ul className="space-y-4">
                {draft.faq.map((row, i) => (
                  <li key={i} className="rounded-xl border border-outline-variant/25 p-4">
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFaqRow(i)}
                        className="text-xs font-semibold text-error hover:underline"
                      >
                        {w('removeFaq')}
                      </button>
                    </div>
                    <label className={labelClass}>{w('faqQuestion')}</label>
                    <input
                      value={row.q}
                      maxLength={200}
                      onChange={(e) => updateFaq(i, 'q', e.target.value)}
                      className={`${inputClass} mb-3`}
                    />
                    <label className={labelClass}>{w('faqAnswer')}</label>
                    <textarea
                      value={row.a}
                      rows={3}
                      maxLength={2000}
                      onChange={(e) => updateFaq(i, 'a', e.target.value)}
                      className={inputClass}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">{w('reviewOverview')}</h3>
            <p className="mt-2 font-headline text-xl font-bold text-on-surface">{draft.title.trim() || '—'}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{subLabel}</p>
            {draft.searchTags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.searchTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">{w('reviewPricing')}</h3>
            <p className="mt-2 text-lg font-semibold text-on-surface">{priceLine}</p>
            {draft.pricing_type !== 'quote' && draft.deliveryDays.trim() ? (
              <p className="mt-1 text-sm text-on-surface-variant">
                {w('reviewDelivery', { days: draft.deliveryDays.trim() })}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-on-surface-variant">
              {w('reviewRevisions', { count: draft.revisionsIncluded.trim() || '0' })}
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">{w('reviewDescription')}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-on-surface">
              {draft.description.trim() ? draft.description.trim() : '—'}
            </p>
            {draft.faq.some((x) => x.q.trim() && x.a.trim()) ? (
              <ul className="mt-4 space-y-2 border-t border-outline-variant/20 pt-4">
                {draft.faq
                  .filter((x) => x.q.trim() && x.a.trim())
                  .map((x, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-on-surface">{x.q.trim()}</span>
                      <span className="text-on-surface-variant"> — </span>
                      <span className="text-on-surface-variant">{x.a.trim()}</span>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>

          <div>
            <label htmlFor="wiz-active" className={labelClass}>
              {t('fieldVisibility')}
            </label>
            <select
              id="wiz-active"
              value={draft.is_active ? 'true' : 'false'}
              onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.value === 'true' }))}
              className={inputClass}
            >
              <option value="true">{t('visibilityPublic')}</option>
              <option value="false">{t('visibilityHidden')}</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-outline-variant/20 pt-6">
        {step > 0 ? (
          <button type="button" onClick={goBack} className={hjBtnMuted} disabled={saving}>
            {w('back')}
          </button>
        ) : null}
        {step < 3 ? (
          <button type="button" onClick={goNext} className={hjBtnPrimary}>
            {w('next')}
          </button>
        ) : (
          <button type="button" disabled={saving} onClick={handlePublish} className={hjBtnPrimary}>
            {saving ? t('saving') : w('publish')}
          </button>
        )}
        <Link href={`/hjelpere/${providerId}`} className={hjBtnGhost}>
          {t('viewPublicProfile')}
        </Link>
      </div>
    </section>
  )
}
