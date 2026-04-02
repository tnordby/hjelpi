import { signOutAction } from '@/lib/auth/actions'

type Props = {
  label: string
  className?: string
}

export function SignOutForm({ label, className }: Props) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          className ??
          'w-full rounded-full border-2 border-primary py-3.5 font-bold text-primary transition-colors hover:bg-primary/5 sm:w-auto sm:px-8'
        }
      >
        {label}
      </button>
    </form>
  )
}
