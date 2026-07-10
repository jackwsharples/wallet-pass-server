import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Button from './Button'
import { useAuth } from '../../contexts/AuthContext'

export default function PurchaseModal({ region, onClose }) {
  const [isGift, setIsGift] = useState(false)

  const priceId = 'price_1Trgjm07SOA5o1E712jcRYV5'
  const price = '0.50'
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          email: user?.email || undefined,
          metadata: {
            region: region.id,
            regionName: region.name,
            format: 'digital',
            isGift: isGift.toString(),
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Checkout failed')
      }

      const data = await res.json()
      window.location.href = data.url
    } catch (err) {
      alert('Error: ' + (err.message || 'Could not start checkout'))
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {region && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-green-dark p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="font-display text-2xl font-bold text-brand-gold tracking-wide">
                {region.name.toUpperCase()}
              </p>
              <p className="text-brand-cream text-sm tracking-widest">DISCOUNT CARD</p>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              {/* Format info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-cream/30 border border-brand-green/20">
                <div className="flex-1">
                  <p className="font-semibold text-brand-green-dark text-sm">Digital Wallet Pass</p>
                  <p className="text-gray-500 text-xs mt-1">Add to Apple or Google Wallet instantly</p>
                </div>
                <p className="font-bold text-brand-green text-lg">${price}</p>
              </div>

              {/* Gift toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="w-4 h-4 accent-brand-green"
                />
                <span className="text-sm text-gray-600">Purchasing as a gift</span>
              </label>

              {/* CTA */}
              <Button
                variant="secondary"
                className="w-full text-base py-3"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Loading...' : `Continue to Checkout — $${price}`}
              </Button>

              <p className="text-center text-xs text-gray-400">
                Valid through December 31, {new Date().getFullYear()}. Secure checkout via Stripe.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
