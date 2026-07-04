import { useState } from 'react'
import { motion } from 'framer-motion'
import { regions } from '../data/regions'
import PurchaseModal from '../components/ui/PurchaseModal'

export default function GetYourCard() {
  const [selectedRegion, setSelectedRegion] = useState(null)

  return (
    <div className="min-h-screen bg-brand-cream-light">
      {/* Header */}
      <section className="bg-brand-green-dark py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white">GET YOUR CARD</h1>
          <p className="text-brand-cream/70 mt-3 text-lg">Choose a region to get started</p>
        </motion.div>
      </section>

      {/* Regions */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regions.map((region) => (
            <motion.div
              key={region.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            >
              {/* Card visual */}
              <div className="bg-brand-green-dark p-8 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-brand-gold tracking-wide">
                    {region.name.toUpperCase()}
                  </p>
                  <p className="text-brand-cream/70 text-xs tracking-widest mt-1">DISCOUNT CARD</p>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-brand-green-dark">{region.name} Discount Card</p>
                  <p className="font-bold text-brand-green text-xl">${region.price}</p>
                </div>
                <p className="text-gray-400 text-xs mb-4">{region.businesses.length} partner businesses · Valid all year</p>

                {/* STRIPE INTEGRATION: onClick should initiate Stripe Checkout session for this region */}
                <button
                  onClick={() => setSelectedRegion(region)}
                  className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-xl hover:bg-brand-green-light hover:scale-[1.02] transition-all duration-200"
                >
                  Buy Now — ${region.price}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-16 bg-brand-cream rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
        >
          {[
            { icon: '📱', title: 'Instant Digital Delivery', desc: 'Add to Apple or Google Wallet within minutes of purchase.' },
            { icon: '♾️', title: 'Unlimited Use', desc: 'Use your card as many times as you like at any partner business.' },
            { icon: '📅', title: 'Valid All Year', desc: `Good through December 31, ${new Date().getFullYear()}.` },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="font-semibold text-brand-green-dark mb-1">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <PurchaseModal region={selectedRegion} onClose={() => setSelectedRegion(null)} />
    </div>
  )
}
