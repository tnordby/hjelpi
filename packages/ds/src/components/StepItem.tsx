import * as React from 'react'

export type StepItemProps = {
  /** 1-based step number, shown on the tilted terracotta tag. */
  number: number
  title: string
  children?: React.ReactNode
  /** Draw the dotted connector line after the number (hide on the last step). */
  connector?: boolean
  className?: string
}

/** One step in a "how it works" flow: tilted terracotta number tag + dotted connector. Render inside an <ol>. */
export function StepItem({ number, title, children, connector = true, className }: StepItemProps) {
  return (
    <li className={['hj-step', className ?? ''].filter(Boolean).join(' ')}>
      <div className="hj-step__marker">
        <span className="hj-step__number" aria-hidden>
          {number}
        </span>
        {connector ? <span className="hj-step__connector" aria-hidden /> : null}
      </div>
      <h3 className="hj-step__title">{title}</h3>
      {children ? <p className="hj-step__body">{children}</p> : null}
    </li>
  )
}
