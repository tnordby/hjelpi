'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/routing'
import {
  clearProfileAvatarAction,
  updateProfileAvatarAction,
  updateProfileEmailAction,
  updateProfileNamesAndLocationAction,
  type ProfileSettingsState,
} from '@/lib/profile/actions'
import { ResendSignupEmailForm } from '@/components/auth/ResendSignupEmailForm'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

export type MinSideProfileSettingsProps = {
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  locationId: string
  hasProvider: boolean
  needsEmailConfirm: boolean
  locations: { id: string; name: string }[]
}

function MessageBanner({ state }: { state: ProfileSettingsState | undefined }) {
  if (!state?.error && !state?.success) return null
  return (
    <p
      role={state.error ? 'alert' : 'status'}
      className={cn(
        'rounded-xl px-4 py-3 text-sm',
        state.error
          ? 'bg-error-container/80 text-on-error-container'
          : 'bg-primary/10 text-on-surface',
      )}
    >
      {state.error ?? state.success}
    </p>
  )
}

export function MinSideProfileSettings({
  firstName,
  lastName,
  email,
  avatarUrl,
  locationId,
  hasProvider,
  needsEmailConfirm,
  locations,
}: MinSideProfileSettingsProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.settingsPage.form')
  const tPhoto = useTranslations('dashboard.settingsPage.photo')
  const [namesState, namesAction] = useActionState(updateProfileNamesAndLocationAction, {} as ProfileSettingsState)
  const [emailState, emailAction] = useActionState(updateProfileEmailAction, {} as ProfileSettingsState)
  const [avatarState, avatarAction] = useActionState(updateProfileAvatarAction, {} as ProfileSettingsState)
  const [clearState, clearAction] = useActionState(clearProfileAvatarAction, {} as ProfileSettingsState)

  const photoFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (avatarState?.success) photoFormRef.current?.reset()
  }, [avatarState?.success])

  useEffect(() => {
    if (avatarState?.success || clearState?.success || namesState?.success || emailState?.success) {
      router.refresh()
    }
  }, [avatarState?.success, clearState?.success, namesState?.success, emailState?.success, router])

  const showAvatar = Boolean(avatarUrl?.trim())

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-surface-container-lowest p-6 ring-1 ring-outline-variant/15">
        <h2 className="font-headline text-lg font-bold text-on-surface">{tPhoto('title')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{tPhoto('hint')}</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-outline-variant/25">
            {showAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase storage URL
              <img src={avatarUrl!} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-2xl font-bold text-primary/50" aria-hidden>
                ?
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <MessageBanner state={avatarState} />
            <MessageBanner state={clearState} />
            <form ref={photoFormRef} action={avatarAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="avatar" className="sr-only">
                  {tPhoto('fileLabel')}
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm text-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-primary"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                {tPhoto('save')}
              </button>
            </form>
            {showAvatar ? (
              <form action={clearAction}>
                <button
                  type="submit"
                  className="text-sm font-semibold text-on-surface-variant underline-offset-2 hover:text-primary hover:underline"
                >
                  {tPhoto('remove')}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest p-6 ring-1 ring-outline-variant/15">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('nameTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {hasProvider ? t('locationHintSeller') : t('locationHintBuyer')}
        </p>
        <form action={namesAction} className="mt-4 space-y-4">
          <MessageBanner state={namesState} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-on-surface">
                {t('firstName')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                maxLength={60}
                defaultValue={firstName}
                autoComplete="given-name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-on-surface">
                {t('lastName')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                maxLength={60}
                defaultValue={lastName}
                autoComplete="family-name"
                className={inputClass}
              />
            </div>
          </div>
          {locations.length > 0 ? (
            <div>
              <label htmlFor="locationId" className="mb-2 block text-sm font-medium text-on-surface">
                {t('locationLabel')}
              </label>
              <select id="locationId" name="locationId" defaultValue={locationId} className={inputClass}>
                <option value="">{t('locationPlaceholder')}</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="locationId" value="" />
          )}
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            {t('saveProfile')}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest p-6 ring-1 ring-outline-variant/15">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('emailTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('emailHint')}</p>
        {needsEmailConfirm ? (
          <div className="mt-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/80 px-4 py-4">
            <p className="mb-3 text-sm text-on-surface-variant">{t('emailUnverifiedBanner')}</p>
            <ResendSignupEmailForm email={email} />
          </div>
        ) : null}
        <form action={emailAction} className="mt-4 space-y-4">
          <MessageBanner state={emailState} />
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-on-surface">
              {t('emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={320}
              defaultValue={email}
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            {t('saveEmail')}
          </button>
        </form>
      </section>
    </div>
  )
}
