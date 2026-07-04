import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { regions } from '../../data/regions'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center bg-brand-cream-light overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block text-brand-green font-semibold text-xs tracking-[0.15em] uppercase mb-6">
              One Card — Unlimited Savings
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-green-dark leading-tight tracking-tight"
          >
            One Card.
            <br />
            <span className="text-brand-green">Unlimited Local Savings.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl"
          >
            Support the businesses that make your community unique. One card, valid all year, unlimited use at every partner location.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
          >
            <Link
              to="/get-your-card"
              className="inline-flex items-center justify-center bg-brand-green-dark text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-brand-green transition-colors duration-200 min-h-[44px]"
            >
              Get Your Card — $25
            </Link>
            <Link
              to="/#regions"
              className="inline-flex items-center justify-center border-2 border-brand-green text-brand-green font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-brand-green-pale transition-colors duration-200 min-h-[44px]"
            >
              View Regions
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 sm:mt-16 grid grid-cols-3 gap-8 max-w-sm"
          >
            <div>
              <p className="font-bold text-3xl sm:text-4xl text-brand-green">5</p>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2">Regions</p>
            </div>
            <div>
              <p className="font-bold text-3xl sm:text-4xl text-brand-green">50+</p>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2">Partner<br />Businesses</p>
            </div>
            <div>
              <p className="font-bold text-3xl sm:text-4xl text-brand-green">$25</p>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2">All Year</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex justify-end"
        >
          <div className="relative">
            {/* Phone frame */}
            <div className="w-64 h-[520px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-brand-green-dark rounded-[2.4rem] overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="flex justify-between items-center px-5 pt-3 pb-2 text-white text-[11px]">
                  <span className="font-medium">9:41</span>
                  <div className="w-24 h-5 bg-gray-900 rounded-full" />
                  <div className="flex gap-1 items-center">
                    <div className="w-4 h-3 border border-white/80 rounded-sm">
                      <div className="w-3 h-full bg-white/80 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Wallet pass header */}
                <div className="px-4 py-3">
                  <p className="text-brand-cream/60 text-[10px] tracking-widest uppercase">Wallet</p>
                  <p className="text-brand-gold font-display font-bold text-lg tracking-wide">LOCAL DISCOUNT CARD</p>
                </div>

                {/* Cards list */}
                <div className="flex-1 px-3 pb-4 overflow-hidden flex flex-col gap-2">
                  {regions.map((region, i) => (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                      className="bg-brand-green rounded-xl px-4 py-3"
                    >
                      <p className="text-brand-gold font-display font-bold text-sm tracking-wide">
                        {region.name.toUpperCase()}
                      </p>
                      <p className="text-brand-cream/70 text-[10px] tracking-widest">DISCOUNT CARD</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
