import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function AdminTestCheckout({ region, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (!user || user.role !== 'admin') {
    return null
  }

  const handleTestCheckout = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const sessionToken = localStorage.getItem('sessionToken')
      if (!sessionToken) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/test-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          regionId: region.id,
          metadata: {
            region: region.name,
            testMode: true,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Test checkout failed')
      }

      const data = await response.json()
      setSuccess(data)

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      console.error('Admin test checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚙️</span>
        <div className="flex-1">
          <p className="font-semibold text-yellow-900 mb-2">Admin Test Mode</p>
          <p className="text-sm text-yellow-800 mb-3">
            Bypass Stripe payment for testing. This generates a real confirmation code without charging.
          </p>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm"
            >
              <p className="font-semibold">✓ Test code generated</p>
              <p className="mt-1 font-mono text-base">{success.code}</p>
              <p className="text-xs mt-1 opacity-75">{success.message}</p>
            </motion.div>
          )}

          <button
            onClick={handleTestCheckout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Generating code...
              </>
            ) : (
              <>
                <span>🧪</span>
                Generate Test Code (No Stripe Charge)
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
