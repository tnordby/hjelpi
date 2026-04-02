/** Display name from `profiles.first_name` + `profiles.last_name`. */
export function profileDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const f = typeof firstName === 'string' ? firstName.trim() : ''
  const l = typeof lastName === 'string' ? lastName.trim() : ''
  return [f, l].filter(Boolean).join(' ')
}
