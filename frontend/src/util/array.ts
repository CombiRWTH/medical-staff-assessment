export const equalArray = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }

  return arr1.every((element, index) => element === arr2[index])
}

export const equalSizeGroups = <T, >(array: T[], groupSize: number): T[][] => {
  if (groupSize <= 0) {
    console.warn(`group size should be greater than 0: groupSize = ${groupSize}`)
    return [[...array]]
  }

  const groups = []
  for (let i = 0; i < array.length; i += groupSize) {
    groups.push(array.slice(i, Math.min(i + groupSize, array.length)))
  }
  return groups
}

export const range = (start: number, end: number): number[] => {
  const result: number[] = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

export const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

export const getRandom = <T>(array: T[]): T => {
  if (array.length === 0) {
    throw Error(`getRandom: invalid array, the array must contain at least one element `)
  }
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export const unique = <T>(array: T[]): T[] => {
  return array.filter((item, index) => array.indexOf(item) === index)
}
