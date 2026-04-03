'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import {
  clearProfileAvatarAction,
  updateProfileAvatarAction,
  updateProfileEmailAction,
  updateProfileLocationOnlyAction,
  updateProfileNamesOnlyAction,
  type ProfileSettingsState,
} from '@/lib/profile/actions'
import { ResendSignupEmailForm } from '@/components/auth/ResendSignupEmailForm'
import {
  SettingsLocationPicker,
  type SettingsLocationOption,
} from '@/components/settings/SettingsLocationPicker'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { hjBtnPrimaryPill } from '@/lib/button-classes'
import { cn } from '@/lib/utils'

const sectionClass =
  'rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15'

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
  locations: SettingsLocationOption[]
  locationsLoadError?: boolean
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
  locationsLoadError = false,
}: MinSideProfileSettingsProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.settingsPage.form')
  const tPhoto = useTranslations('dashboard.settingsPage.photo')
  const [namesState, namesAction] = useActionState(updateProfileNamesOnlyAction, {} as ProfileSettingsState)
  const [locationState, locationAction] = useActionState(
    updateProfileLocationOnlyAction,
    {} as ProfileSettingsState,
  )
  const [emailState, emailAction] = useActionState(updateProfileEmailAction, {} as ProfileSettingsState)
  const [avatarState, avatarAction] = useActionState(updateProfileAvatarAction, {} as ProfileSettingsState)
  const [clearState, clearAction] = useActionState(clearProfileAvatarAction, {} as ProfileSettingsState)

  const photoFormRef = useRef<HTMLFormElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  const revokePreview = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }
    setAvatarPreviewUrl(null)
  }, [])

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
    }
  }, [])

  function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    revokePreview()
    if (!file) return
    const url = URL.createObjectURL(file)
    previewObjectUrlRef.current = url
    setAvatarPreviewUrl(url)
  }

  useEffect(() => {
    if (avatarState?.success) {
      photoFormRef.current?.reset()
      revokePreview()
    }
  }, [avatarState?.success, revokePreview])

  useEffect(() => {
    if (clearState?.success) {
      photoFormRef.current?.reset()
      revokePreview()
    }
  }, [clearState?.success, revokePreview])

  useEffect(() => {
    if (
      avatarState?.success ||
      clearState?.success ||
      namesState?.success ||
      locationState?.success ||
      emailState?.success
    ) {
      router.refresh()
    }
  }, [
    avatarState?.success,
    clearState?.success,
    namesState?.success,
    locationState?.success,
    emailState?.success,
    router,
  ])

  const displayAvatarSrc = avatarPreviewUrl ?? (avatarUrl?.trim() ? avatarUrl : null)
  const showAvatar = Boolean(displayAvatarSrc)

  return (
    <div className="space-y-8">
      <section className={sectionClass}>
        <h2 className="font-headline text-lg font-bold text-on-surface">{tPhoto('title')}</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            className={cn(
              'group relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-outline-variant/20',
              showAvatar && 'cursor-default',
            )}
          >
            {showAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview or Supabase URL
              <img
                src={displayAvatarSrc!}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xl font-bold text-primary/40" aria-hidden>
                  ?
                </span>
              </div>
            )}
            {showAvatar ? (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity',
                  'max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
                )}
              >
                {avatarPreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      photoFormRef.current?.reset()
                      revokePreview()
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-on-surface shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label={tPhoto('clearSelectionAria')}
                  >
                    <MaterialIcon name="close" className="text-2xl" />
                  </button>
                ) : avatarUrl?.trim() ? (
                  <form action={clearAction}>
                    <button
                      type="submit"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-on-surface shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      aria-label={tPhoto('removeAria')}
                    >
                      <MaterialIcon name="close" className="text-2xl" />
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <MessageBanner state={avatarState} />
            <MessageBanner state={clearState} />
            <form ref={photoFormRef} action={avatarAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onAvatarFileChange}
                className="sr-only"
              />
              <label
                htmlFor="avatar"
                className={cn(hjBtnPrimaryPill, 'inline-flex w-fit cursor-pointer')}
              >
                {tPhoto('uploadButton')}
              </label>
              <button
                type="submit"
                className="inline-flex w-fit shrink-0 rounded-full border border-outline-variant/40 bg-white px-6 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                {tPhoto('save')}
              </button>
            </form>
            <p className="text-xs text-on-surface-variant">{tPhoto('hint')}</p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('nameTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('nameSubtitle')}</p>
        <form action={namesAction} className="mt-4 flex flex-col gap-4">
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
          <button type="submit" className={cn(hjBtnPrimaryPill, 'w-fit')}>
            {t('saveName')}
          </button>
        </form>
      </section>

      <section className={sectionClass}>
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('locationSectionTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {hasProvider ? t('locationHintSeller') : t('locationHintBuyer')}
        </p>
        <form action={locationAction} className="mt-4 flex flex-col gap-4">
          <MessageBanner state={locationState} />
          <SettingsLocationPicker
            locations={locations}
            initialLocationId={locationId}
            loadError={locationsLoadError}
          />
          {locations.length > 0 ? (
            <button
              type="submit"
              className={cn(hjBtnPrimaryPill, 'w-fit')}
            >
              {t('saveLocation')}
            </button>
          ) : null}
        </form>
      </section>

      <section className={sectionClass}>
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
            className={hjBtnPrimaryPill}
          >
            {t('saveEmail')}
          </button>
        </form>
      </section>

      <section className={sectionClass}>
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('passwordTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('passwordHint')}</p>
        <Link
          href="/glemt-passord"
          className={cn(hjBtnPrimaryPill, 'mt-4 inline-flex w-fit')}
        >
          {t('passwordCta')}
        </Link>
      </section>
    </div>
  )
}
