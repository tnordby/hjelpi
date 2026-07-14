/** Warm ambient washes behind the hero — no layout impact. */
export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-[10%] -top-[20%] h-[36rem] w-[36rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(194, 82, 29, 0.07), transparent 65%)',
        }}
      />
    </div>
  )
}
