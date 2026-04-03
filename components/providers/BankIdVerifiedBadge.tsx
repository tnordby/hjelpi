import { cn } from '@/lib/utils'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

type Props = {
  /** Tooltip, aria-label, and optional visible label */
  label: string
  /** Show “BankID verifisert” text after the blue badge (e.g. under the name on profile). */
  showText?: boolean
  className?: string
}

/** Compact verified treatment: white check on primary teal (brand), not generic “social blue”. */
export function BankIdVerifiedBadge({ label, showText = false, className }: Props) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label={showText ? undefined : label}
      role={showText ? undefined : 'img'}
    >
      <span
        className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container shadow-sm ring-1 ring-primary/15"
        title={label}
        aria-hidden
      >
        <MaterialIcon name="check" filled className="text-[11px] leading-none text-on-primary" />
      </span>
      {showText ? (
        <span className="text-sm font-semibold tracking-tight text-primary">{label}</span>
      ) : null}
    </span>
  )
}
