'use client'

import * as React from 'react'
import { Icon } from './Icon'
import { Button } from './Button'

export type SearchFieldProps = {
  /** Placeholder text, e.g. "Hva trenger du hjelp til?" */
  placeholder?: string
  /** Label for the submit button. Default "Søk". */
  submitLabel?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Called with the query when the form submits. */
  onSubmit?: (value: string) => void
  className?: string
}

/** The signature Hjelpi search: white pill with a 2px ink outline and an ink submit button. */
export function SearchField({
  placeholder = 'Hva trenger du hjelp til?',
  submitLabel = 'Søk',
  value,
  defaultValue,
  onChange,
  onSubmit,
  className,
}: SearchFieldProps) {
  const [inner, setInner] = React.useState(defaultValue ?? '')
  const query = value !== undefined ? value : inner

  return (
    <form
      role="search"
      className={['hj-search', className ?? ''].filter(Boolean).join(' ')}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(query.trim())
      }}
    >
      <Icon name="search" className="hj-search__icon" />
      <input
        type="search"
        className="hj-search__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value)
          onChange?.(e.target.value)
        }}
        aria-label={placeholder}
      />
      <Button type="submit" size="md">
        {submitLabel}
      </Button>
    </form>
  )
}
