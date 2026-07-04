import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRegion } from '../hooks/useRegion'
import BusinessList from '../components/sections/BusinessList'
import PurchaseModal from '../components/ui/PurchaseModal'

export default function RegionPage() {
  const region = useRegion()
  const [showModal, setShowModal] = useState(false)

  if (!region) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="font-display text-4xl font-bold text-brand-green-dark">Region Not Found</h1>
        <p className="text-gray-500">This region doesn't exist yet. Check back soon!</p>
        <Link to="/" className="text-brand-green font-semibold hover:underline">← Back to home</Link>
      </div>
    )
  }

  return (
    <>
      {/* Region hero */}
      <section className="bg-brand-green-dark py-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/" className="text-brand-cream/60 hover:text-brand-cream text-sm transition-colors mb-4 inline-block">
              ← All Regions
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-brand-gold font-semibold tracking-widest text-sm uppercase mb-1">
                  {region.state}
                </p>
                <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-none">
                  {region.name.toUpperCase()}
                </h1>
                <p className="text-brand-cream/70 text-lg mt-2">Discount Card</p>
                <p className="text-brand-cream/50 text-sm mt-1">
                  {region.businesses.length} partner businesses · Valid all year
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="text-center">
                  <p className="text-brand-gold font-bold text-4xl">${region.price}</p>
                  <p className="text-brand-cream/60 text-sm mb-3">per year</p>
                  {/* STRIPE INTEGRATION: onClick triggers Stripe Checkout */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-cream text-brand-green-dark font-bold px-8 py-3 rounded-xl hover:bg-brand-gold hover:scale-[1.03] transition-all duration-200 shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BusinessList businesses={region.businesses} regionName={region.name} />

      {/* Bottom CTA */}
      <section className="bg-brand-green py-14 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
            Ready to Start Saving?
          </h2>
          <p className="text-brand-cream/80 mb-6">
            Get your {region.name} Discount Card for just ${region.price}.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand-cream text-brand-green-dark font-bold px-10 py-3.5 rounded-xl hover:bg-brand-gold hover:scale-[1.03] transition-all duration-200 shadow-md"
          >
            Get Your Card — ${region.price}
          </button>
        </motion.div>
      </section>

      <PurchaseModal region={showModal ? region : null} onClose={() => setShowModal(false)} />
    </>
  )
}
