'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from '@/lib/auth/schemas'

export type AuthActionState = {
  error?: string
  success?: string
}

function publicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  if (base?.startsWith('http')) return base.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export async function loginAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState | void> {
  const t = await getTranslations('auth.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: t('invalidCredentials') }
  }

  const locale = await getLocale()
  redirect({ href: '/min-konto', locale })
}

export async function registerAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState | void> {
  const t = await getTranslations('auth.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = registerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const supabase = createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/${locale}/logg-inn`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    redirect({ href: '/min-konto', locale })
  }

  return { success: 'emailConfirm' }
}

export async function forgotPasswordAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations('auth.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const supabase = createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()
  const redirectTo = `${origin}/${locale}/tilbakestill-passord`

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo },
  )

  if (error?.message?.toLowerCase().includes('rate')) {
    return { error: t('rateLimited') }
  }

  return { success: 'resetSent' }
}

export async function signOutAction(): Promise<void> {
  const locale = await getLocale()

  if (!isSupabaseConfigured()) {
    redirect({ href: '/logg-inn', locale })
  }

  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect({ href: '/', locale })
}
