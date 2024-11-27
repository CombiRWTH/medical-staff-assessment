export const subsetByAttribute = <T, S>(array: T[], mapping: (value: T) => S) => {
  const categories: Set<S> = new Set(array.map<S>(mapping))
  const result: T[][] = []
  categories.forEach(value => result.push(array.filter(value1 => mapping(value1) === value)))
  return result
}
