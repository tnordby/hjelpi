'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendConfirmationSchema,
} from '@/lib/auth/schemas'
import { authCallbackUrl } from '@/lib/auth/callback-next'
import { resolveAccountHrefAfterAuth } from '@/lib/seller/post-auth'

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

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: t('invalidCredentials') }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  const href = user ? await resolveAccountHrefAfterAuth(supabase, user.id) : '/min-konto'
  redirect({ href, locale })
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

  const supabase = await createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()
  const emailRedirectTo = authCallbackUrl(origin, locale, '/min-konto')

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
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

export async function registerSellerAction(
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

  const supabase = await createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()
  const sellerNext = '/bli-hjelper/fullfor-profil'
  const emailRedirectTo = authCallbackUrl(origin, locale, sellerNext)

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: parsed.data.fullName,
        register_as_seller: 'true',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    const href = data.user
      ? await resolveAccountHrefAfterAuth(supabase, data.user.id)
      : sellerNext
    redirect({ href, locale })
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

  const supabase = await createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()
  const redirectTo = authCallbackUrl(origin, locale, '/tilbakestill-passord')

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo },
  )

  if (error?.message?.toLowerCase().includes('rate')) {
    return { error: t('rateLimited') }
  }

  return { success: 'resetSent' }
}

export async function resendSignupConfirmationAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations('auth.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = resendConfirmationSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const supabase = await createSupabaseServerClient()
  const origin = publicBaseUrl()
  const locale = await getLocale()
  const emailRedirectTo = authCallbackUrl(origin, locale, '/min-konto')

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: parsed.data.email,
    options: { emailRedirectTo },
  })

  if (error) {
    if (error.message?.toLowerCase().includes('rate')) {
      return { error: t('rateLimited') }
    }
    return { error: error.message }
  }

  return { success: 'confirmResent' }
}

export async function signOutAction(): Promise<void> {
  const locale = await getLocale()

  if (!isSupabaseConfigured()) {
    redirect({ href: '/logg-inn', locale })
  }

  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect({ href: '/', locale })
}
