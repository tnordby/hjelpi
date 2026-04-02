import { cn } from '@/lib/utils'

type Props = {
  name: string
  className?: string
  filled?: boolean
}

export function MaterialIcon({ name, className, filled }: Props) {
  return (
    <span
      className={cn(
        'material-symbols-outlined select-none',
        filled && 'filled',
        className,
      )}
      aria-hidden
    >
      {name}
    </span>
  )
}
