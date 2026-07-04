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
    <section className="bg-brand-green-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-gold font-semibold tracking-widest text-sm uppercase mb-3">Simple Process</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">How It Works</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-brand-green rounded-2xl p-6 relative"
            >
              <span className="font-display text-5xl font-bold text-brand-green-dark/60 absolute top-4 right-4">
                {step.number}
              </span>
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-brand-cream/80 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
