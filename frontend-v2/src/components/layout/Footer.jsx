import { Link } from 'react-router-dom'
import { regions } from '../../data/regions'

export default function Footer() {
  return (
    <footer className="bg-brand-green-dark text-brand-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <p className="font-display text-3xl font-bold text-brand-gold tracking-wide leading-none">LOCAL</p>
              <p className="text-brand-cream/60 text-xs tracking-[0.3em] font-semibold">DISCOUNT CARD</p>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Supporting local businesses while saving money. One card, unlimited savings, valid all year long.
            </p>
          </div>

          {/* Regions */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Regions</p>
            <ul className="flex flex-col gap-2">
              {regions.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/regions/${r.slug}`}
                    className="text-sm hover:text-brand-gold transition-colors"
                  >
                    {r.name}, {r.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Company</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'About', to: '/about' },
                { label: 'Partner With Us', to: '/partner' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Get Your Card', to: '/get-your-card' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-cream/50">
          <p>© {new Date().getFullYear()} Local Discount Card. All rights reserved.</p>
          <p>Made with love for local communities.</p>
        </div>
      </div>
    </footer>
  )
}
