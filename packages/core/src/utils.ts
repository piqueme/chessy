/**
 * Low-level utilities e.g. for array manipulation.
 * Consider replacing these with something like Lodash if there are many
 * over time.
 */

type Primitive = string | number | boolean | undefined
export function countOccurrences(arr: Primitive[], item: Primitive): number {
  const occurrences = arr.reduce<Map<Primitive, number>>((acc, item) => {
    return acc.set(item, (acc.get(item) || 0) + 1)
  }, new Map())
  return occurrences.get(item) || 0
}

export function range(rangeMax: number): Array<number> {
  return Array.from(Array(rangeMax).keys())
}

export function reverseMap<T extends Primitive, U extends Primitive>(map: Map<U, T>): Map<T, U> {
  return new Map(
    Array.from(map, a => (a.reverse() as [T, U]))
  )
}

export function isUpperCase(s: string): boolean {
  return s.toUpperCase() === s
}
