'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { completeSellerProviderAction } from '@/lib/seller/actions'
import type { SellerOnboardingState } from '@/lib/seller/actions'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

type LocationOption = { id: string; name: string }

type Props = {
  locations: LocationOption[]
}

export function CompleteSellerProfileForm({ locations }: Props) {
  const t = useTranslations('sellerOnboarding.form')
  const [error, setError] = useState<string | undefined>()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    const formData = new FormData(e.currentTarget)
    const serviceRadius = formData.get('service_radius_km')
    const result: SellerOnboardingState | void = await completeSellerProviderAction(
      undefined,
      formData,
    )
    if (result?.error) {
      setError(result.error)
    } else {
      posthog.capture('seller_profile_completed', {
        service_radius_km: serviceRadius ? Number(serviceRadius) : undefined,
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p
          className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-on-surface">
          {t('bioLabel')}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={2000}
          placeholder={t('bioPlaceholder')}
          className={`${inputClass} resize-y min-h-[120px]`}
        />
        <p className="mt-1.5 text-xs text-on-surface-variant">{t('bioHint')}</p>
      </div>
      <div>
        <label
          htmlFor="service_radius_km"
          className="mb-2 block text-sm font-medium text-on-surface"
        >
          {t('radiusLabel')}
        </label>
        <input
          id="service_radius_km"
          name="service_radius_km"
          type="number"
          min={5}
          max={200}
          defaultValue={20}
          required
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-on-surface-variant">{t('radiusHint')}</p>
      </div>
      {locations.length > 0 ? (
        <div>
          <label htmlFor="location_id" className="mb-2 block text-sm font-medium text-on-surface">
            {t('locationLabel')}
          </label>
          <select
            id="location_id"
            name="location_id"
            className={inputClass}
            defaultValue=""
          >
            <option value="">{t('locationPlaceholder')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-full bg-primary py-3.5 font-bold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
      >
        {t('submit')}
      </button>
    </form>
  )
}
