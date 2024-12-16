export const tailwindChoice = (choices : Record<string, boolean>): string => {
  return Object.keys(choices).map(key => choices[key] ? key : '').join(' ')
}

export const tailwindCombine = (...classes: (string | undefined)[]) => {
  return classes.filter(value => !!value).join(' ')
}
