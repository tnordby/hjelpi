export type HomeCategory = {
  id: 'fotografi' | 'hundepasning' | 'tryllekunstnere' | 'renhold' | 'handverker'
  href: string
  imageSrc: string
  icon: string
  large?: boolean
}

/* Real photography (Unsplash) — warm, people-first. See design/DESIGN.md. */
export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: 'fotografi',
    href: '/fotografi',
    imageSrc:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80',
    icon: 'photo_camera',
    large: true,
  },
  {
    id: 'hundepasning',
    href: '/dyrepass',
    imageSrc:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    icon: 'pets',
  },
  {
    id: 'tryllekunstnere',
    href: '/underholdning',
    imageSrc:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    icon: 'magic_button',
  },
  {
    id: 'renhold',
    href: '/renhold',
    imageSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    icon: 'cleaning_services',
  },
  {
    id: 'handverker',
    href: '/handverker',
    imageSrc:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    icon: 'handyman',
  },
]
