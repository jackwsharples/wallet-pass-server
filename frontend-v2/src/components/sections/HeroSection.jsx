import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { regions } from '../../data/regions'

export default function HeroSection() {
  return (
    <section className="min-h-[88vh] flex items-center bg-brand-cream-light overflow-hidden relative">
      {/* Decorative background circle */}
      <div className="absolute -right-32 -top-32 w-[600px] h-[600px] bg-brand-cream rounded-full opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-brand-green text-brand-cream text-xs font-bold tracking-widest px-3 py-1.5 rounded-full mb-6">
              ONE CARD — UNLIMITED SAVINGS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-brand-green-dark leading-none tracking-tight"
          >
            <span className="block">ONE</span>
            <span className="block">CARD.</span>
            <span className="block text-brand-green">UNLIMITED</span>
            <span className="block">LOCAL</span>
            <span className="block">SAVINGS.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 text-gray-600 text-lg max-w-md"
          >
            Support the businesses that make your community unique. One card, valid all year, unlimited use at every partner location.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/get-your-card"
              className="bg-brand-green-dark text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-green hover:scale-[1.03] transition-all duration-200 shadow-lg shadow-brand-green/20"
            >
              Get Your Card — $25
            </Link>
            <Link
              to="/#regions"
              className="border-2 border-brand-green text-brand-green font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-green hover:text-white hover:scale-[1.03] transition-all duration-200"
            >
              View Regions
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-sm text-gray-500"
          >
            <div>
              <p className="font-bold text-2xl text-brand-green-dark">5</p>
              <p>Regions</p>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div>
              <p className="font-bold text-2xl text-brand-green-dark">50+</p>
              <p>Partner businesses</p>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div>
              <p className="font-bold text-2xl text-brand-green-dark">$25</p>
              <p>For the whole year</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
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

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="absolute -left-10 top-24 bg-white rounded-xl px-3 py-2 shadow-lg"
            >
              <p className="text-xs text-gray-500">Works with</p>
              <p className="text-sm font-bold text-brand-green-dark">Apple & Google Wallet</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
              className="absolute -right-8 bottom-28 bg-brand-green text-white rounded-xl px-3 py-2 shadow-lg"
            >
              <p className="text-xs text-brand-cream/70">Valid through</p>
              <p className="text-sm font-bold">Dec 31, {new Date().getFullYear()}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
