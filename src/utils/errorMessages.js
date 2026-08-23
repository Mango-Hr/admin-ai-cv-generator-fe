/**
 * Error message translator
 * Converts technical error codes to user-friendly messages
 */

const ERROR_MESSAGES = {
  // Authentication errors
  '401': 'Invalid email or password. Please try again.',
  'Unauthorized': 'Invalid email or password. Please try again.',
  'Wrong email': 'This email is not registered. Please sign up.',
  'Wrong password': 'Incorrect password. Please try again.',
  'Invalid email or password': 'Invalid email or password. Please try again.',

  // Account errors
  '403': 'Your account has been deactivated. Please contact support.',
  'Forbidden': 'Your account has been deactivated. Please contact support.',
  'Account is deactivated': 'Your account has been deactivated. Please contact support.',
  'is_active: false': 'Your account has been deactivated. Please contact support.',

  // Email errors
  '400': 'This email is already registered. Please use a different email or try logging in.',
  'Email already exists': 'This email is already registered. Please use a different email.',
  'already exists': 'This email is already registered. Please use a different email.',
  'already registered': 'This email is already registered. Please use a different email.',

  // Validation errors
  '422': 'Please check your information and try again.',
  'Unprocessable Entity': 'Please check your information and try again.',
  'Invalid email format': 'Please enter a valid email address.',
  'missing required fields': 'Please fill in all required fields.',

  // Network errors
  'Network': 'Connection failed. Please check your internet and try again.',
  'ECONNREFUSED': 'Unable to connect to the server. Please try again later.',
  'timeout': 'Request timed out. Please try again.',

  // Default error
  'default': 'Something went wrong. Please try again later.',
}

/**
 * Get user-friendly error message
 * @param {string} error - The error message or code
 * @returns {object} - { userMessage: string, technicalError: string }
 */
export const getUserFriendlyError = (error) => {
  const errorString = error?.toString?.() || String(error)
  const technicalError = errorString

  // Try to find matching error message
  for (const [key, userMessage] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.toLowerCase().includes(key.toLowerCase())) {
      return {
        userMessage,
        technicalError,
      }
    }
  }

  // Return default if no match found
  return {
    userMessage: ERROR_MESSAGES.default,
    technicalError,
  }
}

/**
 * Log technical error to console
 * @param {string} context - Where the error occurred (e.g., 'Login', 'Signup')
 * @param {string} error - The error details
 */
export const logTechnicalError = (context, error) => {
  console.error(`[${context} Error]`, error)
}
