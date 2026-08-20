import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

/**
 * Mock users for authentication
 */
const MOCK_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin',
    avatar: null,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    password: 'sarah123',
    role: 'sub_admin',
    avatar: null,
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@company.com',
    password: 'michael123',
    role: 'sub_admin',
    avatar: null,
  },
]

/**
 * AuthProvider component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('auth_user')
      const token = localStorage.getItem('auth_token')
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Login function
   * Validates credentials and sets user session
   */
  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Find user
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    )

    if (!foundUser) {
      throw new Error('Invalid email or password')
    }

    // Create session
    const { password: _, ...userWithoutPassword } = foundUser
    const token = 'mock_token_' + Date.now()

    // Store in localStorage
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
    localStorage.setItem('auth_token', token)

    setUser(userWithoutPassword)

    return userWithoutPassword
  }

  /**
   * Logout function
   * Clears user session
   */
  const logout = () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    if (!user) return false
    if (role === 'admin') {
      return user.role === 'admin'
    }
    if (role === 'sub_admin') {
      return user.role === 'admin' || user.role === 'sub_admin'
    }
    return false
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, requireRole = null }) {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: 'var(--color-text-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    // Redirect to login
    window.location.href = '#/login'
    return null
  }

  if (requireRole && !hasRole(requireRole)) {
    // User doesn't have required role
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  return children
}
