/**
 * Mock Data for Admin Pages
 * This file contains all mock data used across the application
 * In production, this data would come from API calls
 */

// ============================================
// Mock Submissions
// ============================================

export const MOCK_SUBMISSIONS = [
  {
    id: 'SUB-2024-001',
    clientName: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 234 567 8900',
    targetRole: 'Senior Software Engineer',
    targetCompany: 'Google',
    status: 'new',
    priority: 'high',
    assignedTo: null,
    submittedAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    hasExistingCV: true,
    messageCount: 0,
  },
  {
    id: 'SUB-2024-002',
    clientName: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '+1 234 567 8901',
    targetRole: 'Product Manager',
    targetCompany: 'Amazon',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    submittedAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
    hasExistingCV: false,
    messageCount: 5,
  },
  {
    id: 'SUB-2024-003',
    clientName: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 234 567 8902',
    targetRole: 'Data Scientist',
    targetCompany: 'Microsoft',
    status: 'completed',
    priority: 'normal',
    assignedTo: { id: 3, name: 'Michael Brown' },
    submittedAt: new Date('2024-01-12T09:00:00'),
    updatedAt: new Date('2024-01-14T16:30:00'),
    hasExistingCV: true,
    messageCount: 12,
  },
  {
    id: 'SUB-2024-004',
    clientName: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1 234 567 8903',
    targetRole: 'UX Designer',
    targetCompany: 'Apple',
    status: 'in_progress',
    priority: 'normal',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    submittedAt: new Date('2024-01-13T11:45:00'),
    updatedAt: new Date('2024-01-15T08:00:00'),
    hasExistingCV: false,
    messageCount: 3,
  },
  {
    id: 'SUB-2024-005',
    clientName: 'David Thompson',
    email: 'david.t@email.com',
    phone: '+1 234 567 8904',
    targetRole: 'Marketing Director',
    targetCompany: 'Meta',
    status: 'review',
    priority: 'high',
    assignedTo: { id: 1, name: 'Admin User' },
    submittedAt: new Date('2024-01-11T15:20:00'),
    updatedAt: new Date('2024-01-14T12:00:00'),
    hasExistingCV: true,
    messageCount: 8,
  },
  {
    id: 'SUB-2024-006',
    clientName: 'Lisa Martinez',
    email: 'lisa.m@email.com',
    phone: '+1 234 567 8905',
    targetRole: 'DevOps Engineer',
    targetCompany: 'Netflix',
    status: 'new',
    priority: 'normal',
    assignedTo: null,
    submittedAt: new Date('2024-01-15T08:15:00'),
    updatedAt: new Date('2024-01-15T08:15:00'),
    hasExistingCV: false,
    messageCount: 0,
  },
  {
    id: 'SUB-2024-007',
    clientName: 'James Wilson',
    email: 'james.w@email.com',
    phone: '+1 234 567 8906',
    targetRole: 'Sales Manager',
    targetCompany: 'Salesforce',
    status: 'completed',
    priority: 'low',
    assignedTo: { id: 3, name: 'Michael Brown' },
    submittedAt: new Date('2024-01-10T13:30:00'),
    updatedAt: new Date('2024-01-13T17:00:00'),
    hasExistingCV: true,
    messageCount: 15,
  },
  {
    id: 'SUB-2024-008',
    clientName: 'Nina Patel',
    email: 'nina.p@email.com',
    phone: '+1 234 567 8907',
    targetRole: 'Full Stack Developer',
    targetCompany: 'Uber',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    submittedAt: new Date('2024-01-14T10:00:00'),
    updatedAt: new Date('2024-01-15T10:00:00'),
    hasExistingCV: true,
    messageCount: 6,
  },
  {
    id: 'SUB-2024-009',
    clientName: 'Robert Kim',
    email: 'robert.k@email.com',
    phone: '+1 234 567 8908',
    targetRole: 'Business Analyst',
    targetCompany: 'JPMorgan',
    status: 'review',
    priority: 'normal',
    assignedTo: { id: 1, name: 'Admin User' },
    submittedAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-14T14:20:00'),
    hasExistingCV: false,
    messageCount: 4,
  },
  {
    id: 'SUB-2024-010',
    clientName: 'Amanda Foster',
    email: 'amanda.f@email.com',
    phone: '+1 234 567 8909',
    targetRole: 'HR Manager',
    targetCompany: 'LinkedIn',
    status: 'new',
    priority: 'low',
    assignedTo: null,
    submittedAt: new Date('2024-01-15T12:00:00'),
    updatedAt: new Date('2024-01-15T12:00:00'),
    hasExistingCV: true,
    messageCount: 0,
  },
  {
    id: 'SUB-2024-011',
    clientName: 'Kevin Brown',
    email: 'kevin.b@email.com',
    phone: '+1 234 567 8910',
    targetRole: 'Cloud Architect',
    targetCompany: 'AWS',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 3, name: 'Michael Brown' },
    submittedAt: new Date('2024-01-13T09:30:00'),
    updatedAt: new Date('2024-01-15T11:00:00'),
    hasExistingCV: false,
    messageCount: 7,
  },
  {
    id: 'SUB-2024-012',
    clientName: 'Jessica Lee',
    email: 'jessica.l@email.com',
    phone: '+1 234 567 8911',
    targetRole: 'Content Strategist',
    targetCompany: 'Adobe',
    status: 'completed',
    priority: 'normal',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    submittedAt: new Date('2024-01-09T14:00:00'),
    updatedAt: new Date('2024-01-12T16:45:00'),
    hasExistingCV: true,
    messageCount: 10,
  },
]

