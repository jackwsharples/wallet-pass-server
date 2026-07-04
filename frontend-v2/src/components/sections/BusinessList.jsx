import { motion } from 'framer-motion'
import BusinessCard from '../ui/BusinessCard'

export default function BusinessList({ businesses, regionName }) {
  return (
    <section className="py-16 px-4 bg-brand-cream-light">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-brand-green font-semibold tracking-widest text-sm uppercase mb-2">Partner Businesses</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-green-dark">
            {regionName} — Where to Save
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
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
