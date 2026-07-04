import { motion } from 'framer-motion'
import BusinessCard from '../ui/BusinessCard'

export default function BusinessList({ businesses, regionName }) {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-brand-cream-light">
      <div className="w-full max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16 sm:mb-20"
        >
          <p className="text-brand-green font-semibold tracking-[0.1em] text-xs sm:text-sm uppercase mb-3">Partner Businesses</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-green-dark leading-tight">
            {regionName} — Where to Save
          </h2>
          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed">
            Show your card at any of these {businesses.length} partner businesses to receive your discount.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {businesses.map((biz) => (
            <motion.div
              key={biz.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
              }}
            >
              <BusinessCard business={biz} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
