import { useEffect, useRef, useState } from 'react'

async function copyTripId(tripId) {
  const normalizedId = String(tripId)

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(normalizedId)
    return true
  }

  const fallbackInput = document.createElement('textarea')
  fallbackInput.value = normalizedId
  fallbackInput.setAttribute('readonly', '')
  fallbackInput.style.position = 'absolute'
  fallbackInput.style.left = '-9999px'

  document.body.appendChild(fallbackInput)
  fallbackInput.select()

  const didCopy = document.execCommand('copy') // fallback para browsers antigos
  document.body.removeChild(fallbackInput)

  return didCopy
}

export default function TripIdentityBadge({ tripId }) {
  const [copyState, setCopyState] = useState('idle')
  const resetTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  async function handleCopyId() {
    try {
      const didCopy = await copyTripId(tripId)
      setCopyState(didCopy ? 'copied' : 'error')
    } catch {
      setCopyState('error')
    }

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
    }

    resetTimeoutRef.current = setTimeout(() => {
      setCopyState('idle')
    }, 1600)
  }

  const tripLabel = `#${tripId}`
  const helperText = copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Error' : ''

  return (
    <button
      type='button'
      className={copyState === 'copied' ? 'trip-id-button is-copied' : 'trip-id-button'}
      onClick={handleCopyId}
      aria-label={`${helperText}: ${tripLabel}`}
      title={helperText}
    >
      <span>{tripLabel}</span>
      <span className='trip-id-helper'>{helperText}</span>
    </button>
  )
}