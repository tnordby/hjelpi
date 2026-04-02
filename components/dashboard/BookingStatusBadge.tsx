import { cn } from '@/lib/utils'

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-sky-100 text-sky-900',
  completed: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-neutral-200 text-neutral-700',
  disputed: 'bg-red-100 text-red-900',
}

type Props = {
  status: string
  label: string
}

export function BookingStatusBadge({ status, label }: Props) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusClass[status] ?? 'bg-surface-container-high text-on-surface-variant',
      )}
    >
      {label}
    </span>
  )
}
