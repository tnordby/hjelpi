import { getTranslations } from 'next-intl/server'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

type Props = {
  locale: string
}

/** Shown for customers (no helper profile) so the page still mentions BankID without a full verification card. */
export async function SettingsBankIdBuyerHint({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'dashboard.settingsPage.bankId' })

  return (
    <section
      className="flex gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-low/60 px-4 py-3 text-sm text-on-surface-variant ring-1 ring-outline-variant/10 md:px-5 md:py-4"
      aria-label={t('title')}
    >
      <MaterialIcon name="info" className="mt-0.5 shrink-0 text-xl text-on-surface-variant" />
      <p className="leading-relaxed">{t('buyerHint')}</p>
    </section>
  )
}
