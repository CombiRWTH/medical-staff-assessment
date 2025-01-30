/**
 * Format a date to the yyyy-mm-dd format
 * @param date
 */
export const formatDateBackend = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

/**
 * Format a date to the dd-mm-yyyy format
 * @param date
 */
export const formatDateFrontendURL = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Format a date to the dd.mm.yyyy format
 * @param date
 */
export const formatDateVisual = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

/**
 * Format a date to the dd-mm-yyyy-hh:mm format
 */
export const formatDateFull = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}-${month}-${year}-${hours}:${minutes}`
}

/**
 * Parses a date from a string
 * @param dateString The date in yyyy-mm-dd format
 */
export const parseDateString = (dateString: string) => {
  const parts = dateString.split('-')
  const year = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const day = parseInt(parts[2])
  return new Date(year, month, day)
}

/**
 * Parses a date from a string
 * @param dateString The date in dd-mm-yyyy format
 */
export const parseDateStringFrontend = (dateString: string) => {
  const parts = dateString.split('-')
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const year = parseInt(parts[2])
  return new Date(year, month, day)
}
