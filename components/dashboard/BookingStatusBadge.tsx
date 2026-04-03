import { cn } from '@/lib/utils'

const statusClass: Record<string, string> = {
  pending: 'bg-tertiary/12 text-tertiary ring-1 ring-tertiary/20',
  confirmed: 'bg-secondary-container/70 text-on-secondary-container ring-1 ring-secondary/15',
  completed: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  cancelled: 'bg-on-surface/[0.06] text-on-surface-variant ring-1 ring-outline-variant/25',
  disputed: 'bg-error-container/90 text-on-error-container ring-1 ring-error/20',
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
