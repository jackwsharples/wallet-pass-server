import { motion } from 'framer-motion'

const categoryColors = {
  Restaurant: 'bg-orange-100 text-orange-700',
  Cafe: 'bg-amber-100 text-amber-700',
  Brewery: 'bg-yellow-100 text-yellow-700',
  Retail: 'bg-blue-100 text-blue-700',
  Sports: 'bg-green-100 text-green-700',
  Outdoor: 'bg-emerald-100 text-emerald-700',
  Bakery: 'bg-pink-100 text-pink-700',
  Health: 'bg-teal-100 text-teal-700',
  Tours: 'bg-purple-100 text-purple-700',
  Market: 'bg-lime-100 text-lime-700',
  'Food & Drink': 'bg-red-100 text-red-700',
  Arts: 'bg-violet-100 text-violet-700',
}

export default function BusinessCard({ business }) {
  const initials = business.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-brand-green-pale rounded-lg p-5 sm:p-6 flex flex-col gap-4 h-full border border-brand-green/10"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-brand-green-dark flex items-center justify-center flex-shrink-0">
        <span className="text-brand-gold font-display font-bold text-base sm:text-lg">{initials}</span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-brand-green-dark text-sm sm:text-base leading-snug">{business.name}</h3>
        <p className="text-brand-green font-medium text-xs sm:text-sm mt-1.5">{business.discount}</p>
      </div>

      <span
        className={`self-start text-xs font-semibold px-3 py-1 rounded-md ${
          categoryColors[business.category] ?? 'bg-neutral-100 text-neutral-600'
        }`}
      >
        {business.category}
      </span>
    </motion.div>
  )
}
