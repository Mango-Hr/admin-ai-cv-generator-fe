import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  LayoutDashboard,
  FileStack,
  CheckSquare,
  Users,
  FileCode,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { default as Avatar } from '../../shared/Avatar'
import Badge from '../../shared/Badge'
import Skeleton from '../../shared/Skeleton'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { getAdminProfile } from '../../../services/authService'
import { getNewSubmissionsCount } from '../../../services/submissionsService'
import logoImg from '../../../assets/textbg.png'
import './AdminLayout.css'

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { path: '/admin', icon: <LayoutDashboard />, label: 'Dashboard', roles: ['super_admin', 'sub_admin'] },
      { path: '/admin/submissions', icon: <FileStack />, label: 'Submissions', badge: null, roles: ['super_admin', 'sub_admin'] },
      { path: '/admin/tasks', icon: <CheckSquare />, label: 'My Tasks', badge: 5, roles: ['super_admin', 'sub_admin'] },
    ],
  },
  {
    section: 'Management',
    items: [
      { path: '/admin/staff', icon: <Users />, label: 'Staff', roles: ['super_admin'] },
      { path: '/admin/prompts', icon: <FileCode />, label: 'Prompts', roles: ['super_admin'] },
    ],
  },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, hasRole } = useAuth()
  const { toast } = useToast()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSidebarUserMenu, setShowSidebarUserMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [submissionCount, setSubmissionCount] = useState(0)
  
  // Fetch user profile for avatar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getAdminProfile()
        setProfile(profileData)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }
    
    if (user) {
      fetchProfile()
    }
  }, [user])

  // Fetch submission count
  useEffect(() => {
    const fetchSubmissionCount = async () => {
      const count = await getNewSubmissionsCount()
      setSubmissionCount(count)
    }

    if (user) {
      fetchSubmissionCount()
    }
  }, [user])
  
  // Initialize from localStorage to persist across navigations
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarOpen')
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  // Show loading skeleton when page changes
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Filter nav items based on user role
  const filterNavItems = (items) => {
    return items.filter(item => {
      if (!item.roles) return true
      return item.roles.some(role => hasRole(role))
    })
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-layout__sidebar ${!sidebarOpen ? 'admin-layout__sidebar--hidden' : ''}`}>
        {/* Sidebar Header */}
        <div className="admin-layout__sidebar-header">
          <Link to="/admin" className="admin-layout__logo" onClick={closeSidebar}>
            <img src={logoImg} alt="Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', transform: 'scale(3.2)', marginLeft: '75px' }} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="admin-layout__nav">
          {NAV_ITEMS.map((section, sectionIndex) => {
            const visibleItems = filterNavItems(section.items)
            
            if (visibleItems.length === 0) return null

            return (
              <div key={sectionIndex} className="admin-layout__nav-section">
                <div className="admin-layout__nav-label">{section.section}</div>
                {visibleItems.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className={`admin-layout__nav-link ${
                      isActive(item.path) ? 'admin-layout__nav-link--active' : ''
                    }`}
                    onClick={closeSidebar}
                  >
                    <span className="admin-layout__nav-icon">{item.icon}</span>
                    <span className="admin-layout__nav-text">{item.label}</span>
                    {item.badge && (
                      <Badge size="sm" variant="new" className="admin-layout__nav-badge">
                        {item.badge}
                      </Badge>
                    )}
                    {item.label === 'Submissions' && submissionCount > 0 && (
                      <Badge size="sm" variant="new" className="admin-layout__nav-badge">
                        {submissionCount}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer - User */}
        <div className="admin-layout__sidebar-footer">
          <button
            onClick={() => setShowSidebarUserMenu(!showSidebarUserMenu)}
            className="admin-layout__user"
            style={{
              width: '100%',
              border: 'none',
              background: 'var(--color-bg)',
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            <Avatar
              fallback={profile ? `${profile.first_name} ${profile.last_name}` : user?.name}
              src={profile?.avatar_url || user?.avatar}
              size="sm"
              color="yellow"
            />
            <div className="admin-layout__user-info">
              <div className="admin-layout__user-name">{profile ? `${profile.first_name} ${profile.last_name}` : user?.name}</div>
              <div className="admin-layout__user-role">{profile?.role?.replace('_', ' ') || user?.role?.replace('_', ' ')}</div>
            </div>
            <ChevronDown 
              size={16} 
              className="admin-layout__user-menu"
              style={{
                transition: 'transform var(--transition-fast)',
                transform: showSidebarUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            
            {/* Sidebar User Menu */}
            <AnimatePresence>
              {showSidebarUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    marginBottom: 'var(--space-2)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                  }}>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowSidebarUserMenu(false)
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'var(--text-sm)',
                      color: '#ef4444',
                      fontWeight: 500,
                      transition: 'background var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`admin-layout__main ${!sidebarOpen ? 'admin-layout__main--expanded' : ''}`}>
        {/* Top Bar */}
        <div className="admin-layout__topbar">
          <div className="admin-layout__topbar-left">
            <button
              className="admin-layout__menu-btn"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="admin-layout__topbar-right">
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Avatar
                  fallback={profile ? `${profile.first_name} ${profile.last_name}` : user?.name}
                  src={profile?.avatar_url || user?.avatar}
                  size="sm"
                  color="yellow"
                />
              </button>
              
              {/* Profile Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--space-2)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  minWidth: '180px',
                }}>
                  {/* <button
                    onClick={() => {
                      navigate('/admin/settings')
                      setShowProfileMenu(false)
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Settings
                  </button> */}
                  <hr style={{ margin: 'var(--space-1) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'var(--text-sm)',
                      color: '#ef4444',
                      fontWeight: 500,
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="admin-layout__content" key={location.pathname}>
          {isLoading ? (
            <div>
              {/* Header Skeleton */}
              <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Skeleton width="40%" height={32} style={{ marginBottom: 'var(--space-3)' }} />
                  <Skeleton width="60%" height={16} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginLeft: 'var(--space-6)' }}>
                  <Skeleton width={100} height={40} />
                  <Skeleton width={100} height={40} />
                </div>
              </div>
              
              {/* Stats Grid Skeleton - with loading numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-secondary)' }}>
                    <Skeleton width={40} height={40} style={{ marginBottom: 'var(--space-3)', borderRadius: '50%' }} />
                    <Skeleton width="70%" height={24} style={{ marginBottom: 'var(--space-2)' }} />
                    <Skeleton width="50%" height={14} />
                  </div>
                ))}
              </div>
              
              {/* Content Cards Skeleton */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} variant="card" height={200} />
                ))}
              </div>
              
              {/* Table Skeleton */}
              <div>
                <Skeleton variant="text" height={24} style={{ marginBottom: 'var(--space-4)' }} />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="text" height={60} style={{ marginBottom: 'var(--space-3)' }} />
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Overlay - only on mobile */}
      <div
        className={`admin-layout__overlay ${sidebarOpen && window.innerWidth < 768 ? 'admin-layout__overlay--visible' : ''}`}
        onClick={closeSidebar}
      />
    </div>
  )
}
