import { useState } from 'react'
import {
  Settings,
  Bell,
  Shield,
  Palette,
  User,
  LogOut,
  Save,
  Check,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { Input } from '../components/shared/Input'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { containerVariants, staggerItem } from '../utils/animations'
import './Settings.css'

const SETTINGS_SECTIONS = [
  {
    id: 'account',
    title: 'Account Settings',
    icon: <User />,
    description: 'Manage your profile and account details',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell />,
    description: 'Control how you receive updates',
  },
  {
    id: 'security',
    title: 'Security',
    icon: <Shield />,
    description: 'Manage your security preferences',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <Palette />,
    description: 'Customize the interface',
  },
]

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('account')
  const [saving, setSaving] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [settings, setSettings] = useState({
    // Account
    fullName: user?.name || '',
    email: user?.email || '',
    // Notifications
    emailNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    // Security
    twoFactorEnabled: false,
    sessionTimeout: '30',
    // Appearance
    theme: 'auto',
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings saved successfully')
    }, 1000)
  }

  const handleLogout = () => {
    setLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    setLoggingOut(true)
    logout()
    toast.success('Logged out successfully')
    setLogoutModalOpen(false)
    setLoggingOut(false)
  }

  return (
    <AdminLayout>
      <div className="settings-page">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your preferences and account</p>
        </div>

        <div className="settings-content">
          {/* Sidebar */}
          <motion.aside
            className="settings-sidebar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <motion.button
                key={section.id}
                className={`settings-nav-item ${
                  activeSection === section.id ? 'settings-nav-item--active' : ''
                }`}
                onClick={() => setActiveSection(section.id)}
                variants={staggerItem}
              >
                <div className="settings-nav-icon">{section.icon}</div>
                <div className="settings-nav-content">
                  <div className="settings-nav-title">{section.title}</div>
                  <div className="settings-nav-description">{section.description}</div>
                </div>
                <ChevronRight className="settings-nav-arrow" />
              </motion.button>
            ))}
          </motion.aside>

          {/* Main Content */}
          <main className="settings-main">
            {activeSection === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <Card.Header title="Account Information" icon={<User />} />
                  <Card.Body>
                    <div className="settings-form">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <Input
                          type="text"
                          value={settings.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          placeholder="Your name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <Input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="your@email.com"
                          disabled
                        />
                        <p className="form-helper">Your email cannot be changed</p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {user?.role === 'admin' ? 'Administrator' : 'Sub-Administrator'}
                          </span>
                          <Badge variant={user?.role === 'admin' ? 'new' : 'completed'}>
                            {user?.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="form-actions">
                        <Button
                          variant="primary"
                          icon={saving ? <div style={{ animation: 'spin 1s linear infinite' }}><Check size={16} /></div> : <Save />}
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="ghost" icon={<LogOut />} onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <Card.Header title="Notification Preferences" icon={<Bell />} />
                  <Card.Body>
                    <div className="settings-form">
                      <div className="toggle-group">
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <div className="toggle-title">Email Notifications</div>
                            <div className="toggle-description">Receive email updates about submissions</div>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.emailNotifications}
                              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <div className="toggle-title">Task Reminders</div>
                            <div className="toggle-description">Get reminded about due tasks</div>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.taskReminders}
                              onChange={(e) => handleChange('taskReminders', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </div>

                        <div className="toggle-item">
                          <div className="toggle-content">
                            <div className="toggle-title">Weekly Digest</div>
                            <div className="toggle-description">Summary email every Monday</div>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.weeklyDigest}
                              onChange={(e) => handleChange('weeklyDigest', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <Button
                          variant="primary"
                          icon={<Save />}
                          onClick={handleSave}
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <Card.Header title="Security Settings" icon={<Shield />} />
                  <Card.Body>
                    <div className="settings-form">
                      <div className="form-group">
                        <label className="form-label">Session Timeout (minutes)</label>
                        <Input
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                          min="5"
                          max="480"
                        />
                        <p className="form-helper">Auto-logout after inactivity</p>
                      </div>

                      <div className="toggle-group">
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <div className="toggle-title">Two-Factor Authentication</div>
                            <div className="toggle-description">Add extra security to your account</div>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.twoFactorEnabled}
                              onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <Button
                          variant="primary"
                          icon={<Save />}
                          onClick={handleSave}
                        >
                          Save Security Settings
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <Card.Header title="Appearance Preferences" icon={<Palette />} />
                  <Card.Body>
                    <div className="settings-form">
                      <div className="form-group">
                        <label className="form-label">Theme</label>
                        <div className="theme-options">
                          {[
                            { value: 'light', label: '☀️ Light' },
                            { value: 'dark', label: '🌙 Dark' },
                            { value: 'auto', label: '🔄 Auto' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              className={`theme-option ${settings.theme === option.value ? 'theme-option--selected' : ''}`}
                              onClick={() => handleChange('theme', option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-actions">
                        <Button
                          variant="primary"
                          icon={<Save />}
                          onClick={handleSave}
                        >
                          Save Appearance
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        size="sm"
      >
        <ModalHeader title="Confirm Logout" onClose={() => setLogoutModalOpen(false)} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setLogoutModalOpen(false)}
            disabled={loggingOut}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loggingOut}
            disabled={loggingOut}
            onClick={confirmLogout}
          >
            Logout
          </Button>
        </ModalFooter>
      </Modal>
    </AdminLayout>
  )
}
