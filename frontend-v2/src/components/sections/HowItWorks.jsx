import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Purchase Your Card',
    desc: 'Buy online for just $25. Choose digital, physical, or both.',
    icon: '🛒',
  },
  {
    number: '02',
    title: 'Add to Your Wallet',
    desc: 'Instantly add your digital pass to Apple Wallet or Google Pay.',
    icon: '📱',
  },
  {
    number: '03',
    title: 'Show at the Business',
    desc: 'Open the app, show your card, and let the savings begin.',
    icon: '🪪',
  },
  {
    number: '04',
    title: 'Enjoy the Savings',
    desc: 'Use your card unlimited times at any partner location all year.',
    icon: '🎉',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-brand-green-dark py-20 sm:py-28 px-4 sm:px-6">
      <div className="w-full max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-brand-cream font-semibold tracking-[0.1em] text-xs sm:text-sm uppercase mb-3">Simple Process</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">How It Works</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-brand-green rounded-lg p-6 sm:p-8 relative flex flex-col"
            >
              <span className="font-display text-4xl sm:text-5xl font-bold text-brand-green/40 mb-4">
                {step.number}
              </span>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3">{step.title}</h3>
              <p className="text-brand-cream/80 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
