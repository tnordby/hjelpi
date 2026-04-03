import type { SupabaseClient } from '@supabase/supabase-js'
import { formatEarningsPeriodLabel, netSellerOre } from '@/lib/dashboard/money'
import { profileDisplayName } from '@/lib/profiles/display-name'

export type DashboardUserContext = {
  userId: string
  email: string
  profileId: string
  /** Trimmed `profiles.first_name` (empty if unset). */
  firstName: string
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

/** Paid bookings (Stripe) shown on Utbetalinger as invoice-style lines. */
export type SellerPayoutLine = {
  id: string
  status: string
  createdAt: string
  scheduledAt: string
  serviceTitle: string | null
  buyerName: string | null
  totalAmountOre: number
  baseAmountOre: number
  buyerFeeOre: number
  sellerFeeOre: number
  netOre: number
  stripePaymentIntentId: string
  stripeConnectTransferId: string | null
  sellerPayoutAt: string | null
  payoutReleased: boolean
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
  type ProfileRow = {
    id: string
    first_name?: string | null
    last_name?: string | null
    role: string
    active_mode?: string | null
  }

  const full = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, active_mode')
    .eq('user_id', userId)
    .maybeSingle()

  let profile: ProfileRow | null = null

  if (full.error) {
    // Keep in sync with resolveAccountHrefAfterAuth (id + role). A wider select can error on
    // schema drift while the minimal select still works — that used to send users to /min-konto in a loop.
    const minimal = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', userId)
      .maybeSingle()
    if (minimal.error || !minimal.data) return null
    profile = {
      id: minimal.data.id as string,
      role: minimal.data.role as string,
      first_name: null,
      last_name: null,
      active_mode: null,
    }
  } else if (!full.data) {
    return null
  } else {
    profile = full.data as ProfileRow
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  const roleRaw = profile.role
  const role: DashboardUserContext['role'] =
    roleRaw === 'buyer' || roleRaw === 'seller' || roleRaw === 'admin'
      ? roleRaw
      : 'buyer'

  const providerId = provider?.id ?? null
  const isSeller = role === 'seller' && Boolean(providerId)
  const rawMode = profile.active_mode
  const activeMode: DashboardUserContext['activeMode'] =
    rawMode === 'seller' ? 'seller' : 'buyer'

  const firstName =
    typeof profile.first_name === 'string' ? profile.first_name.trim() : ''

  return {
    userId,
    email,
    profileId: profile.id,
    firstName,
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

const PAYOUT_LINES_LIMIT = 100

export async function fetchSellerPayoutLines(
  supabase: SupabaseClient,
  providerId: string,
): Promise<SellerPayoutLine[]> {
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
      created_at,
      total_amount_ore,
      base_amount_ore,
      buyer_fee_ore,
      seller_fee_ore,
      stripe_payment_intent_id,
      stripe_connect_transfer_id,
      seller_payout_at,
      buyer_id,
      provider_services ( title )
    `,
    )
    .in('provider_service_id', serviceIds)
    .not('stripe_payment_intent_id', 'is', null)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(PAYOUT_LINES_LIMIT)

  if (error || !data?.length) return []

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

  return data
    .map((row) => {
      const pi = row.stripe_payment_intent_id as string | null
      if (!pi || pi.length === 0) return null
      const base = (row.base_amount_ore as number) ?? 0
      const buyerFee = (row.buyer_fee_ore as number) ?? 0
      const fee = (row.seller_fee_ore as number) ?? 0
      const ps = row.provider_services as { title: string } | { title: string }[] | null
      const title =
        ps == null ? null : Array.isArray(ps) ? ps[0]?.title ?? null : ps.title
      const bid = row.buyer_id as string
      const transferId =
        typeof row.stripe_connect_transfer_id === 'string' && row.stripe_connect_transfer_id.length > 0
          ? row.stripe_connect_transfer_id
          : null
      const payoutAt =
        typeof row.seller_payout_at === 'string' && row.seller_payout_at.length > 0
          ? row.seller_payout_at
          : null
      return {
        id: row.id as string,
        status: row.status as string,
        createdAt: row.created_at as string,
        scheduledAt: row.scheduled_at as string,
        serviceTitle: title,
        buyerName: buyerNames.get(bid) ?? null,
        totalAmountOre: row.total_amount_ore as number,
        baseAmountOre: base,
        buyerFeeOre: buyerFee,
        sellerFeeOre: fee,
        netOre: netSellerOre(base, fee),
        stripePaymentIntentId: pi,
        stripeConnectTransferId: transferId,
        sellerPayoutAt: payoutAt,
        payoutReleased: Boolean(transferId),
      }
    })
    .filter((r): r is SellerPayoutLine => r !== null)
}

export type EarningsSummary = {
  completedCount: number
  netOre: number
  pendingIncoming: number
  /** Net (base − seller fee) already transferred to Stripe Connect */
  netTransferredToConnectOre: number
  /** Net still on platform (paid customer, Connect transfer not done yet) */
  netHeldOnPlatformOre: number
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
    return {
      completedCount: 0,
      netOre: 0,
      pendingIncoming: 0,
      netTransferredToConnectOre: 0,
      netHeldOnPlatformOre: 0,
    }
  }

  const serviceIds = services.map((s) => s.id as string)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('status, base_amount_ore, seller_fee_ore, stripe_payment_intent_id, stripe_connect_transfer_id')
    .in('provider_service_id', serviceIds)

  if (!bookings?.length) {
    return {
      completedCount: 0,
      netOre: 0,
      pendingIncoming: 0,
      netTransferredToConnectOre: 0,
      netHeldOnPlatformOre: 0,
    }
  }

  let netOre = 0
  let completedCount = 0
  let pendingIncoming = 0
  let netTransferredToConnectOre = 0
  let netHeldOnPlatformOre = 0

  for (const b of bookings) {
    const status = b.status as string
    const base = (b.base_amount_ore as number) ?? 0
    const fee = (b.seller_fee_ore as number) ?? 0
    const net = Math.max(0, base - fee)
    const row = b as {
      stripe_payment_intent_id?: string | null
      stripe_connect_transfer_id?: string | null
    }
    const paid = Boolean(row.stripe_payment_intent_id)
    const transferred = Boolean(
      row.stripe_connect_transfer_id && String(row.stripe_connect_transfer_id).length > 0,
    )
    if (status === 'completed') {
      completedCount += 1
      netOre += net
    }
    if (status === 'pending' || status === 'confirmed') {
      pendingIncoming += 1
    }
    if (paid && !transferred && status !== 'cancelled') {
      netHeldOnPlatformOre += net
    }
    if (paid && transferred) {
      netTransferredToConnectOre += net
    }
  }

  return {
    completedCount,
    netOre,
    pendingIncoming,
    netTransferredToConnectOre,
    netHeldOnPlatformOre,
  }
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

/** Unread incoming messages + pending booking activity for the global nav bell. */
export type NavbarNotificationCounts = {
  unreadMessages: number
  pendingBuyer: number
  pendingSeller: number
  messagesHref: string
  buyerBookingsHref: string
  sellerRequestsHref: string
}

async function countSellerPendingBookings(
  supabase: SupabaseClient,
  providerId: string,
): Promise<number> {
  const { data: services } = await supabase
    .from('provider_services')
    .select('id')
    .eq('provider_id', providerId)

  const ids = services?.map((s) => s.id as string) ?? []
  if (!ids.length) return 0

  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('provider_service_id', ids)
    .eq('status', 'pending')

  return count ?? 0
}

export async function fetchNavbarNotificationCounts(
  supabase: SupabaseClient,
  ctx: DashboardUserContext,
): Promise<NavbarNotificationCounts> {
  const profileId = ctx.profileId

  const unreadReq = supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
    .neq('sender_id', profileId)

  const buyerPendingReq = supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_id', profileId)
    .eq('status', 'pending')

  const sellerPendingReq = ctx.providerId
    ? countSellerPendingBookings(supabase, ctx.providerId)
    : Promise.resolve(0)

  const [{ count: unread }, { count: buyerPending }, sellerPending] = await Promise.all([
    unreadReq,
    buyerPendingReq,
    sellerPendingReq,
  ])

  const messagesHref =
    ctx.activeMode === 'seller'
      ? '/min-side/hjelper/meldinger'
      : '/min-side/kunde/meldinger'

  return {
    unreadMessages: unread ?? 0,
    pendingBuyer: buyerPending ?? 0,
    pendingSeller: sellerPending,
    messagesHref,
    buyerBookingsHref: '/min-side/kunde/bestillinger',
    sellerRequestsHref: '/min-side/hjelper/foresporsler',
  }
}
