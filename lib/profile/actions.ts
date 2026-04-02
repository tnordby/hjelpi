'use server'

import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import { authCallbackUrl } from '@/lib/auth/callback-next'
import {
  formDataText,
  profileEmailSchema,
  profileNamesLocationSchema,
  validateAvatarFile,
} from '@/lib/profile/schemas'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type ProfileSettingsState = {
  error?: string
  success?: string
}

function publicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  if (base?.startsWith('http')) return base.replace(/\/$/, '')
  return 'http://localhost:3000'
}

async function revalidateNavAndSettingsSync() {
  const locale = await getLocale()
  revalidatePath(`/${locale}/min-side`, 'layout')
  revalidatePath(`/${locale}/min-side/innstillinger`)
  revalidatePath(`/${locale}`, 'layout')
}

export async function updateProfileNamesAndLocationAction(
  _prev: ProfileSettingsState | undefined,
  formData: FormData,
): Promise<ProfileSettingsState> {
  const t = await getTranslations('dashboard.settingsPage.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = profileNamesLocationSchema.safeParse({
    firstName: formDataText(formData, 'firstName'),
    lastName: formDataText(formData, 'lastName'),
    locationId: formData.get('locationId'),
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileErr || !profile) {
    return { error: t('profileMissing') }
  }

  const locRaw = parsed.data.locationId?.trim() ?? ''
  const locationId = locRaw.length > 0 ? locRaw : null

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  const isSellerWithProvider = profile.role === 'seller' && Boolean(provider)

  if (isSellerWithProvider && provider) {
    const { error: nameErr } = await supabase
      .from('profiles')
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      })
      .eq('user_id', user.id)

    if (nameErr) {
      return { error: t('saveFailed') }
    }

    const { error: provErr } = await supabase
      .from('providers')
      .update({ location_id: locationId })
      .eq('id', provider.id)

    if (provErr) {
      return { error: t('saveFailed') }
    }
  } else {
    const { error: profErr } = await supabase
      .from('profiles')
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        home_location_id: locationId,
      })
      .eq('user_id', user.id)

    if (profErr) {
      return { error: t('saveFailed') }
    }
  }

  await revalidateNavAndSettingsSync()
  const ok = await getTranslations('dashboard.settingsPage.form')
  return { success: ok('profileSaved') }
}

export async function updateProfileEmailAction(
  _prev: ProfileSettingsState | undefined,
  formData: FormData,
): Promise<ProfileSettingsState> {
  const t = await getTranslations('dashboard.settingsPage.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const parsed = profileEmailSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: t('invalidEmail') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const next = parsed.data.email.trim().toLowerCase()
  const current = user.email?.trim().toLowerCase() ?? ''
  if (next === current) {
    const ok = await getTranslations('dashboard.settingsPage.form')
    return { success: ok('emailUnchanged') }
  }

  const origin = publicBaseUrl()
  const locale = await getLocale()
  const emailRedirectTo = authCallbackUrl(origin, locale, '/min-side')

  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email.trim() },
    { emailRedirectTo },
  )

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('rate')) return { error: t('rateLimited') }
    if (msg.includes('already') || msg.includes('registered')) return { error: t('emailInUse') }
    return { error: t('saveFailed') }
  }

  await revalidateNavAndSettingsSync()
  const ok = await getTranslations('dashboard.settingsPage.form')
  return { success: ok('emailConfirmSent') }
}

export async function updateProfileAvatarAction(
  _prev: ProfileSettingsState | undefined,
  formData: FormData,
): Promise<ProfileSettingsState> {
  const t = await getTranslations('dashboard.settingsPage.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const file = formData.get('avatar')
  if (!(file instanceof File)) {
    return { error: t('invalidFields') }
  }

  const check = validateAvatarFile(file)
  if (!check.ok) {
    if (check.reason === 'empty') return { error: t('avatarEmpty') }
    if (check.reason === 'size') return { error: t('avatarTooLarge') }
    return { error: t('avatarType') }
  }

  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : file.type === 'image/gif'
          ? 'gif'
          : 'jpg'

  const objectPath = `${user.id}/avatar.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await supabase.storage.from('avatars').upload(objectPath, buffer, {
    contentType: file.type,
    upsert: true,
  })

  if (upErr) {
    return { error: t('uploadFailed') }
  }

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
  const publicUrl = pub.publicUrl

  const { error: dbErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id)

  if (dbErr) {
    return { error: t('saveFailed') }
  }

  await revalidateNavAndSettingsSync()
  const ok = await getTranslations('dashboard.settingsPage.form')
  return { success: ok('photoSaved') }
}

export async function clearProfileAvatarAction(
  _prev: ProfileSettingsState | undefined,
  _formData: FormData,
): Promise<ProfileSettingsState> {
  const t = await getTranslations('dashboard.settingsPage.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', user.id)

  if (dbErr) {
    return { error: t('saveFailed') }
  }

  await revalidateNavAndSettingsSync()
  const ok = await getTranslations('dashboard.settingsPage.form')
  return { success: ok('photoRemoved') }
}
