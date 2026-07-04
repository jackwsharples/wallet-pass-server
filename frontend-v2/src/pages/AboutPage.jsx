import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-cream-light">
      <section className="bg-brand-green-dark py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-5xl font-bold text-white">ABOUT US</h1>
          <p className="text-brand-cream/70 mt-3">Our mission, our story.</p>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="prose prose-lg max-w-none"
        >
          <h2 className="font-display text-3xl font-bold text-brand-green-dark mb-4">
            What is the Local Discount Card?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The Local Discount Card is the best way to support local businesses while saving money. It is our
            mission to make supporting local businesses easier for community members and visitors alike.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            For just $25, you get access to exclusive discounts at dozens of local businesses in your region
            — restaurants, breweries, shops, and more. The card is valid for an entire calendar year, with
            unlimited use at every partner location.
          </p>
          <div className="bg-brand-cream rounded-2xl p-8 my-8">
            <h3 className="font-display text-2xl font-bold text-brand-green-dark mb-3">Our Mission</h3>
            <p className="text-gray-600">
              We believe local businesses are the backbone of thriving communities. By making it easy and
              rewarding to shop local, we help businesses grow while giving residents and visitors a reason to
              explore their neighborhood.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
