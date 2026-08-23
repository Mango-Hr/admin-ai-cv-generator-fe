/**
 * Phone number validation and formatting utility
 * Supports Nigerian phone numbers in multiple formats
 */

/**
 * Valid Nigerian phone prefixes
 */
const VALID_PREFIXES = ['070', '071', '080', '081', '090']

/**
 * Validates and normalizes Nigerian phone numbers
 * Accepts formats:
 * - 0XX XXXX XXXX (11 digits starting with 0)
 * - +234XX XXXX XXXX (10 digits after +234)
 * - 234XX XXXX XXXX (10 digits after 234)
 *
 * @param {string} phoneNumber - The phone number to validate
 * @returns {object} - { isValid: boolean, message: string, formattedNumber: string }
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
      formattedNumber: null,
    }
  }

  // Remove all spaces and dashes
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '')

  // Check if empty after cleaning
  if (!cleaned) {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
      formattedNumber: null,
    }
  }

  // Handle +234 format (10 digits after +234)
  if (cleaned.startsWith('+234')) {
    const digitsOnly = cleaned.substring(4) // Remove '+234'
    
    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(digitsOnly)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number (10 digits after +234)',
        formattedNumber: null,
      }
    }

    // Check if first digit is valid prefix (1, 7, 8, 9)
    const firstDigit = digitsOnly.charAt(0)
    if (!['1', '7', '8', '9'].includes(firstDigit)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number',
        formattedNumber: null,
      }
    }

    // Format: convert +234XXXXXXXXXX to 0XXXXXXXXXX
    const formatted = '0' + digitsOnly
    return {
      isValid: true,
      message: '',
      formattedNumber: formatted,
    }
  }

  // Handle 234 format (without +, 10 digits after 234)
  if (cleaned.startsWith('234')) {
    const digitsOnly = cleaned.substring(3) // Remove '234'
    
    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(digitsOnly)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number (10 digits after 234)',
        formattedNumber: null,
      }
    }

    // Check if first digit is valid prefix (1, 7, 8, 9)
    const firstDigit = digitsOnly.charAt(0)
    if (!['1', '7', '8', '9'].includes(firstDigit)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number',
        formattedNumber: null,
      }
    }

    // Format: convert 234XXXXXXXXXX to 0XXXXXXXXXX
    const formatted = '0' + digitsOnly
    return {
      isValid: true,
      message: '',
      formattedNumber: formatted,
    }
  }

  // Handle 0XX format (11 digits starting with 0)
  if (cleaned.startsWith('0')) {
    // Must be exactly 11 digits
    if (!/^\d{11}$/.test(cleaned)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number (11 digits starting with 0)',
        formattedNumber: null,
      }
    }

    // Check if prefix is valid (070, 071, 080, 081, 090)
    const prefix = cleaned.substring(0, 3)
    if (!VALID_PREFIXES.includes(prefix)) {
      return {
        isValid: false,
        message: `Please enter a valid phone number (valid prefixes: ${VALID_PREFIXES.join(', ')})`,
        formattedNumber: null,
      }
    }

    // Already in correct format
    return {
      isValid: true,
      message: '',
      formattedNumber: cleaned,
    }
  }

  // Any other format is invalid
  return {
    isValid: false,
    message: 'Please enter a valid phone number',
    formattedNumber: null,
  }
}

/**
 * Formats phone number for display
 * Converts 0XXXXXXXXXX to 0XX XXXX XXXX
 *
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumberForDisplay = (phoneNumber) => {
  if (!phoneNumber) return ''

  const cleaned = phoneNumber.replace(/[\s\-()]/g, '')
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`
  }

  return phoneNumber
}
