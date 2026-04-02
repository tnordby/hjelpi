type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/** Structured data for SEO and answer engines (JSON-LD). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
