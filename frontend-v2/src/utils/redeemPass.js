// Redeems a code against the backend and hands the returned .pkpass to the browser.
// Throws with a user-facing message on failure.
export async function redeemAndDownloadPass({ code, firstName, lastName }) {
  const res = await fetch(import.meta.env.VITE_API_URL + '/api/redeem-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Invalid or used code')
  }

  const arrayBuffer = await res.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: 'application/vnd.apple.pkpass' })
  const url = URL.createObjectURL(blob)

  if (isIOS()) {
    // Safari on iOS opens the pass directly in the Apple Wallet prompt
    window.location.href = url
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = 'discount_card.pkpass'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

export function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function isSafari() {
  // Chrome/Firefox/Edge on iOS include CriOS/FxiOS/EdgiOS in the UA
  return /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios|edgios|android/i.test(navigator.userAgent)
}
