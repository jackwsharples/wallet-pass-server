import { useState } from 'react'
import HeroSection from '../components/sections/HeroSection'
import HowItWorks from '../components/sections/HowItWorks'
import RegionGrid from '../components/sections/RegionGrid'
import PurchaseModal from '../components/ui/PurchaseModal'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState(null)

  return (
    <>
      <HeroSection />
      <HowItWorks />
      <RegionGrid onBuyClick={setSelectedRegion} />

      {/* Value prop strip */}
      <section className="bg-brand-cream-light py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand-green-dark mb-4">
              Support Local, Save Money.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              The best way to support local businesses while saving money. It is our mission to make
              supporting local businesses easier.
            </p>
          </motion.div>
        </div>
      </section>

      <PurchaseModal region={selectedRegion} onClose={() => setSelectedRegion(null)} />
    </>
  )
}
