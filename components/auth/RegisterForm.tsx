'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { registerAction } from '@/lib/auth/actions'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    const formData = new FormData(e.currentTarget)
    const result = await registerAction(undefined, formData)
    if (result?.error) setError(result.error)
    if (result?.success === 'emailConfirm') setSuccess(t('successEmail'))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {success ? (
        <p
          className="rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container"
          role="status"
        >
          {success}
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
        <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-on-surface">
          {t('fullName')}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-on-surface-variant">{t('hint')}</p>
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-primary py-3.5 font-bold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
      >
        {t('submit')}
      </button>
      <p className="text-center text-sm text-on-surface-variant">
        {t('hasAccount')}{' '}
        <Link href="/logg-inn" className="font-bold text-primary hover:underline">
          {t('loginLink')}
        </Link>
      </p>
    </form>
  )
}
