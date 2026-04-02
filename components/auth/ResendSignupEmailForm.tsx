'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { resendSignupConfirmationAction } from '@/lib/auth/actions'

type Props = {
  email: string
  className?: string
}

export function ResendSignupEmailForm({ email, className }: Props) {
  const t = useTranslations('auth.account')
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(undefined)
    setError(undefined)
    const formData = new FormData(e.currentTarget)
    const result = await resendSignupConfirmationAction(undefined, formData)
    if (result?.error) setError(result.error)
    if (result?.success === 'confirmResent') setMessage(t('confirmResentSuccess'))
  }

  return (
    <form onSubmit={onSubmit} className={className ?? 'space-y-3'}>
      <input type="hidden" name="email" value={email} />
      {message ? (
        <p
          className="rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container"
          role="status"
        >
          {message}
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
      <button
        type="submit"
        className="text-sm font-bold text-primary underline-offset-2 hover:underline"
      >
        {t('resendConfirmEmail')}
      </button>
    </form>
  )
}
