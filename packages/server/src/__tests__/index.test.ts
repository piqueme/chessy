import { fromShorthand, createBoard } from '../index'

test('creating black bishop from shorthand works', () => {
  const piece = fromShorthand('bB')
  expect(piece).toEqual({
    side: 'black',
    name: 'bishop' 
  })
})

test('creating invalid piece from shorthand errors', () => {
  expect(() => { fromShorthand('xB') }).toThrowError('bad notation')
})

test('createBoard generates 2d array with 8 rows and 8 cols', () => {
  const board = createBoard()
  const dimensions = {
    rows: board.length,
    cols: board?.[0]?.length,
  };
  expect(dimensions).toEqual({ rows: 8, cols: 8 });
})
