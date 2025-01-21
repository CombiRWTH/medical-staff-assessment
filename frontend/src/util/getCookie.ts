/**
 * A function to retrieve the value of a cookie by its key
 * @param name The name of the cookie
 */
export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  return undefined
}
