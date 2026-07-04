import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function RegionCard({ region, onBuyClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.18)' }}
      transition={{ duration: 0.25 }}
      className="bg-brand-green rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Card graphic */}
      <Link to={`/regions/${region.slug}`} className="block">
        <div className="bg-brand-green-dark aspect-[4/3] flex items-center justify-center p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
            }}
          />
          <div className="text-center z-10">
            <p className="font-display text-3xl font-bold text-brand-gold tracking-wide leading-none">
              {region.name.toUpperCase()}
            </p>
            <p className="text-brand-cream text-xs tracking-[0.25em] mt-1 font-semibold">DISCOUNT CARD</p>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-white font-semibold">{region.name} Discount Card</p>
          <p className="text-brand-gold font-bold text-xl">${region.price}</p>
        </div>

        <div className="flex flex-col gap-2">
          {/* STRIPE INTEGRATION: Replace this button's onClick with Stripe Checkout session creation */}
          <button
            onClick={() => onBuyClick(region)}
            className="w-full bg-brand-cream text-brand-green-dark font-semibold py-2.5 rounded-lg hover:bg-brand-gold hover:scale-[1.02] transition-all duration-200 shadow-sm"
          >
            Buy
          </button>
          <Link
            to={`/regions/${region.slug}`}
            className="w-full text-center text-brand-cream/80 hover:text-brand-cream text-sm transition-colors"
          >
            View businesses →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