// ============================================
// Mock Tasks
// ============================================

export const MOCK_TASKS = [
  {
    id: 'TASK-001',
    submissionId: 'SUB-2024-002',
    clientName: 'Sarah Williams',
    title: 'Review work experience section',
    description: 'Client needs help restructuring experience section to highlight leadership roles',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    dueDate: new Date('2024-01-16T17:00:00'),
    createdAt: new Date('2024-01-14T14:20:00'),
  },
  {
    id: 'TASK-002',
    submissionId: 'SUB-2024-005',
    clientName: 'David Thompson',
    title: 'Final CV review',
    description: 'Complete final review before sending to client',
    status: 'review',
    priority: 'high',
    assignedTo: { id: 1, name: 'Admin User' },
    dueDate: new Date('2024-01-15T15:00:00'),
    createdAt: new Date('2024-01-14T12:00:00'),
  },
  {
    id: 'TASK-003',
    submissionId: 'SUB-2024-008',
    clientName: 'Nina Patel',
    title: 'Add technical skills section',
    description: 'Include specific programming languages and frameworks',
    status: 'in_progress',
    priority: 'normal',
    assignedTo: { id: 2, name: 'Sarah Johnson' },
    dueDate: new Date('2024-01-17T12:00:00'),
    createdAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'TASK-004',
    submissionId: 'SUB-2024-009',
    clientName: 'Robert Kim',
    title: 'Proofread and format',
    description: 'Check grammar, spelling, and overall formatting',
    status: 'pending',
    priority: 'normal',
    assignedTo: { id: 1, name: 'Admin User' },
    dueDate: new Date('2024-01-18T10:00:00'),
    createdAt: new Date('2024-01-14T14:20:00'),
  },
  {
    id: 'TASK-005',
    submissionId: 'SUB-2024-011',
    clientName: 'Kevin Brown',
    title: 'Add certifications',
    description: 'Include AWS and Azure certifications with dates',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 3, name: 'Michael Brown' },
    dueDate: new Date('2024-01-16T14:00:00'),
    createdAt: new Date('2024-01-15T11:00:00'),
  },
]

// ============================================
// Mock Staff
// ============================================

export const MOCK_STAFF = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    avatar: null,
    status: 'active',
    activeSubmissions: 2,
    completedSubmissions: 45,
    joinedAt: new Date('2023-01-01T00:00:00'),
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'sub_admin',
    avatar: null,
    status: 'active',
    activeSubmissions: 4,
    completedSubmissions: 32,
    joinedAt: new Date('2023-03-15T00:00:00'),
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@company.com',
    role: 'sub_admin',
    avatar: null,
    status: 'active',
    activeSubmissions: 2,
    completedSubmissions: 28,
    joinedAt: new Date('2023-05-20T00:00:00'),
  },
]

// ============================================
// Mock Prompts
// ============================================

