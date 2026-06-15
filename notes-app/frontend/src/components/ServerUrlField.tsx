import { useState } from 'react'
import { InvalidApiUrlError, normalizeApiUrl } from '@/api/apiConfig'
import { Input } from '@/components/ui/input'

/** User-visible validation message for a server URL, or null when valid. */
function getServerUrlValidationError(value: string): string | null {
  try {
    normalizeApiUrl(value)
    return null
  } catch (err) {
    if (err instanceof InvalidApiUrlError) return err.message
    return 'Enter a valid URL.'
  }
}

export interface ServerUrlFieldProps {
  id: string
  name?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Reveal validation before blur (e.g. after a failed form submit). */
  showValidation?: boolean
}

/** Controlled API server URL input with inline validation and accessible labels. */
export function ServerUrlField({
  id,
  name = 'serverUrl',
  value,
  onChange,
  disabled = false,
  showValidation = false,
}: ServerUrlFieldProps) {
  const [touched, setTouched] = useState(false)
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const validationError = getServerUrlValidationError(value)
  const showError = (touched || showValidation) && validationError !== null
  const describedBy = showError ? `${descriptionId} ${errorId}` : descriptionId

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        Your NotesMD server
      </label>
      <Input
        id={id}
        name={name}
        type="text"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        placeholder="https://notes.example.com"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        aria-invalid={showError || undefined}
        aria-describedby={describedBy}
      />
      <p id={descriptionId} className="text-muted-foreground text-sm">
        URL of your self-hosted NotesMD API (no path suffix).
      </p>
      {showError ? (
        <p id={errorId} className="error-text" role="alert">
          {validationError}
        </p>
      ) : null}
    </div>
  )
}
