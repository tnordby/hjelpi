import { Resend } from 'resend'

let client: Resend | null = null

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.length && process.env.RESEND_FROM_EMAIL?.length,
  )
}

export function getResendClient(): Resend | null {
  if (!isResendConfigured()) return null
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY)
  }
  return client
}

type SendArgs = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Sends a transactional email via Resend. Throws if env is missing or the API returns an error.
 */
export async function sendResendEmail({ to, subject, html, replyTo }: SendArgs) {
  const resend = getResendClient()
  const from = process.env.RESEND_FROM_EMAIL
  if (!resend || !from) {
    throw new Error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)')
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
