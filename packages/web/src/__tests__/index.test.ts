import { printedBoard } from '../index'

const countOccurrences = (str: string, pattern: RegExp): number => {
  return ((str || '').match(pattern) || []).length
}

test('printed board has two black bishops', () => {
  const bishopCount = countOccurrences(printedBoard, /bB/g)
  expect(bishopCount).toEqual(2)
});
