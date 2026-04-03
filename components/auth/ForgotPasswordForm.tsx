'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { forgotPasswordAction } from '@/lib/auth/actions'
import { hjBtnPrimaryLg } from '@/lib/button-classes'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgot')
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const result = await forgotPasswordAction(undefined, formData)
    if (result?.error) setError(result.error)
    if (result?.success === 'resetSent') {
      setSuccess(true)
      posthog.capture('password_reset_requested', { email })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {success ? (
        <p
          className="rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container"
          role="status"
        >
          {t('success')}
        </p>
      ) : null}
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
          disabled={success}
        />
      </div>
      <button type="submit" disabled={success} className={hjBtnPrimaryLg}>
        {t('submit')}
      </button>
      <p className="text-center text-sm">
        <Link href="/logg-inn" className="font-medium text-primary hover:underline">
          {t('backToLogin')}
        </Link>
      </p>
    </form>
  )
}
