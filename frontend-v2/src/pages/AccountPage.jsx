import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function AccountPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

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
                  <p className="text-neutral-700">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
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
