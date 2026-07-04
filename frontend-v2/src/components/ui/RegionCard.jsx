import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function RegionCard({ region, onBuyClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-brand-green rounded-lg overflow-hidden flex flex-col h-full"
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

      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        <div>
          <p className="text-white font-semibold text-sm sm:text-base">{region.name} Discount Card</p>
          <p className="text-brand-cream font-bold text-2xl sm:text-3xl mt-1">${region.price}</p>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={() => onBuyClick(region)}
            className="w-full bg-brand-cream text-brand-green-dark font-semibold py-3 sm:py-3.5 rounded-md hover:bg-brand-gold transition-colors duration-200 min-h-[44px] text-sm sm:text-base"
          >
            Buy
          </button>
          <Link
            to={`/regions/${region.slug}`}
            className="w-full text-center text-brand-cream/70 hover:text-brand-cream text-xs sm:text-sm transition-colors py-2 min-h-[44px] flex items-center justify-center"
          >
            View businesses →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
