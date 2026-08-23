import { createContext, useContext, useState, useEffect } from 'react'
import { loginAdmin, logoutAdmin, createAdmin, getAdminProfile, getStoredAdminUser } from '../services/authService'

const AuthContext = createContext()

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
      const storedUser = getStoredAdminUser()
      
      if (storedUser) {
        setUser(storedUser)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Signup function
   * Creates a new admin account and logs the user in
   */
  const signup = async (userData) => {
    try {
      const newAdmin = await createAdmin(userData)
      // Auto-login the user after signup
      setUser(newAdmin)
      return newAdmin
    } catch (error) {
      throw error
    }
  }

  /**
   * Login function
   * Authenticates admin and sets user session
   */
  const login = async (email, password) => {
    try {
      const adminData = await loginAdmin(email, password)
      setUser(adminData)
      return adminData
    } catch (error) {
      throw error
    }
  }

  /**
   * Logout function
   * Clears user session
   */
  const logout = () => {
    logoutAdmin()
    setUser(null)
  }

  /**
   * Check if user has specific role
   * super_admin has all permissions (can access everything)
   */
  const hasRole = (role) => {
    if (!user) return false
    
    // super_admin has access to everything
    if (user.role === 'super_admin') {
      return true
    }
    
    // sub_admin can only access sub_admin pages
    if (role === 'sub_admin') {
      return user.role === 'sub_admin'
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
    signup,
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
    window.location.href = '/login'
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
