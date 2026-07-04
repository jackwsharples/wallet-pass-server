import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { regions } from '../../data/regions'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [regionsOpen, setRegionsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRegionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navBase = 'text-white/85 hover:text-white font-medium transition-colors duration-150 text-sm'
  const activeClass = 'text-brand-gold'

  return (
    <header className="bg-brand-green-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none group">
            <span className="font-display text-2xl font-bold text-brand-gold tracking-wide group-hover:text-brand-cream transition-colors">
              LOCAL
            </span>
            <span className="text-brand-cream/80 text-[10px] tracking-[0.3em] font-semibold">
              DISCOUNT CARD
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink
              to="/about"
              className={({ isActive }) => `${navBase} ${isActive ? activeClass : ''}`}
            >
              About
            </NavLink>

            {/* Regions dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRegionsOpen(!regionsOpen)}
                className={`${navBase} flex items-center gap-1`}
              >
                Regions
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${regionsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {regionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
                  >
                    {regions.map((r) => (
                      <Link
                        key={r.id}
                        to={`/regions/${r.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-brand-green-dark hover:bg-brand-cream font-medium text-sm transition-colors"
                        onClick={() => setRegionsOpen(false)}
                      >
                        <span>{r.name}</span>
                        <span className="text-xs text-gray-400">{r.state}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/partner"
              className={({ isActive }) => `${navBase} ${isActive ? activeClass : ''}`}
            >
              Partner With Us
            </NavLink>

            <NavLink
              to="/faq"
              className={({ isActive }) => `${navBase} ${isActive ? activeClass : ''}`}
            >
              FAQ
            </NavLink>
          </nav>

          {/* CTA */}
          <Link
            to="/get-your-card"
            className="hidden md:inline-flex items-center border-2 border-white text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white hover:text-brand-green-dark transition-all duration-200"
          >
            GET YOUR CARD
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-brand-green border-t border-white/10 overflow-hidden"
          >
            <nav className="px-6 py-5 flex flex-col gap-5">
              <NavLink
                to="/about"
                className={({ isActive }) => `${navBase} text-base ${isActive ? activeClass : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                About
              </NavLink>

              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Regions</p>
                <div className="flex flex-col gap-2">
                  {regions.map((r) => (
                    <Link
                      key={r.id}
                      to={`/regions/${r.slug}`}
                      className="text-white/80 hover:text-white py-1 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {r.name}, {r.state}
                    </Link>
                  ))}
                </div>
              </div>

              <NavLink
                to="/partner"
                className={({ isActive }) => `${navBase} text-base ${isActive ? activeClass : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Partner With Us
              </NavLink>

              <NavLink
                to="/faq"
                className={({ isActive }) => `${navBase} text-base ${isActive ? activeClass : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                FAQ
              </NavLink>

              <Link
                to="/get-your-card"
                className="mt-1 w-full text-center border-2 border-white text-white font-semibold py-2.5 rounded-lg hover:bg-white hover:text-brand-green-dark transition-all"
                onClick={() => setMobileOpen(false)}
              >
                GET YOUR CARD
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
