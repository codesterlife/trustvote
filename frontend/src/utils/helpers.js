/**
 * Utility functions for the TrustVote application
 */

/**
 * Format a date object or date string to a readable format
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} - Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return dateObj.toLocaleDateString(undefined, options)
}

/**
 * Truncate an Ethereum address to a shorter form
 * @param {string} address - Ethereum address to truncate
 * @param {number} startChars - Number of characters to keep at the start
 * @param {number} endChars - Number of characters to keep at the end
 * @returns {string} - Truncated address
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Generate a deterministic color based on a string input
 * @param {string} str - Input string
 * @returns {string} - Hex color code
 */
export function stringToColor(str) {
  if (!str) return '#6c757d' // Default gray
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    color += ('00' + value.toString(16)).substr(-2)
  }
  
  return color
}

/**
 * Get badge class for election status
 * @param {string} status - Election status
 * @returns {string} - CSS class for the badge
 */
export function getStatusBadgeClass(status) {
  const classes = {
    'Init': 'bg-secondary',
    'Voting': 'bg-success',
    'Closed': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

/**
 * Format a date range string
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} - Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return ''
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // If same day, show as "May 15, 2023 (8:00 AM - 5:00 PM)"
  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const dateStr = formatDate(start)
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${dateStr} (${startTimeStr} - ${endTimeStr})`
  }
  
  // Otherwise, show as "May 15 - May 16, 2023"
  return `${formatDate(start)} - ${formatDate(end)}`
}

/**
 * Convert hex color to RGBA with transparency
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
export function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(108, 117, 125, ${alpha})` // Default gray
  
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export function isDatePast(date) {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export function isDateFuture(date) {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

/**
 * Format time remaining until a given date
 * @param {Date|string} date - Target date
 * @returns {string} - Formatted time remaining
 */
export function timeRemaining(date) {
  if (!date) return ''
  const targetDate = typeof date === 'string' ? new Date(date) : date
  
  const now = new Date()
  if (now >= targetDate) return 'Expired'
  
  const diff = targetDate - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'Less than 1 minute'
}
