import { Link } from '@/i18n/routing'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Variant = 'default' | 'inverse'

export function ServiceBreadcrumbs({
  items,
  variant = 'default',
  className,
}: {
  items: BreadcrumbItem[]
  variant?: Variant
  className?: string
}) {
  const inverse = variant === 'inverse'
  return (
    <nav aria-label="Brødsmuler" className={cn('mb-8', className)}>
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1 text-sm',
          inverse ? 'text-white/75' : 'text-on-surface-variant',
        )}
      >
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? (
              <MaterialIcon
                name="chevron_right"
                className={cn(
                  'text-base',
                  inverse ? 'text-white/40' : 'text-on-surface-variant/50',
                )}
                aria-hidden
              />
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'font-medium underline-offset-4 hover:underline',
                  inverse
                    ? 'text-white hover:text-white'
                    : 'text-primary hover:text-primary',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium',
                  inverse ? 'text-white' : 'text-on-surface',
                )}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
