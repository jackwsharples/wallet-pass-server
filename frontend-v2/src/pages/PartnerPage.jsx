import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PartnerPage() {
  const [form, setForm] = useState({ name: '', business: '', email: '', region: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire up form submission to backend/email service
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-brand-cream-light">
      <section className="bg-brand-green-dark py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-5xl font-bold text-white">PARTNER WITH US</h1>
          <p className="text-brand-cream/70 mt-3">Grow your local customer base.</p>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-16">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-green rounded-2xl p-10 text-center text-white"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="font-display text-3xl font-bold mb-2">Thanks for reaching out!</h2>
            <p className="text-brand-cream/80">We'll be in touch within 2–3 business days.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="font-display text-2xl font-bold text-brand-green-dark mb-2">Partner Inquiry</h2>
            <p className="text-gray-500 text-sm mb-6">
              Fill out the form below and our team will reach out to discuss partnership opportunities.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                { id: 'name', label: 'Your Name', placeholder: 'Jane Smith', type: 'text' },
                { id: 'business', label: 'Business Name', placeholder: 'My Local Shop', type: 'text' },
                { id: 'email', label: 'Email Address', placeholder: 'jane@example.com', type: 'email' },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block text-sm font-semibold text-brand-green-dark mb-1">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="region" className="block text-sm font-semibold text-brand-green-dark mb-1">
                  Region
                </label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
                >
                  <option value="">Select a region</option>
                  {['Boone, NC', 'Charleston, SC', 'Greenville, SC', 'Charlotte, NC', 'Columbia, SC'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-brand-green-dark mb-1">
                  Tell us about your business
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="What kind of discount would you offer cardholders?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-green text-white font-semibold py-3 rounded-xl hover:bg-brand-green-light hover:scale-[1.02] transition-all duration-200 mt-2"
              >
                Submit Inquiry
              </button>
            </form>
          </motion.div>
        )}
      </section>
    </div>
  )
}
