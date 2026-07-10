import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function CardItem({ card }) {
  const unused = card.status === 'UNUSED'
  const expired = new Date(card.validUntil).getTime() < Date.now()

  return (
    <div className="bg-white rounded-lg border border-brand-green/20 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-brand-green-dark">
            {card.region || 'Local Discount Card'}
            {card.isGift && (
              <span className="ml-2 text-xs font-medium bg-brand-gold/20 text-brand-green-dark px-2 py-0.5 rounded-full">
                🎁 Gift
              </span>
            )}
          </p>
          <p className="font-mono text-lg tracking-wider text-brand-green-dark mt-1">{card.code}</p>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
            expired
              ? 'bg-gray-100 text-gray-500'
              : unused
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {expired ? 'Expired' : unused ? 'Not redeemed' : 'Redeemed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Purchased</p>
          <p className="text-neutral-700">{formatDate(card.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Valid Until</p>
          <p className="text-neutral-700">{formatDate(card.validUntil)}</p>
        </div>
        {card.usedAt && (
          <div className="col-span-2">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Redeemed On</p>
            <p className="text-neutral-700">{formatDate(card.usedAt)}</p>
          </div>
        )}
      </div>

      {unused && !expired && (
        <Link
          to="/redeem"
          className="inline-block mt-4 text-sm font-semibold text-brand-green hover:text-brand-green-light transition-colors"
        >
          Redeem this card →
        </Link>
      )}
    </div>
  )
}

export default function AccountPage() {
  const { user, logout, loading, sessionToken } = useAuth()
  const navigate = useNavigate()

  const [cards, setCards] = useState(null)
  const [cardsError, setCardsError] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user || !sessionToken) return
    let cancelled = false

    async function fetchCards() {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/my-cards', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Could not load your cards')
        }
        const data = await res.json()
        if (!cancelled) setCards(data.cards)
      } catch (err) {
        console.error(err)
        if (!cancelled) setCardsError(err.message)
      }
    }

    fetchCards()
    return () => {
      cancelled = true
    }
  }, [user, sessionToken])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <p className="text-neutral-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="w-full max-w-[600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-green-dark mb-4">My Account</h1>
          <p className="text-neutral-600 mb-10">Manage your Local Discount Card account.</p>

          <div className="bg-brand-green-pale rounded-lg p-8 sm:p-10">
            <div className="flex items-center gap-6 mb-8">
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.name || 'Profile'}
                  className="w-16 h-16 rounded-full border-2 border-brand-green"
                />
              )}
              <div>
                <p className="text-sm text-neutral-600 mb-1">Logged in as</p>
                <p className="font-semibold text-lg text-brand-green-dark">{user.name || 'User'}</p>
                <p className="text-sm text-neutral-600">{user.email}</p>
              </div>
            </div>

            {/* My Cards */}
            <div className="border-t border-brand-green/20 pt-8 mb-8">
              <h2 className="font-semibold text-brand-green-dark mb-6">My Cards</h2>

              {cardsError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{cardsError}</p>
              )}

              {!cardsError && cards === null && <p className="text-sm text-neutral-600">Loading your cards...</p>}

              {!cardsError && cards && cards.length === 0 && (
                <div className="text-sm text-neutral-600">
                  <p>No cards found for {user.email}.</p>
                  <p className="mt-2">
                    Cards purchased with a different email won't show here.{' '}
                    <Link to="/get-your-card" className="text-brand-green font-semibold hover:text-brand-green-light">
                      Get your first card →
                    </Link>
                  </p>
                </div>
              )}

              {!cardsError && cards && cards.length > 0 && (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <CardItem key={card.code} card={card} />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-brand-green/20 pt-8">
              <h2 className="font-semibold text-brand-green-dark mb-6">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-neutral-700">{user.email}</p>
                </div>
                {user.name && (
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Name</p>
                    <p className="text-neutral-700">{user.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-neutral-700">{formatDate(user.createdAt) || '—'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-8 bg-brand-green-dark text-white font-semibold py-3 rounded-md hover:bg-brand-green transition-colors duration-200 min-h-[44px]"
            >
              Log Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
