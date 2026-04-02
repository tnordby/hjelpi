'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { loginAction } from '@/lib/auth/actions'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const [error, setError] = useState<string | undefined>()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const result = await loginAction(undefined, formData)
    if (result?.error) {
      setError(result.error)
      posthog.capture('login_failed', { error: result.error })
    } else {
      posthog.identify(email, { email })
      posthog.capture('user_logged_in', { email })
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
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-on-surface">
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-on-surface">
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
      <div className="flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
        <Link href="/glemt-passord" className="font-medium text-primary hover:underline">
          {t('forgotLink')}
        </Link>
        <span className="text-on-surface-variant">
          {t('noAccount')}{' '}
          <Link href="/registrer" className="font-bold text-primary hover:underline">
            {t('registerLink')}
          </Link>
        </span>
      </div>
    </form>
  )
}
