import { motion } from 'framer-motion'
import { regions } from '../../data/regions'
import RegionCard from '../ui/RegionCard'

export default function RegionGrid({ onBuyClick }) {
  return (
    <section id="regions" className="py-20 px-4 bg-brand-cream-light">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-green font-semibold tracking-widest text-sm uppercase mb-3">Available Now</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand-green-dark">Choose Your Region</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Each card is specific to its region and gives you access to all partner businesses in that area.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
        >
          {regions.map((region) => (
            <motion.div
              key={region.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <RegionCard region={region} onBuyClick={onBuyClick} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
