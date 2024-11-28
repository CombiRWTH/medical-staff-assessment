export const range = (start: number, end: number) => {
  return Array.from({ length: end - start }, (_, i) => i + start)
}
