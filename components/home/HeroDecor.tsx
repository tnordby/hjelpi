/** Abstract shapes (TaskRabbit-style) — Hjelpi palette, no layout impact */
export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute -right-[12%] -top-[8%] h-[min(55vw,28rem)] w-[min(55vw,28rem)] text-primary/[0.12] md:-right-[8%] md:h-[32rem] md:w-[32rem]"
        viewBox="0 0 400 400"
        fill="currentColor"
      >
        <path d="M280 40c60 20 100 80 95 150-5 85-75 150-160 145-70-4-130-55-145-120-18-75 25-155 95-180 25-9 52-8 78 0 12 4 24 9 37 5z" />
      </svg>
      <svg
        className="absolute -right-[5%] top-[18%] h-[min(40vw,18rem)] w-[min(40vw,18rem)] text-secondary/[0.18] md:h-80 md:w-80"
        viewBox="0 0 320 320"
        fill="currentColor"
      >
        <path d="M200 20c55 15 95 70 90 130-6 75-80 130-165 115-55-10-100-55-110-110-12-70 40-145 110-155 25-4 50-2 75 20z" />
      </svg>
      <div className="absolute right-[8%] top-[12%] h-16 w-16 rounded-full border-2 border-tertiary/30 md:right-[14%] md:top-[16%]" />
      <svg
        className="absolute -bottom-[10%] -left-[15%] h-[min(50vw,22rem)] w-[min(50vw,22rem)] text-primary-container/[0.2] md:-left-[10%] md:h-96 md:w-96"
        viewBox="0 0 360 360"
        fill="currentColor"
      >
        <path d="M80 280c-40-50-35-120 15-160 45-35 110-30 155 10 50 45 55 115 10 165-40 45-110 50-160 10-8-6-15-15-20-25z" />
      </svg>
      <div className="absolute bottom-[22%] left-[6%] hidden gap-1.5 md:grid md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-on-surface/10" />
        ))}
      </div>
    </div>
  )
}
