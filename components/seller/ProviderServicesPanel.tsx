'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useEffect, useMemo, useState } from 'react'
import type { ProviderServiceSellerRow } from '@/lib/provider-services/data'
import {
  deleteProviderServiceAction,
  upsertProviderServiceAction,
  type ProviderServiceActionState,
} from '@/lib/provider-services/actions'
import { formatServicePriceLong } from '@/lib/provider-services/display'
import type { TaxonomySubcategoryOption } from '@/lib/provider-services/types'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import {
  draftFromSellerServiceRow,
  emptySellerServiceDraft,
  SellerServiceWizard,
  type SellerServiceDraft,
} from '@/components/seller/SellerServiceWizard'
import { hjBtnGhost, hjBtnPrimary } from '@/lib/button-classes'
import posthog from 'posthog-js'

type Props = {
  providerId: string
  services: ProviderServiceSellerRow[]
  taxonomy: TaxonomySubcategoryOption[]
  /** False when Stripe is configured but Connect onboarding is not complete. */
  canManageServices?: boolean
}

export function ProviderServicesPanel({
  providerId,
  services,
  taxonomy,
  canManageServices = true,
}: Props) {
  const t = useTranslations('dashboard.sellerServices')
  const tErr = useTranslations('dashboard.sellerServices.errors')
  const router = useRouter()
  const [formError, setFormError] = useState<string | undefined>()
  const [deleteError, setDeleteError] = useState<string | undefined>()
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [draft, setDraft] = useState<SellerServiceDraft>(() => emptySellerServiceDraft(taxonomy))
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const taxonomyForWizard = useMemo(() => {
    if (mode !== 'edit' || !draft.id) return taxonomy
    const svc = services.find((s) => s.id === draft.id)
    if (!svc) return taxonomy
    const sid = svc.subcategoryId
    if (!sid || taxonomy.some((x) => x.id === sid)) return taxonomy
    const label = svc.subcategoryLabel ?? 'Tjenestetype'
    const legacy: TaxonomySubcategoryOption = {
      id: sid,
      name: label,
      slug: 'legacy',
      categoryName: '',
      categorySlug: 'legacy',
      defaultPricingType: svc.pricingType,
    }
    return [legacy, ...taxonomy]
  }, [mode, draft.id, services, taxonomy])

  const taxonomyById = useMemo(
    () => new Map(taxonomyForWizard.map((x) => [x.id, x])),
    [taxonomyForWizard],
  )

  useEffect(() => {
    if (!canManageServices && mode != null) {
      setMode(null)
      setFormError(undefined)
      setDraft(emptySellerServiceDraft(taxonomy))
    }
  }, [canManageServices, mode, taxonomy])

  function openAdd() {
    if (!canManageServices || taxonomy.length === 0) return
    setFormError(undefined)
    setMode('add')
    setDraft(emptySellerServiceDraft(taxonomy))
  }

  function openEdit(s: ProviderServiceSellerRow) {
    if (!canManageServices) return
    setFormError(undefined)
    setMode('edit')
    const fallback = taxonomy[0]?.id ?? ''
    setDraft(draftFromSellerServiceRow(s, fallback))
  }

  function cancelForm() {
    setMode(null)
    setFormError(undefined)
    setDraft(emptySellerServiceDraft(taxonomy))
  }

  async function onSave(fd: FormData) {
    setFormError(undefined)
    setSaving(true)
    try {
      const result: ProviderServiceActionState | void = await upsertProviderServiceAction(undefined, fd)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      posthog.capture('seller_service_saved', {
        provider_id: providerId,
        is_new: mode === 'add',
        pricing_type: draft.pricing_type,
      })
      cancelForm()
      router.refresh()
    } catch {
      setFormError(tErr('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(serviceId: string) {
    if (!window.confirm(t('confirmDelete'))) return
    setDeleteError(undefined)
    setDeletingId(serviceId)
    try {
      const fd = new FormData()
      fd.set('id', serviceId)
      const result = await deleteProviderServiceAction(undefined, fd)
      if (result?.error) {
        setDeleteError(result.error)
        return
      }
      posthog.capture('seller_service_deleted', { provider_id: providerId })
      if (mode === 'edit' && draft.id === serviceId) cancelForm()
      router.refresh()
    } catch {
      setDeleteError(tErr('saveFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const taxonomyMissing = taxonomy.length === 0
  const addDisabled = taxonomyMissing || !canManageServices
  const addDisabledTitle = !canManageServices
    ? t('addServicePaymentsDisabledHint')
    : taxonomyMissing
      ? t('addServiceDisabledHint')
      : undefined

  return (
    <div className="space-y-10">
      {taxonomyMissing ? (
        <div
          className="rounded-2xl border border-dashed border-tertiary/30 bg-tertiary/8 px-5 py-4 text-sm text-on-surface"
          role="alert"
        >
          <p className="font-headline font-bold text-on-surface">{t('taxonomyEmptyTitle')}</p>
          <p className="mt-2 text-on-surface-variant">{t('taxonomyEmptyBody')}</p>
        </div>
      ) : null}
      {deleteError ? (
        <p className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
          {deleteError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">{t('listTitle')}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t('listSubtitle')}</p>
        </div>
        {mode == null ? (
          <button
            type="button"
            onClick={openAdd}
            disabled={addDisabled}
            title={addDisabledTitle}
            className={`${hjBtnPrimary} disabled:pointer-events-none disabled:opacity-45`}
          >
            <MaterialIcon name="add" className="text-xl" />
            {t('addService')}
          </button>
        ) : null}
      </div>

      {services.length === 0 && mode == null ? (
        <div className="rounded-2xl border border-outline-variant/30 bg-white px-6 py-12 text-center shadow-sm">
          <MaterialIcon name="home_repair_service" className="mx-auto mb-3 text-5xl text-on-surface-variant/35" />
          <p className="text-on-surface-variant">{t('emptyList')}</p>
          <button
            type="button"
            onClick={openAdd}
            disabled={addDisabled}
            title={addDisabledTitle}
            className={`${hjBtnPrimary} mt-6 disabled:pointer-events-none disabled:opacity-45`}
          >
            {t('addFirst')}
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {services.map((s) => {
            const priceLine = formatServicePriceLong(s.basePriceOre, s.pricingType)
            const inactive = !s.isActive
            const tagCount = s.searchTags.length
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-headline font-bold text-on-surface">{s.title}</span>
                    {inactive ? (
                      <span className="rounded-full bg-on-surface-variant/10 px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                        {t('badgeHidden')}
                      </span>
                    ) : null}
                  </div>
                  {s.subcategoryLabel ? (
                    <p className="mt-0.5 text-sm text-on-surface-variant">{s.subcategoryLabel}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-medium text-primary">{priceLine}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                    {s.pricingType !== 'quote' && s.deliveryDays != null ? (
                      <span>{t('listMetaDelivery', { days: s.deliveryDays })}</span>
                    ) : null}
                    {tagCount > 0 ? <span>{t('listMetaTags', { count: tagCount })}</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    disabled={!canManageServices}
                    title={!canManageServices ? t('addServicePaymentsDisabledHint') : undefined}
                    className={`${hjBtnGhost} disabled:pointer-events-none disabled:opacity-45`}
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === s.id}
                    onClick={() => onDelete(s.id)}
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-error ring-1 ring-error/30 hover:bg-error/5 disabled:opacity-50"
                  >
                    {t('delete')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {mode != null ? (
        <SellerServiceWizard
          key={`${mode}-${draft.id ?? 'new'}`}
          mode={mode}
          providerId={providerId}
          taxonomy={taxonomyForWizard}
          taxonomyById={taxonomyById}
          draft={draft}
          setDraft={setDraft}
          formError={formError}
          saving={saving}
          onCancel={cancelForm}
          onSave={onSave}
        />
      ) : null}
    </div>
  )
}
