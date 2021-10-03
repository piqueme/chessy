import {
  serializePiece,
  readPiece,
  readBoard,
  createStandardBoard,
  serializeBoard,
  serializeSquare
} from '../board'
import type { Square, Piece } from '../board'


const blackBishop: Piece = { type: 'bishop', side: 'black' }
const whitePawn: Piece = { type: 'pawn', side: 'white' }
const cp = (p: Piece): Piece => ({ ...p })
const testBoard = [
  [cp(blackBishop), cp(whitePawn), null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, cp(whitePawn), cp(blackBishop)]
]
const serializedTestBoard = [
  '-------------',
  '|bB|wP|  |  |',
  '-------------',
  '|  |  |  |  |',
  '-------------',
  '|  |  |  |  |',
  '-------------',
  '|  |  |wP|bB|',
  '-------------',
].join('\n')

describe('serializePiece', () => {
  test('correctly serializes black bishop', () => {
    expect(serializePiece({
      type: 'bishop',
      side: 'black'
    })).toEqual('bB')
  });

  test('correctly serializes white pawn', () => {
    expect(serializePiece({
      type: 'pawn',
      side: 'white'
    })).toEqual('wP')
  });
})

describe('readPiece', () => {
  test('correctly parses black bishop from string', () => {
    expect(readPiece('bB')).toEqual({ 'type': 'bishop', 'side': 'black' })
  });

  test('correctly parses white pawn from string', () => {
    expect(readPiece('wP')).toEqual({ 'type': 'pawn', 'side': 'white' })
  });

  test('throws an error when side in short-form is invalid', () => {
    expect(() => { readPiece('xP') }).toThrowError();
  });

  test('throws an error when side in short-form does not exist', () => {
    expect(() => { readPiece('P') }).toThrowError();
  });
})

describe('serializeBoard', () => {
  test('returns an empty string when board has no rows', () => {
    expect(serializeBoard([])).toEqual('')
  });

  test('matches snapshot for small board with multiple pieces and space', () => {
    expect(serializeBoard(testBoard)).toEqual(serializedTestBoard)
  });
})

describe('readBoard', () => {
  test('correctly reads boards with multiple pieces and space', () => {
    expect(readBoard(serializedTestBoard)).toEqual(testBoard)
  });

  test('throws an error for board with piece bigger than 2 spaces', () => {
    const badTestBoard = [
      '-------',
      '|wP|   |',
      '-------',
      '|bB|bB|',
      '-------'
    ].join('\n')
    expect(() => { readBoard(badTestBoard) }).toThrowError()
  });

  test('throws an error for board with non-dash divider', () => {
    const badTestBoard = [
      'xxxxxxx',
      '|wP|  |',
      'xxxxxxx',
      '|bB|bB|',
      'xxxxxxx'
    ].join('\n')
    expect(() => { readBoard(badTestBoard) }).toThrowError()
  });

  test('throws an error for board with unequal row sizes', () => {
    const badTestBoard = [
      '-------',
      '|wP|  |',
      '-------',
      '|bB|bB|wP|',
      '-------'
    ].join('\n')
    expect(() => { readBoard(badTestBoard) }).toThrowError()
  });
})

test('createStandardBoard creates a board with black knights at correct locations', () => {
  const board = createStandardBoard()
  expect(board[0]?.[1]).toEqual({ type: 'knight', side: 'black' })
  expect(board[0]?.[6]).toEqual({ type: 'knight', side: 'black' })
});

describe('serializeSquare', () => {
  test('throws an error when board has unequal row sizes', () => {
    const testSquare: Square = [0, 0]
    const badBoard = [
      [cp(blackBishop), cp(whitePawn), cp(blackBishop)],
      [null, null, cp(whitePawn)],
      [cp(blackBishop), null]
    ]
    expect(() => { serializeSquare(testSquare, badBoard) }).toThrowError()
  });

  test('throws an error when square is outside board', () => {
    const testSquare: Square = [7, 2]
    expect(() => { serializeSquare(testSquare, testBoard) }).toThrowError()
  });

  test('works correctly for square in board', () => {
    const testSquare: Square = [1, 1]
    expect(serializeSquare(testSquare, testBoard)).toEqual('b3')
  });
})
