'use client'

import * as React from 'react'

export type TextFieldProps = {
  /** Visible label above the input. */
  label?: string
  /** Helper text under the input. Replaced by `error` when set. */
  hint?: string
  /** Error message; also switches the input to its invalid style. */
  error?: string
  /** Render a multiline textarea instead of a single-line input. */
  multiline?: boolean
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url'
  required?: boolean
  disabled?: boolean
  rows?: number
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  className?: string
}

/** Labelled input (or textarea via `multiline`) with hint and error states. */
export function TextField({
  label,
  hint,
  error,
  multiline,
  name,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  required,
  disabled,
  rows = 4,
  onChange,
  className,
}: TextFieldProps) {
  const id = React.useId()
  const messageId = hint || error ? `${id}-msg` : undefined
  const inputCls = ['hj-input', error ? 'hj-input--invalid' : ''].filter(Boolean).join(' ')
  const shared = {
    id,
    name,
    value,
    defaultValue,
    placeholder,
    required,
    disabled,
    onChange,
    className: inputCls,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': messageId,
  }

  return (
    <div className={['hj-field', className ?? ''].filter(Boolean).join(' ')}>
      {label ? (
        <label className="hj-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {multiline ? <textarea rows={rows} {...shared} /> : <input type={type} {...shared} />}
      {error ? (
        <p className="hj-field__error" id={messageId}>
          {error}
        </p>
      ) : hint ? (
        <p className="hj-field__hint" id={messageId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
