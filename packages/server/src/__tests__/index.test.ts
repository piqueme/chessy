import { fromShorthand, createBoard, printBoard } from '../index'
import type { Piece } from '../index'

const copyPiece = (piece: Piece): Piece => ({ ...piece })

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

test('printBoard returns empty string if board has no rows', () => {
  const printed = printBoard([])
  expect(printed).toEqual('')
});

test('printBoard matches snapshot for simple pawn and empty rows board', () => {
  const whitePawn: Piece = { side: 'white', name: 'pawn' }
  const blackPawn: Piece = { side: 'black', name: 'pawn' }
  const board = [
    [copyPiece(whitePawn), copyPiece(whitePawn), copyPiece(whitePawn)],
    [null, null, null],
    [null, null, null],
    [copyPiece(blackPawn), copyPiece(blackPawn), copyPiece(blackPawn)]
  ]
  expect(printBoard(board)).toMatchInlineSnapshot(`
"----------
|wP|wP|wP|
----------
|  |  |  |
----------
|  |  |  |
----------
|bP|bP|bP|
----------"
`)
});
