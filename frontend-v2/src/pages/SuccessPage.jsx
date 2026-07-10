import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')

  const [code, setCode] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function fetchCode() {
      if (!sessionId) {
        setError('Missing session ID. Please check your payment confirmation email.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/store-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripeSessionId: sessionId }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Could not retrieve code')
        }

        const data = await res.json()
        setCode(data.code)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Error retrieving your code. Please contact support.')
      } finally {
        setLoading(false)
      }
    }

    fetchCode()
  }, [sessionId])

  async function handleDownloadPass(e) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }

    setDownloading(true)
    setError(null)

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
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

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      if (isIOS) {
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
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error downloading pass. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream-light flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-green-dark">Payment Confirmed!</h1>
          <p className="text-gray-600 mt-2">Your discount card is ready to download</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full"></div>
            <p className="text-gray-600 mt-4">Retrieving your code...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-800 font-semibold mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

        {/* Success state */}
        {code && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Code display */}
            <div className="bg-brand-green-dark p-6 text-center">
              <p className="text-brand-cream/70 text-sm tracking-widest mb-2">YOUR DISCOUNT CODE</p>
              <p className="text-3xl font-bold text-brand-gold font-mono tracking-wider">{code}</p>
              <p className="text-brand-cream/60 text-xs mt-2">Save this code; it works once</p>
            </div>

            {/* Instructions */}
            <div className="p-6 bg-brand-cream/30">
              <p className="text-sm font-semibold text-brand-green-dark uppercase tracking-wider mb-3">
                How to redeem:
              </p>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-brand-green">1.</span>
                  <span>Enter your <strong>first and last name</strong> below</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-brand-green">2.</span>
                  <span>Tap <strong>Download Wallet Pass</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-brand-green">3.</span>
                  <span>Add it to Apple Wallet (or screenshot on Android)</span>
                </li>
              </ol>
              <p className="text-xs text-gray-500 mt-3 italic">
                💡 On iPhone? Use Safari for the best experience.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleDownloadPass} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={downloading}
                className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
              >
                {downloading ? 'Generating pass...' : 'Download Wallet Pass'}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Valid through December 31, {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Back to home link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-brand-green hover:text-brand-green-light transition-colors text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
