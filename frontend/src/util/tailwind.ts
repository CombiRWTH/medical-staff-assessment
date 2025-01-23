/**
 * A function to combine classNames that are marked as applicable
 * @param choices The choices to combine only used when the value is true
 *
 * Usage:
 * tailwindChoice({"red": index === 0, "green": index !== 0})
 */
export const tailwindChoice = (choices : Record<string, boolean>): string => {
  return Object.keys(choices).map(key => choices[key] ? key : undefined).filter(value => !!value).join(' ')
}

/**
 * A function to concatenate class strings
 * @param classes The classes to combine
 */
export const tailwindCombine = (...classes: (string | undefined)[]) => {
  return classes.filter(value => !!value).join(' ')
}
