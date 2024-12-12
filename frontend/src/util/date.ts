export const formatDateBackend = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

export const formatDateFrontendURL = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

export const formatDateVisual = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export const parseDateString = (date: string) => {
  const dayString = date.split('-')
  const year = parseInt(dayString[0])
  const month = parseInt(dayString[1]) - 1
  const day = parseInt(dayString[2])
  return new Date(year, month, day)
}

export const parseDateStringFrontend = (date: string) => {
  const dayString = date.split('-')
  const day = parseInt(dayString[0])
  const month = parseInt(dayString[1]) - 1
  const year = parseInt(dayString[2])
  return new Date(year, month, day)
}
