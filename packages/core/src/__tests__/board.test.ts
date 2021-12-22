import {
  serializePiece,
  readPiece,
  isBoardValid,
  readBoard,
  readCompressedBoard,
  createStandardBoard,
  serializeBoard,
  serializeCompressedBoard,
  atSquare,
  getAllSquares,
  findPieces,
  serializeSquare,
  shift,
  mutateBoard
} from '../board'
import type { Side, Square, PieceType, Piece, Board, Mutation } from '../board'


const blackBishop: Piece = { type: 'bishop', side: 'black' }
const whitePawn: Piece = { type: 'pawn', side: 'white' }
const cp = (p: Piece): Piece => ({ ...p })
const testBoard: Board = [
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
const compressedTestBoard = 'bP2/4/4/2Pb'

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

describe('isBoardValid', () => {
  test('returns false when input is empty array', () => {
    expect(isBoardValid([])).toEqual(false)
  })

  test('returns false when single row is empty', () => {
    expect(isBoardValid([[]])).toEqual(false)
  })

  test('returns true for board with single row and column', () => {
    expect(isBoardValid([[cp(whitePawn)]])).toEqual(true)
  })

  test('returns false for board with unequal columns in rows', () => {
    expect(isBoardValid([
      [cp(whitePawn), cp(whitePawn)],
      [cp(whitePawn), null, cp(whitePawn)]
    ])).toEqual(false)
  })

  test('returns true when multiple rows with equal number of columns', () => {
    expect(isBoardValid([
      [cp(whitePawn), cp(whitePawn), cp(whitePawn)],
      [null, cp(whitePawn), cp(whitePawn)]
    ])).toEqual(true)
  })
})

describe('serializeBoard', () => {
  test('works correctly for small board with multiple pieces and space', () => {
    expect(serializeBoard(testBoard)).toEqual(serializedTestBoard)
  });
})

describe.only('serializeCompressedBoard', () => {
  test('works correctly for small board with multiple pieces and space', () => {
    expect(serializeCompressedBoard(testBoard)).toEqual(compressedTestBoard)
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

describe('readCompressedBoard', () => {
  test('correctly reads boards with multiple pieces and space', () => {
    expect(readCompressedBoard(compressedTestBoard)).toEqual(testBoard)
  });

  test('throws an error for board with invalid characters', () => {
    const badTestBoard = 'x4/5/5/b3B/Q4'
    expect(() => { readCompressedBoard(badTestBoard) }).toThrowError()
  });

  test('throws an error for board with unequal row sizes', () => {
    const badTestBoard = 'p4p/5/5/Q4'
    expect(() => { readBoard(badTestBoard) }).toThrowError()
  });
})

test('createStandardBoard creates a board with black knights at correct locations', () => {
  const board = createStandardBoard()
  expect(board[0]?.[1]).toEqual({ type: 'knight', side: 'black' })
  expect(board[0]?.[6]).toEqual({ type: 'knight', side: 'black' })
});

describe('atSquare', () => {
  test('throws an error if the specified square is not on the board', () => {
    const testSquare: Square = [4, 4]
    expect(() => { atSquare(testSquare, testBoard) }).toThrow()
  })

  test('returns piece if existing at square', () => {
    const testSquare: Square = [0, 1]
    expect(atSquare(testSquare, testBoard)).toEqual(whitePawn)
  })

  test('returns null if square is empty', () => {
    const testSquare: Square = [3, 0]
    expect(atSquare(testSquare, testBoard)).toEqual(null)
  })
})

test('getAllSquares returns all squares for rectangular board', () => {
  expect(getAllSquares(testBoard)).toEqual([
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 0], [1, 1], [1, 2], [1, 3],
    [2, 0], [2, 1], [2, 2], [2, 3],
    [3, 0], [3, 1], [3, 2], [3, 3]
  ])
})

describe('findPieces', () => {
  test('returns all piece squares if no piece fields are specified', () => {
    expect(findPieces({}, testBoard)).toEqual([
      [0, 0], [0, 1],
      [3, 2], [3, 3]
    ])
  })

  test('returns white piece squares if white side only specified', () => {
    const pieceParams = { side: 'white' as Side }
    expect(findPieces(pieceParams, testBoard)).toEqual([
      [0, 1], [3, 2]
    ])
  })

  test('returns black bishop squares if black side and bishop type specified', () => {
    const pieceParams = { type: 'bishop' as PieceType, side: 'black' as Side }
    expect(findPieces(pieceParams, testBoard)).toEqual([
      [0, 0], [3, 3]
    ])
  })
})

describe('serializeSquare', () => {
  test('throws an error when square is outside board', () => {
    const testSquare: Square = [7, 2]
    expect(() => { serializeSquare(testSquare, testBoard) }).toThrowError()
  });

  test('works correctly for square in board', () => {
    const testSquare: Square = [1, 1]
    expect(serializeSquare(testSquare, testBoard)).toEqual('b3')
  });
})

describe('shift', () => {
  test('returns same square if change is [0, 0]', () => {
    const testSquare: Square = [2, 2]
    expect(shift(testSquare, [0, 0])).toEqual([2, 2])
  })

  test('works correctly for negative change values', () => {
    const testSquare: Square = [2, 2]
    expect(shift(testSquare, [-3, 2])).toEqual([-1, 4])
  })

  test('works correctly, for positive change values', () => {
    const testSquare: Square = [2, 2]
    expect(shift(testSquare, [4, 7])).toEqual([6, 9])
  })
})

describe('mutateBoard', () => {
  test('throws an error if mutation has square not in board', () => {
    const mutations: Mutation[] = [
      { square: [0, 2], piece: null },
      { square: [5, 1], piece: cp(whitePawn) }
    ]
    expect(() => { mutateBoard(mutations, testBoard) }).toThrowError()
  })

  test('returns same pieces but different object identity board when no mutations', () => {
    const mutations: Mutation[] = []
    const newBoard = mutateBoard(mutations, testBoard)
    expect(newBoard).toEqual(testBoard)
    expect(newBoard).not.toBe(testBoard)
    expect(newBoard[0]).not.toBe(testBoard[0])
  })

  test('returns new board correctly when all mutations are piece replacements', () => {
    const mutations: Mutation[] = [
      { square: [0, 2], piece: cp(blackBishop) },
      { square: [3, 2], piece: cp(blackBishop) }
    ]
    const newBoard = mutateBoard(mutations, testBoard)
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[0].length; j++) {
        if ((i == 0 && j == 2) || (i == 3 && j == 2)) {
          expect(newBoard[i]?.[j]).toEqual(blackBishop)
        } else {
          expect(newBoard[i]?.[j]).toEqual(testBoard[i]?.[j])
        }
      }
    }
  })

  test('returns new board correctly when mutation has piece removals', () => {
    const mutations: Mutation[] = [
      { square: [0, 0], piece: null },
      { square: [3, 2], piece: cp(blackBishop) }
    ]
    const newBoard = mutateBoard(mutations, testBoard)
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[0].length; j++) {
        if (i == 0 && j == 0) {
          expect(newBoard[i]?.[j]).toEqual(null)
        } else if (i == 3 && j == 2) {
          expect(newBoard[i]?.[j]).toEqual(blackBishop)
        } else {
          expect(newBoard[i]?.[j]).toEqual(testBoard[i]?.[j])
        }
      }
    }
  })
})
