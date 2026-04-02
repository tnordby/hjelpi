/**
 * Lowercase taxonomy labels for mid-sentence SEO and body copy (bokmål).
 * City names and person names should not be passed through this.
 */
export function seoLowercaseLabel(label: string): string {
  return label.trim().toLocaleLowerCase('nb-NO')
}
