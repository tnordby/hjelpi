'use client'

import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { useRouter as useNextRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

export function UpdatePasswordForm() {
  const t = useTranslations('auth.reset')
  const tErrors = useTranslations('auth.errors')
  const router = useRouter()
  const nextRouter = useNextRouter()
  const [ready, setReady] = useState<boolean | null>(() =>
    isSupabaseConfigured() ? null : false,
  )
  const [error, setError] = useState<string | undefined>()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    let cancelled = false
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setReady(Boolean(session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    const form = e.currentTarget
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

    if (password.length < 8) {
      setError(tErrors('invalidFields'))
      return
    }
    if (password !== confirmPassword) {
      setError(tErrors('passwordMismatch'))
      return
    }

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })
      if (updateError) {
        setError(tErrors('updateFailed'))
        return
      }
      posthog.capture('password_updated')
      setDone(true)
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/logg-inn')
        nextRouter.refresh()
      }, 1600)
    } catch {
      setError(tErrors('updateFailed'))
    }
  }

  if (ready === null) {
    return (
      <p className="text-center text-on-surface-variant">{t('loading')}</p>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container">
        {tErrors('notConfigured')}
      </p>
    )
  }

  if (!ready) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-on-surface-variant">{t('invalidSession')}</p>
        <Link
          href="/glemt-passord"
          className="inline-block font-bold text-primary hover:underline"
        >
          {t('requestNew')}
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <p className="rounded-xl bg-secondary-container px-4 py-3 text-center text-sm text-on-secondary-container">
        {t('success')}
      </p>
    )
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
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-on-surface">
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-on-surface"
        >
          {t('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-primary py-3.5 font-bold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
      >
        {t('submit')}
      </button>
    </form>
  )
}
