import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

/**
 * Get Kanban task metrics summary
 * Fetches metrics from the main tasks endpoint
 * @returns {Promise<{total_tasks, overdue_tasks, by_status, by_priority}>}
 */
export const getTaskMetrics = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_BASE_URL}/api/v1/admin/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    // Calculate metrics from tasks response
    const tasks = response.data.data || []
    const metrics = {
      total_tasks: tasks.length,
      overdue_tasks: tasks.filter(t => t.is_overdue).length,
      by_status: {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
      },
      by_priority: {
        low: tasks.filter(t => t.priority === 'low').length,
        normal: tasks.filter(t => t.priority === 'normal').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length,
      },
    }
    
    return metrics
  } catch (error) {
    console.error('[TasksService] Failed to fetch task metrics:', error)
    throw error
  }
}

/**
 * Get all Kanban tasks with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export const getTasks = async (filters = {}) => {
  try {
    const token = localStorage.getItem('admin_token')
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.submission_id) params.append('submission_id', filters.submission_id)
    if (filters.assigned_to_id) params.append('assigned_to_id', filters.assigned_to_id)
    if (filters.search) params.append('search', filters.search)

    const url = `${API_BASE_URL}/api/v1/admin/tasks${params.toString() ? '?' + params.toString() : ''}`
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('[TasksService] Failed to fetch tasks:', error)
    throw error
  }
}

/**
 * Create a new task
 * @param {Object} taskData
 * @returns {Promise<Object>}
 */
export const createTask = async (taskData) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.post(`${API_BASE_URL}/api/v1/admin/tasks`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('[TasksService] Failed to create task:', error)
    throw error
  }
}

/**
 * Update task status (for drag-and-drop)
 * @param {string} taskId
 * @param {string} status - 'todo', 'in_progress', 'review', 'done'
 * @returns {Promise<Object>}
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/admin/tasks/${taskId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[TasksService] Failed to update task status:', error)
    throw error
  }
}

/**
 * Update full task details
 * @param {string} taskId
 * @param {Object} taskData
 * @returns {Promise<Object>}
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/tasks/${taskId}`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[TasksService] Failed to update task:', error)
    throw error
  }
}

/**
 * Delete a task
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`${API_BASE_URL}/api/v1/admin/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('[TasksService] Failed to delete task:', error)
    throw error
  }
}
