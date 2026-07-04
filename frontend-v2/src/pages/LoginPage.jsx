import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import GoogleLoginButton from '../components/ui/GoogleLoginButton'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/account')
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-green-dark mb-3">Sign In</h1>
          <p className="text-neutral-600">Access your Local Discount Card account and manage your purchases.</p>
        </div>

        <div className="bg-brand-green-pale rounded-lg p-8 sm:p-10">
          <GoogleLoginButton />

          <div className="mt-8 pt-8 border-t border-brand-green/20">
            <p className="text-sm text-neutral-600 text-center">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-600 mt-8">
          New to Local Discount Card?
          <br />
          <a href="/get-your-card" className="text-brand-green font-semibold hover:text-brand-green-light transition-colors">
            Get your first card
          </a>
        </p>
      </motion.div>
    </div>
  )
}
