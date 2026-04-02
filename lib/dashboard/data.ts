import type { SupabaseClient } from '@supabase/supabase-js'
import { formatEarningsPeriodLabel, netSellerOre } from '@/lib/dashboard/money'
import { profileDisplayName } from '@/lib/profiles/display-name'

export type DashboardUserContext = {
  userId: string
  email: string
  profileId: string
  fullName: string
  role: 'buyer' | 'seller' | 'admin'
  /** DB `profiles.active_mode` — which dashboard the user last used. */
  activeMode: 'buyer' | 'seller'
  providerId: string | null
  isSeller: boolean
}

export type BookingRow = {
  id: string
  status: string
  scheduled_at: string
  total_amount_ore: number
  base_amount_ore?: number
  seller_fee_ore?: number
  created_at: string
  buyer_id?: string
  serviceTitle: string | null
  buyerName: string | null
}

export type MessageThreadPreview = {
  bookingId: string
  lastBody: string
  lastAt: string
  unreadCount: number
}

export async function loadDashboardUserContext(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<DashboardUserContext | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, active_mode')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !profile) return null

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  const role = profile.role as DashboardUserContext['role']
  const providerId = provider?.id ?? null
  const isSeller = role === 'seller' && Boolean(providerId)
  const rawMode = profile.active_mode as string | null
  const activeMode: DashboardUserContext['activeMode'] =
    rawMode === 'seller' ? 'seller' : 'buyer'

  return {
    userId,
    email,
    profileId: profile.id,
    fullName: profileDisplayName(profile.first_name, profile.last_name),
    role,
    activeMode,
    providerId,
    isSeller,
  }
}

export async function fetchBuyerBookings(
  supabase: SupabaseClient,
  profileId: string,
): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      scheduled_at,
      total_amount_ore,
      created_at,
      provider_services ( title )
    `,
    )
    .eq('buyer_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map((row) => {
    const ps = row.provider_services as { title: string } | { title: string }[] | null
    const title =
      ps == null ? null : Array.isArray(ps) ? ps[0]?.title ?? null : ps.title
    return {
      id: row.id as string,
      status: row.status as string,
      scheduled_at: row.scheduled_at as string,
      total_amount_ore: row.total_amount_ore as number,
      created_at: row.created_at as string,
      serviceTitle: title,
      buyerName: null,
    }
  })
}

export async function fetchSellerBookings(
  supabase: SupabaseClient,
  providerId: string,
): Promise<BookingRow[]> {
  const { data: services, error: svcErr } = await supabase
    .from('provider_services')
    .select('id')
    .eq('provider_id', providerId)

  if (svcErr || !services?.length) return []

  const serviceIds = services.map((s) => s.id as string)

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      scheduled_at,
      total_amount_ore,
      base_amount_ore,
      seller_fee_ore,
      created_at,
      buyer_id,
      provider_services ( title )
    `,
    )
    .in('provider_service_id', serviceIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  const buyerIds = [...new Set(data.map((r) => r.buyer_id as string).filter(Boolean))]
  const buyerNames = new Map<string, string>()
  if (buyerIds.length > 0) {
    const { data: buyers } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', buyerIds)
    for (const p of buyers ?? []) {
      buyerNames.set(
        p.id as string,
        profileDisplayName(p.first_name as string, p.last_name as string),
      )
    }
  }

  return data.map((row) => {
    const ps = row.provider_services as { title: string } | { title: string }[] | null
    const title =
      ps == null ? null : Array.isArray(ps) ? ps[0]?.title ?? null : ps.title
    const bid = row.buyer_id as string
    return {
      id: row.id as string,
      status: row.status as string,
      scheduled_at: row.scheduled_at as string,
      total_amount_ore: row.total_amount_ore as number,
      base_amount_ore: row.base_amount_ore as number,
      seller_fee_ore: row.seller_fee_ore as number,
      created_at: row.created_at as string,
      buyer_id: bid,
      serviceTitle: title,
      buyerName: buyerNames.get(bid) ?? null,
    }
  })
}

export type EarningsSummary = {
  completedCount: number
  netOre: number
  pendingIncoming: number
}

