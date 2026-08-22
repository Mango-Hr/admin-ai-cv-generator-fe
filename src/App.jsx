import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import SubmissionsList from './pages/SubmissionsList'
import SubmissionDetail from './pages/SubmissionDetail'
import TaskManagement from './pages/TaskManagement'
import StaffManagement from './pages/StaffManagement'
import PromptManagement from './pages/PromptManagement'
import CVGeneration from './pages/CVGeneration'
import SettingsPage from './pages/Settings'
import './index.css'

// Helper component to clean up hash URLs
function HashCleanup() {
  const location = useLocation()

  useEffect(() => {
    // Check if URL has a hash that looks like a route (e.g., #/login)
    if (window.location.hash.startsWith('#/')) {
      // Extract the path from the hash
      const path = window.location.hash.slice(1) // Remove the '#'
      // Replace the URL without reloading
      window.history.replaceState(null, '', path)
    }
  }, [location])

  return null
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <HashCleanup />
          <Routes>
            {/* Login & Signup Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="sub_admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute requireRole="admin">
                  <SubmissionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions/:id"
              element={
                <ProtectedRoute requireRole="sub_admin">
                  <SubmissionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute requireRole="sub_admin">
                  <TaskManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute requireRole="admin">
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prompts"
              element={
                <ProtectedRoute requireRole="admin">
                  <PromptManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/generate/:id"
              element={
                <ProtectedRoute requireRole="sub_admin">
                  <CVGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requireRole="sub_admin">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
