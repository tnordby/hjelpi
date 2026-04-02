'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { registerAction, registerSellerAction } from '@/lib/auth/actions'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { ResendSignupEmailForm } from '@/components/auth/ResendSignupEmailForm'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

type Props = {
  variant?: 'buyer' | 'seller'
}

export function RegisterForm({ variant = 'buyer' }: Props) {
  const t = useTranslations(variant === 'seller' ? 'auth.sellerRegister' : 'auth.register')
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    setPendingEmail(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const emailField = form.elements.namedItem('email') as HTMLInputElement | null
    const firstNameField = form.elements.namedItem('firstName') as HTMLInputElement | null
    const lastNameField = form.elements.namedItem('lastName') as HTMLInputElement | null
    const action = variant === 'seller' ? registerSellerAction : registerAction
    const result = await action(undefined, formData)
    if (result?.error) {
      setError(result.error)
    }
    if (result?.success === 'emailConfirm') {
      setSuccess(t('successEmail'))
      const email = emailField?.value ?? ''
      const displayName = profileDisplayName(
        firstNameField?.value ?? '',
        lastNameField?.value ?? '',
      )
      if (email) setPendingEmail(email)
      posthog.identify(email, { email, name: displayName })
      posthog.capture(variant === 'seller' ? 'seller_registered' : 'user_registered', {
        email,
        name: displayName,
        variant,
      })
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="space-y-3 rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">
          <p role="status">{success}</p>
          {pendingEmail ? (
            <ResendSignupEmailForm email={pendingEmail} className="space-y-2 pt-1" />
          ) : null}
        </div>
      </div>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-on-surface">
            {t('firstName')}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            minLength={1}
            maxLength={60}
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
            autoComplete="family-name"
            maxLength={60}
            className={inputClass}
          />
        </div>
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
      {variant === 'seller' ? (
        <p className="text-center text-sm text-on-surface-variant">
          {t('buyerInstead')}{' '}
          <Link href="/registrer" className="font-bold text-primary hover:underline">
            {t('buyerRegisterLink')}
          </Link>
        </p>
      ) : null}
    </form>
  )
}
