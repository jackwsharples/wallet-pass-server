import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const storedToken = localStorage.getItem('sessionToken')
        if (storedToken) {
          setSessionToken(storedToken)
          const response = await fetch(API_URL + '/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          })
          if (response.ok) {
            const { user } = await response.json()
            setUser(user)
          } else {
            localStorage.removeItem('sessionToken')
            setSessionToken(null)
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
        localStorage.removeItem('sessionToken')
        setSessionToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (googleToken) => {
    try {
      const response = await fetch(API_URL + '/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const { sessionToken, user: userData } = await response.json()
      const userWithRole = { ...userData, role: userData.role || 'user' }
      localStorage.setItem('sessionToken', sessionToken)
      setSessionToken(sessionToken)
      setUser(userWithRole)
      return userWithRole
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch(API_URL + '/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('sessionToken')
      setSessionToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
