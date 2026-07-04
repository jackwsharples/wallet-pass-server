import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Button from './Button'

export default function PurchaseModal({ region, onClose }) {
  const [format, setFormat] = useState('digital')
  const [isGift, setIsGift] = useState(false)

  const formatOptions = [
    { id: 'digital', label: 'Digital Only', desc: 'Add to Apple or Google Wallet instantly', price: 25 },
    { id: 'both', label: 'Digital + Physical', desc: 'Digital pass + physical card mailed to you', price: 30 },
  ]

  const selected = formatOptions.find((f) => f.id === format)

  function handleCheckout() {
    // STRIPE INTEGRATION POINT:
    // Call your backend endpoint here to create a Stripe Checkout session.
    // Example:
    //   const res = await fetch('/api/checkout', {
    //     method: 'POST',
    //     body: JSON.stringify({ regionId: region.id, format, isGift, price: selected.price }),
    //   })
    //   const { url } = await res.json()
    //   window.location.href = url
    alert('Stripe checkout coming soon!')
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
              {/* Format selection */}
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose Format</p>
                <div className="flex flex-col gap-2">
                  {formatOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        format === opt.id
                          ? 'border-brand-green bg-brand-cream/30'
                          : 'border-gray-200 hover:border-brand-green/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={opt.id}
                        checked={format === opt.id}
                        onChange={() => setFormat(opt.id)}
                        className="accent-brand-green"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-brand-green-dark text-sm">{opt.label}</p>
                        <p className="text-gray-500 text-xs">{opt.desc}</p>
                      </div>
                      <p className="font-bold text-brand-green">${opt.price}</p>
                    </label>
                  ))}
                </div>
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
              <Button variant="secondary" className="w-full text-base py-3" onClick={handleCheckout}>
                Continue to Checkout — ${selected.price}
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
