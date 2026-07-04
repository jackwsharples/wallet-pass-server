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
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-gray-100 h-full"
    >
      {/* Logo placeholder */}
      <div className="w-12 h-12 rounded-xl bg-brand-green-dark flex items-center justify-center flex-shrink-0">
        <span className="text-brand-gold font-display font-bold text-lg">{initials}</span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-brand-green-dark text-base leading-snug mb-1">{business.name}</h3>
        <p className="text-brand-green font-medium text-sm">{business.discount}</p>
      </div>

      <span
        className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${
          categoryColors[business.category] ?? 'bg-gray-100 text-gray-600'
        }`}
      >
        {business.category}
      </span>
    </motion.div>
  )
}
