import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { redeemAndDownloadPass, isIOS, isSafari } from '../utils/redeemPass'

export default function RedeemPage() {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const onRightDevice = isIOS() && isSafari()

  async function handleRedeem(e) {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter your discount code.')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }

    setDownloading(true)
    setError(null)

    try {
      await redeemAndDownloadPass({ code, firstName, lastName })
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
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-green-dark">Redeem Your Code</h1>
          <p className="text-gray-600 mt-2">Enter your discount code to download your wallet pass</p>
        </div>

        {/* Device warning when not on iOS Safari */}
        {!onRightDevice && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 shadow-sm">
            <p className="text-amber-900 font-semibold text-sm">
              📱 You don't appear to be using Safari on an iPhone or iPad.
            </p>
            <p className="text-amber-800 text-sm mt-1">
              Wallet passes can only be added to Apple Wallet from <strong>Safari on the iOS device
              you want the card on</strong>. Open this page there before redeeming — your code only
              works once.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* One-time-use warning */}
          <div className="bg-brand-green-dark p-6 text-center">
            <p className="text-brand-cream/70 text-sm tracking-widest mb-2">BEFORE YOU REDEEM</p>
            <p className="text-brand-cream text-sm">
              Your code can only be redeemed <strong className="text-brand-gold">once</strong>.
              Make sure you're on the device you want this card on, using{' '}
              <strong className="text-brand-gold">Safari on iPhone or iPad</strong>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRedeem} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD1234EFGH"
                required
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
              />
            </div>

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

            <p className="text-xs text-gray-500">
              The name you enter will appear on the card and can't be changed after redeeming.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={downloading}
              className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
            >
              {downloading ? 'Generating pass...' : 'Redeem & Download Wallet Pass'}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Valid through December 31, {new Date().getFullYear()}
            </p>
          </div>
        </div>

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
