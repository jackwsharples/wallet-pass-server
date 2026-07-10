import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

// Hidden page — reached only by scanning the QR code on a wallet pass.
// Intentionally not linked anywhere in the site navigation.
export default function VerifyPage() {
  const { token } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function verify() {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/verify/' + encodeURIComponent(token))
        if (!res.ok) throw new Error('invalid')
        const data = await res.json()
        if (!cancelled) setResult(data)
      } catch {
        if (!cancelled) setError(true)
      }
    }
    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  const loading = !result && !error
  const active = result?.active === true

  return (
    <div className="min-h-screen bg-brand-cream-light flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <p className="text-sm uppercase tracking-widest text-neutral-500">Local Discount Card</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-green-dark mt-1">Pass Verification</h1>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full"></div>
            <p className="text-gray-600 mt-4">Verifying pass...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-red-200 text-center">
            <div className="bg-red-600 py-8">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white font-bold text-xl mt-3">Not Valid</p>
            </div>
            <p className="text-gray-600 text-sm p-6">
              This pass could not be verified. It may be invalid or no longer exist.
            </p>
          </div>
        )}

        {result && (
          <div
            className={`bg-white rounded-2xl overflow-hidden shadow-sm border text-center ${
              active ? 'border-green-200' : 'border-red-200'
            }`}
          >
            <div className={`py-8 ${active ? 'bg-brand-green' : 'bg-red-600'}`}>
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                {active ? (
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className="text-white font-bold text-xl mt-3">{active ? 'Active Member' : 'Expired / Inactive'}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Cardholder</p>
                <p className="text-lg font-semibold text-brand-green-dark">{result.holderName}</p>
              </div>
              {result.region && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Region</p>
                  <p className="text-neutral-700">{result.region}</p>
                </div>
              )}
              {result.validUntil && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    {active ? 'Valid Until' : 'Expired'}
                  </p>
                  <p className="text-neutral-700">
                    {new Date(result.validUntil).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
