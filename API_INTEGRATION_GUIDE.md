# AI CV Generator - API Integration Guide

**Version**: 1.0.0  
**Status**: Frontend Complete, Ready for Backend Integration  
**Framework**: React 19.2.8 + Vite  
**Last Updated**: January 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Mock Data Structure](#mock-data-structure)
4. [API Endpoints Required](#api-endpoints-required)
5. [Service Layer Integration](#service-layer-integration)
6. [Authentication Flow](#authentication-flow)
7. [Error Handling](#error-handling)
8. [Testing Instructions](#testing-instructions)
9. [Deployment Checklist](#deployment-checklist)

---

## 🎯 Overview

The frontend is a **production-ready React application** with mock data integration. All API calls are currently simulated with the `src/services/mockData.js` file. This guide shows how to replace mock services with real backend API calls.

**Key Features:**
- ✅ Complete component library (14+ shared components)
- ✅ Full client-facing flow (Submit → Success → Chat → Download)
- ✅ Complete admin interface with 9 pages
- ✅ Authentication & role-based access control
- ✅ Toast notifications & loading states
- ✅ Responsive design (mobile-first)
- ✅ Framer Motion animations

---

## 🏗️ Architecture

### Directory Structure

```
src/
├── components/
│   ├── shared/          # Reusable UI components
│   ├── layout/          # Layout wrappers
├── pages/               # Page components
├── contexts/            # React Context (Auth, Toast)
├── services/            # API service layer (currently mock)
├── utils/               # Utilities (animations, helpers)
├── App.jsx              # Main router
└── index.css            # Global styles
```

### Service Layer Pattern

All API calls go through `src/services/mockData.js`:

```javascript
// Current mock pattern
export const submissionsService = {
  getAll: async (filters) => { /* returns mock data */ },
  getById: async (id) => { /* returns mock data */ },
  update: async (id, data) => { /* simulates update */ },
  delete: async (id) => { /* simulates delete */ },
}
```

---

## 📊 Mock Data Structure

### Submissions

```javascript
{
  id: "SUB-2024-001",
  clientName: "John Anderson",
  email: "john@email.com",
  phone: "+1 234 567 8900",
  targetRole: "Senior Software Engineer",
  targetCompany: "Google",
  status: "new|in_progress|review|completed",
  priority: "high|normal|low",
  assignedTo: { id: 2, name: "Sarah Johnson" } | null,
  submittedAt: Date,
  updatedAt: Date,
  hasExistingCV: boolean,
  messageCount: number,
}
```

### Tasks

```javascript
{
  id: "TASK-001",
  submissionId: "SUB-2024-002",
  clientName: "Sarah Williams",
  title: "Review work experience section",
  description: "Client needs help restructuring...",
  status: "pending|in_progress|review|completed",
  priority: "high|normal|low",
  assignedTo: { id: 2, name: "Sarah Johnson" },
  dueDate: Date,
  createdAt: Date,
}
```

### Staff

```javascript
{
  id: 1,
  name: "Admin User",
  email: "admin@company.com",
  role: "admin|sub_admin",
  avatar: string | null,
  status: "active|inactive",
  activeSubmissions: number,
  completedSubmissions: number,
  joinedAt: Date,
}
```

### Prompts

```javascript
{
  id: 1,
  name: "Software Engineer CV",
  description: "Optimized prompt for software roles",
  category: "Technology|Product|Executive|Marketing",
  template: "Create a professional CV for {role} at {company}...",
  isActive: boolean,
  usageCount: number,
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🔌 API Endpoints Required

### Submissions

```
GET    /api/submissions              # List all
GET    /api/submissions?status=new   # Filter by status
GET    /api/submissions/:id          # Get single
POST   /api/submissions              # Create
PUT    /api/submissions/:id          # Update
DELETE /api/submissions/:id          # Delete
```

### Tasks

```
GET    /api/tasks                    # List all
GET    /api/tasks?status=pending     # Filter by status
GET    /api/tasks/:id                # Get single
POST   /api/tasks                    # Create
PUT    /api/tasks/:id                # Update
DELETE /api/tasks/:id                # Delete
```

### Staff

```
GET    /api/staff                    # List all
GET    /api/staff/:id                # Get single
POST   /api/staff                    # Create
PUT    /api/staff/:id                # Update
DELETE /api/staff/:id                # Delete
```

### Prompts

```
GET    /api/prompts                  # List all
GET    /api/prompts/:id              # Get single
POST   /api/prompts                  # Create
PUT    /api/prompts/:id              # Update
DELETE /api/prompts/:id              # Delete
```

### Chat Messages

```
GET    /api/submissions/:id/messages # Get all messages
POST   /api/submissions/:id/messages # Send message
```

### CV Generation

```
POST   /api/cv/generate/:id          # Generate CV
GET    /api/cv/:id/preview           # Get preview
GET    /api/cv/:id/download?format=pdf # Download CV
```

### Authentication

```
POST   /api/auth/login               # Login
POST   /api/auth/logout              # Logout
GET    /api/auth/me                  # Current user
POST   /api/auth/refresh             # Refresh token
```

### Dashboard

```
GET    /api/dashboard/stats          # Dashboard stats
GET    /api/dashboard/recent-submissions # Recent submissions
```

---

## 🔄 Service Layer Integration

### Step 1: Create API Service

Create `src/services/api.js`:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

// Helper function for API calls
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}
```

### Step 2: Update Submission Service

Replace `src/services/mockData.js` exports with:

```javascript
import { api } from './api'

export const submissionsService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    return api.get(`/submissions?${params}`)
  },

  getById: async (id) => {
    return api.get(`/submissions/${id}`)
  },

  update: async (id, data) => {
    return api.put(`/submissions/${id}`, data)
  },

  delete: async (id) => {
    return api.delete(`/submissions/${id}`)
  },
}

// Similar for tasksService, staffService, promptsService, etc.
```

### Step 3: Update Authentication

Update `src/contexts/AuthContext.jsx`:

```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('auth_token', response.token)
    setUser(response.user)
    return true
  } catch (error) {
    console.error('Login failed:', error)
    return false
  }
}
```

---

## 🔐 Authentication Flow

### Current Mock Implementation

```
Login Page → localStorage (mock users)
  ↓
AuthContext provides user + auth token
  ↓
ProtectedRoute component checks role
  ↓
Admin pages accessible
```

### Real Backend Flow

```
Login Form → POST /api/auth/login
  ↓
Receive JWT token + user
  ↓
Store token in localStorage
  ↓
Add token to all API requests (Authorization header)
  ↓
ProtectedRoute validates with backend or stored user
  ↓
On logout: DELETE /api/auth/logout
```

### Mock Users (for development)

```javascript
// Login with these during development
// Admin account
Email: admin@company.com
Password: admin123

// Sub-admin account
Email: sarah@company.com
Password: sarah123
```

---

## ⚠️ Error Handling

### Current Implementation

Toast notifications handle errors:

```javascript
const { toast } = useToast()
try {
  await submissionsService.getAll()
} catch (error) {
  toast.error('Failed to load submissions')
}
```

### For Backend Integration

Backend should return standardized errors:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials",
    "details": {}
  }
}
```

---

## 🧪 Testing Instructions

### Manual Testing Checklist

- [ ] Login with admin account
- [ ] View dashboard stats
- [ ] Navigate to submissions list
- [ ] Filter submissions by status
- [ ] Open submission detail
- [ ] Update submission status
- [ ] Assign staff member
- [ ] View task management board
- [ ] Navigate to staff management
- [ ] View prompts management
- [ ] Generate CV for submission
- [ ] Chat with client
- [ ] Download CV
- [ ] Access settings page
- [ ] Logout successfully

### Automated Testing

```bash
# Run with Vitest (if added)
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ Deployment Checklist

### Before Going Live

- [ ] Set `REACT_APP_API_URL` environment variable
- [ ] Remove/hide mock data service imports
- [ ] Update all service imports to use real API
- [ ] Test authentication flow with real backend
- [ ] Verify all API endpoints are working
- [ ] Test error handling and edge cases
- [ ] Run lighthouse audit for performance
- [ ] Test on multiple devices/browsers
- [ ] Set up proper CORS on backend
- [ ] Implement rate limiting
- [ ] Add API request logging/monitoring
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificates
- [ ] Configure environment variables for production
- [ ] Run security audit

### Environment Variables

```bash
# .env.local (development)
REACT_APP_API_URL=http://localhost:3000/api

# .env.production (production)
REACT_APP_API_URL=https://api.example.com/api
```

---

## 🚀 Implementation Timeline

**Phase 1: Backend Setup (Week 1)**
- Set up API server
- Implement authentication endpoints
- Create submission endpoints
- Set up database

**Phase 2: Frontend Integration (Week 2)**
- Replace mock services with API calls
- Update authentication flow
- Test all integrations
- Fix bugs

**Phase 3: Testing & QA (Week 3)**
- Cross-browser testing
- Performance testing
- Security testing
- User acceptance testing

**Phase 4: Deployment (Week 4)**
- Deploy backend
- Deploy frontend
- Monitor logs
- Handle issues

---

## 📞 Support & Notes

**Key Technologies Used:**
- React 19.2.8
- Vite (bundler)
- React Router 7.x (routing)
- Framer Motion (animations)
- Lucide React (icons)
- date-fns (date formatting)

**CSS Architecture:**
- CSS custom properties (variables)
- BEM methodology
- Mobile-first responsive design
- Consistent spacing, colors, typography

**Performance Optimizations:**
- Code splitting (page-based)
- Lazy loading images
- CSS-in-JS for conditional styles
- Efficient re-renders with Context

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔗 Additional Resources

- React docs: https://react.dev
- Vite docs: https://vitejs.dev
- React Router: https://reactrouter.com
- Framer Motion: https://www.framer.com/motion
- TypeScript (future): https://www.typescriptlang.org

---

**Document created**: January 2024  
**For questions or updates, please refer to the codebase documentation.**
