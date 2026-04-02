import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('providers')
    .select('profiles(first_name, last_name)')
    .eq('id', id)
    .maybeSingle()

  let name = 'Hjelper'
  if (data?.profiles) {
    const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    if (p && typeof p === 'object') {
      const display = profileDisplayName(
        'first_name' in p ? (p.first_name as string | null) : null,
        'last_name' in p ? (p.last_name as string | null) : null,
      )
      if (display.length > 0) name = display
    }
  }

  return {
    title: `${name} | Hjelpi`,
    description: `Profil for ${name} på Hjelpi.`,
  }
}

export default async function HjelperProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('providers')
    .select(
      `
      id,
      bio,
      avg_rating,
      total_reviews,
      is_verified,
      profiles (first_name, last_name, avatar_url, deleted_at)
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) notFound()

  const rawProfile = data.profiles
  const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile

  const publicName = profileDisplayName(
    profile && typeof profile === 'object' && 'first_name' in profile
      ? (profile.first_name as string | null)
      : null,
    profile && typeof profile === 'object' && 'last_name' in profile
      ? (profile.last_name as string | null)
      : null,
  )

  if (
    !profile ||
    typeof profile !== 'object' ||
    publicName.length === 0 ||
    ('deleted_at' in profile && profile.deleted_at != null)
  ) {
    notFound()
  }

  const rating = data.avg_rating != null ? Number(data.avg_rating) : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 shadow-sm md:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-container-low sm:mx-0">
                {'avatar_url' in profile && profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40">
                    <MaterialIcon name="person" className="text-5xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1 className="font-headline text-3xl font-extrabold text-primary">
                  {publicName}
                </h1>
                {data.is_verified ? (
                  <p className="mt-2 text-sm font-semibold text-primary">Verifisert hjelper</p>
                ) : null}
                {data.total_reviews > 0 ? (
                  <p className="mt-2 text-on-surface-variant">
                    {rating.toFixed(1)} av 5 · {data.total_reviews} vurderinger
                  </p>
                ) : null}
                {data.bio ? (
                  <p className="mt-4 whitespace-pre-wrap text-on-surface">{data.bio}</p>
                ) : (
                  <p className="mt-4 text-on-surface-variant">Ingen beskrivelse ennå.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
