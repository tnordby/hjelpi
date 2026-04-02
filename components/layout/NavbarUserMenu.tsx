'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { signOutAction } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import { useEffect, useId, useRef, useState } from 'react'

export type NavbarUserMenuProps = {
  avatarUrl: string | null
  fullName: string
  email: string
}

function initialsFromUser(fullName: string, email: string) {
  const n = fullName.trim()
  if (n.length >= 2) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }
  const e = email.trim()
  if (e.length >= 2) return e.slice(0, 2).toUpperCase()
  return '?'
}

function isSafeImageHost(src: string) {
  try {
    const u = new URL(src)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export function NavbarUserMenu({ avatarUrl, fullName, email }: NavbarUserMenuProps) {
  const t = useTranslations('nav')
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const initials = initialsFromUser(fullName, email)
  const showImage = Boolean(avatarUrl?.trim() && isSafeImageHost(avatarUrl!))

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-outline-variant/30 transition-shadow hover:ring-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          open && 'ring-primary/50',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={t('userMenuAria')}
        onClick={() => setOpen((v) => !v)}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar from arbitrary Supabase/storage URLs
          <img
            src={avatarUrl!}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary/15 text-xs font-bold text-primary">
            {initials}
          </span>
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-[60] mt-2 min-w-[220px] rounded-2xl border border-outline-variant/40 bg-white py-2 shadow-lg"
        >
          <div className="border-b border-outline-variant/20 px-4 py-3">
            <p className="truncate font-semibold text-on-surface">{fullName || email}</p>
            {fullName ? (
              <p className="truncate text-xs text-on-surface-variant">{email}</p>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard/innstillinger"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low"
              onClick={() => setOpen(false)}
            >
              {t('userMenuSettings')}
            </Link>
            <Link
              href="/min-konto"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low"
              onClick={() => setOpen(false)}
            >
              {t('userMenuAccount')}
            </Link>
          </div>
          <div className="border-t border-outline-variant/20 px-2 py-2">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary/5"
              >
                {t('userMenuSignOut')}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
