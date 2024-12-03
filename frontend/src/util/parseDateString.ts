export const parseDateString = (date: string) => {
  const dayString = date.split('-')
  const year = parseInt(dayString[0])
  const month = parseInt(dayString[1]) - 1
  const day = parseInt(dayString[2])
  return new Date(year, month, day)
}
