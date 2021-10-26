import {
  countOccurrences,
  range,
  reverseMap
} from '../utils'

describe('countOccurrences', () => {
  test('counts items mixed primitives with duplicates correctly', () => {
    const testArray = ['wheat', 4, 'wheat']
    expect(countOccurrences(testArray, 'wheat')).toEqual(2)
    expect(countOccurrences(testArray, 4)).toEqual(1)
  })

  test('counts 0 for items when array is empty', () => {
    const testArray: string[] = []
    expect(countOccurrences(testArray, 2)).toEqual(0)
  })
})

describe('range', () => {
  test('outputs an empty array if range max is 0', () => {
    expect(range(0)).toEqual([])
  })

  test('outputs [0, 1, 2] when range max is 3', () => {
    expect(range(3)).toEqual([0, 1, 2])
  })
})

describe('reverseMap', () => {
  test('reverse of empty map is empty', () => {
    const inputMap = new Map()
    const expectedMap = new Map()
    expect(reverseMap(inputMap)).toEqual(expectedMap)
  })

  test('reverse of string -> string map works', () => {
    const inputMap = new Map([
      ['in', 'out'],
      ['go', 'come'],
      ['send', 'receive']
    ])
    const expectedMap = new Map([
      ['out', 'in'],
      ['come', 'go'],
      ['receive', 'send']
    ])
    expect(reverseMap(inputMap)).toEqual(expectedMap)
  })

  test('squashes duplicate values in reverse map', () => {
    const inputMap = new Map([
      ['in', 'out'],
      ['go', 'come'],
      ['send', 'receive'],
      ['go', 'leave']
    ])
    const expectedMap = new Map([
      ['out', 'in'],
      ['leave', 'go'],
      ['receive', 'send']
    ])
    expect(reverseMap(inputMap)).toEqual(expectedMap)
  })
})