export async function fetchSellerEarningsSummary(
  supabase: SupabaseClient,
  providerId: string,
): Promise<EarningsSummary> {
  const { data: services } = await supabase
    .from('provider_services')
    .select('id')
    .eq('provider_id', providerId)

  if (!services?.length) {
    return { completedCount: 0, netOre: 0, pendingIncoming: 0 }
  }

  const serviceIds = services.map((s) => s.id as string)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('status, base_amount_ore, seller_fee_ore')
    .in('provider_service_id', serviceIds)

  if (!bookings?.length) {
    return { completedCount: 0, netOre: 0, pendingIncoming: 0 }
  }

  let netOre = 0
  let completedCount = 0
  let pendingIncoming = 0

  for (const b of bookings) {
    const status = b.status as string
    const base = (b.base_amount_ore as number) ?? 0
    const fee = (b.seller_fee_ore as number) ?? 0
    if (status === 'completed') {
      completedCount += 1
      netOre += Math.max(0, base - fee)
    }
    if (status === 'pending' || status === 'confirmed') {
      pendingIncoming += 1
    }
  }

  return { completedCount, netOre, pendingIncoming }
}

export type EarningsPeriodRow = {
  periodKey: string
  label: string
  netOre: number
  count: number
}

function bookingPeriodAnchor(scheduledAt: string | null, createdAt: string): Date {
  if (scheduledAt) {
    const d = new Date(scheduledAt)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date(createdAt)
}

function earningsPeriodKey(d: Date, granularity: 'month' | 'year'): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (granularity === 'year') return String(y)
  return `${y}-${String(m).padStart(2, '0')}`
}

/** Completed bookings only; net = base_amount_ore − seller_fee_ore, grouped by scheduled_at (fallback created_at). */
export async function fetchSellerEarningsByPeriod(
  supabase: SupabaseClient,
  providerId: string,
  granularity: 'month' | 'year',
): Promise<EarningsPeriodRow[]> {
  const { data: services } = await supabase
    .from('provider_services')
    .select('id')
    .eq('provider_id', providerId)

  if (!services?.length) return []

  const serviceIds = services.map((s) => s.id as string)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('base_amount_ore, seller_fee_ore, scheduled_at, created_at')
    .in('provider_service_id', serviceIds)
    .eq('status', 'completed')

  if (error || !bookings?.length) return []

  const map = new Map<string, { netOre: number; count: number }>()
  for (const b of bookings) {
    const anchor = bookingPeriodAnchor(
      b.scheduled_at as string | null,
      b.created_at as string,
    )
    const key = earningsPeriodKey(anchor, granularity)
    const net = netSellerOre(
      (b.base_amount_ore as number) ?? 0,
      (b.seller_fee_ore as number) ?? 0,
    )
    const cur = map.get(key) ?? { netOre: 0, count: 0 }
    cur.netOre += net
    cur.count += 1
    map.set(key, cur)
  }

  return [...map.entries()]
    .map(([periodKey, v]) => ({
      periodKey,
      label: formatEarningsPeriodLabel(periodKey, granularity),
      netOre: v.netOre,
      count: v.count,
    }))
    .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
}

export async function fetchMessageThreads(
  supabase: SupabaseClient,
  profileId: string,
): Promise<MessageThreadPreview[]> {
  const { data: rows, error } = await supabase
    .from('messages')
    .select('id, body, read_at, created_at, booking_id, sender_id')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !rows?.length) return []

  const groups = new Map<string, typeof rows>()
  for (const m of rows) {
    const bid = m.booking_id as string
    const list = groups.get(bid) ?? []
    list.push(m)
    groups.set(bid, list)
  }

  const threads: MessageThreadPreview[] = []
  for (const [bookingId, msgs] of groups) {
    const sorted = [...msgs].sort(
      (a, b) =>
        new Date(b.created_at as string).getTime() -
        new Date(a.created_at as string).getTime(),
    )
    const latest = sorted[0]
    const unread = sorted.filter(
      (m) => m.read_at == null && (m.sender_id as string) !== profileId,
    ).length
    threads.push({
      bookingId,
      lastBody: (latest.body as string) ?? '',
      lastAt: latest.created_at as string,
      unreadCount: unread,
    })
  }

  threads.sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  )
  return threads.slice(0, 40)
}

export async function fetchBuyerSpendSummary(
  supabase: SupabaseClient,
  profileId: string,
): Promise<{ completedCount: number; totalPaidOre: number }> {
  const { data } = await supabase
    .from('bookings')
    .select('status, total_amount_ore')
    .eq('buyer_id', profileId)

  if (!data?.length) return { completedCount: 0, totalPaidOre: 0 }

  let completedCount = 0
  let totalPaidOre = 0
  for (const b of data) {
    if (b.status === 'completed') {
      completedCount += 1
      totalPaidOre += (b.total_amount_ore as number) ?? 0
    }
  }
  return { completedCount, totalPaidOre }
}

export function countPendingSellerRequests(bookings: BookingRow[]): number {
  return bookings.filter((b) => b.status === 'pending').length
}
