import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  { q: 'How does the Local Discount Card work?', a: 'After purchasing, you receive a digital pass that can be added to Apple Wallet or Google Pay. Simply show the card on your phone at any partner business to receive your discount.' },
  { q: 'How long is the card valid?', a: `The card is valid through December 31, ${new Date().getFullYear()}. Cards purchased at any point during the year are valid through year-end.` },
  { q: 'Can I use the card more than once?', a: 'Yes! The card provides unlimited use at all partner businesses throughout the validity period. Use it as often as you like.' },
  { q: 'Is there a physical card option?', a: 'Yes, you can choose digital-only or a digital + physical combo at checkout. Physical cards are mailed to the address you provide.' },
  { q: 'Can I buy a card as a gift?', a: "Absolutely. At checkout, select the 'purchasing as a gift' option to enter the recipient's details." },
  { q: 'What regions are available?', a: 'We currently serve Boone NC, Charleston SC, Greenville SC, Charlotte NC, and Columbia SC. More regions are coming soon.' },
  { q: 'How do I become a partner business?', a: "Visit our 'Partner With Us' page and fill out the inquiry form. Our team will be in touch within 2–3 business days." },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-brand-green-dark">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-brand-green text-2xl flex-shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-brand-cream-light">
      <section className="bg-brand-green-dark py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-5xl font-bold text-white">FAQ</h1>
          <p className="text-brand-cream/70 mt-3">Frequently asked questions.</p>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6"
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.q} faq={faq} />
          ))}
        </motion.div>
      </section>
    </div>
  )
}