export const MOCK_PROMPTS = [
  {
    id: 1,
    name: 'Software Engineer CV',
    description: 'Optimized prompt for software engineering roles',
    category: 'Technology',
    template: 'Create a professional CV for a {role} position at {company}. Highlight technical skills, project experience, and achievements. Focus on {keywords}.',
    isActive: true,
    usageCount: 156,
    createdAt: new Date('2023-06-01T00:00:00'),
    updatedAt: new Date('2024-01-10T00:00:00'),
  },
  {
    id: 2,
    name: 'Product Manager CV',
    description: 'Prompt for product management positions',
    category: 'Product',
    template: 'Develop a CV for {role} at {company}. Emphasize leadership, product launches, cross-functional collaboration, and metrics. Include {keywords}.',
    isActive: true,
    usageCount: 89,
    createdAt: new Date('2023-07-15T00:00:00'),
    updatedAt: new Date('2024-01-08T00:00:00'),
  },
  {
    id: 3,
    name: 'Executive CV',
    description: 'High-level executive resume template',
    category: 'Executive',
    template: 'Craft an executive CV for {role} at {company}. Focus on strategic vision, team building, revenue growth, and board experience. Keywords: {keywords}.',
    isActive: true,
    usageCount: 45,
    createdAt: new Date('2023-08-20T00:00:00'),
    updatedAt: new Date('2023-12-15T00:00:00'),
  },
  {
    id: 4,
    name: 'Marketing Professional CV',
    description: 'Template for marketing roles',
    category: 'Marketing',
    template: 'Generate a CV for {role} position at {company}. Highlight campaigns, ROI, brand strategy, and digital marketing skills. Include {keywords}.',
    isActive: false,
    usageCount: 67,
    createdAt: new Date('2023-09-10T00:00:00'),
    updatedAt: new Date('2023-11-20T00:00:00'),
  },
]

// ============================================
// Dashboard Stats (Mock)
// ============================================

export const MOCK_DASHBOARD_STATS = {
  newRequests: 4,
  inProgress: 5,
  completed: 3,
  activeChats: 8,
  totalSubmissions: 12,
  weeklyGrowth: '+12%',
  monthlyGrowth: '+24%',
  avgResponseTime: '2.3 hours',
  satisfactionRate: '98%',
}

// ============================================
// Service Functions (Simulated API Calls)
// ============================================

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const submissionsService = {
  // Get all submissions
  getAll: async (filters = {}) => {
    await delay()
    let results = [...MOCK_SUBMISSIONS]
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      results = results.filter(s => s.status === filters.status)
    }
    
    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      results = results.filter(s => 
        s.clientName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.id.toLowerCase().includes(search) ||
        s.targetRole.toLowerCase().includes(search)
      )
    }
    
    // Filter by assigned
    if (filters.assignedTo) {
      results = results.filter(s => s.assignedTo?.id === filters.assignedTo)
    }
    
    return results
  },

  // Get submission by ID
  getById: async (id) => {
    await delay()
    return MOCK_SUBMISSIONS.find(s => s.id === id)
  },

  // Update submission
  update: async (id, data) => {
    await delay()
    return { success: true, id, data }
  },

  // Delete submission
  delete: async (id) => {
    await delay()
    return { success: true, id }
  },
}

export const tasksService = {
  // Get all tasks
  getAll: async (filters = {}) => {
    await delay()
    let results = [...MOCK_TASKS]
    
    if (filters.status && filters.status !== 'all') {
      results = results.filter(t => t.status === filters.status)
    }
    
    if (filters.assignedTo) {
      results = results.filter(t => t.assignedTo?.id === filters.assignedTo)
    }
    
    return results
  },

  // Get task by ID
  getById: async (id) => {
    await delay()
    return MOCK_TASKS.find(t => t.id === id)
  },
}

export const staffService = {
  // Get all staff
  getAll: async () => {
    await delay()
    return MOCK_STAFF
  },

  // Get staff by ID
  getById: async (id) => {
    await delay()
    return MOCK_STAFF.find(s => s.id === id)
  },
}

export const promptsService = {
  // Get all prompts
  getAll: async () => {
    await delay()
    return MOCK_PROMPTS
  },

  // Get prompt by ID
  getById: async (id) => {
    await delay()
    return MOCK_PROMPTS.find(p => p.id === id)
  },
}

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    await delay()
    return MOCK_DASHBOARD_STATS
  },

  // Get recent submissions
  getRecentSubmissions: async (limit = 5) => {
    await delay()
    return MOCK_SUBMISSIONS
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .slice(0, limit)
  },
}
