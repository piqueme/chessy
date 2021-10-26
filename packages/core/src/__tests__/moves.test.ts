import { readBoard } from '../board'
import type { Square } from '../board'
import type { Move } from '../moves'
import {
  getValidMoves,
  getPotentialMoves,
  isCheck,
  executeMove,
  move
} from '../moves'

// helps compare sets of moves
const moveSorter = (move1: Move, move2: Move) => {
  if (move2.to[0] === move1.to[0]) {
    return move1.to[1] - move2.to[1]
  }
  if (move2.to[0] < move1.to[0]) { return 1 }
  return -1
}

describe('getPotentialMoves', () => {
  test('finds all knight moves in presence of empty, blocked, and takeable squares', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |wN|  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wQ|  |  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [2, 1]
    const moves = getPotentialMoves(fromSquare, testBoard)
    const targets: Square[] = [[0, 0], [0, 2], [1, 3], [3, 3], [4, 0]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds all queen moves in presence of empty, blocked, and takeable squares', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |wN|  |  |  |',
      '----------------',
      '|  |  |  |bB|  |',
      '----------------',
      '|  |  |wQ|  |  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [4, 2]
    const moves = getPotentialMoves(fromSquare, testBoard)
    const targets: Square[] = [
      [0, 2], [1, 2], [2, 2], [3, 2], [3, 3],
      [2, 0], [3, 1], [4, 0], [4, 1], [4, 3], [4, 4]
    ]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds black pawn moves in presence of empty, blocked, and takeable squares', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wQ|  |  |',
      '----------------',
      '|  |bP|  |  |  |',
      '----------------',
      '|  |  |wQ|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [2, 1]
    const moves = getPotentialMoves(fromSquare, testBoard)
    const targets: Square[] = [[3, 1], [3, 2]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds king moves in presence of empty, blocked, and takeable squares', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wN|  |  |',
      '----------------',
      '|bQ|bK|  |  |  |',
      '----------------',
      '|  |wP|  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [2, 1]
    const moves = getPotentialMoves(fromSquare, testBoard)
    const targets: Square[] = [[1, 0], [1, 1], [1, 2], [2, 2], [3, 0], [3, 1], [3, 2]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });
});

describe('isCheck', () => {
  test('validates that there are no checks', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wN|  |  |',
      '----------------',
      '|bQ|bK|  |  |  |',
      '----------------',
      '|  |wP|  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    expect(isCheck('black', testBoard)).toEqual(false)
  })

  test('isCheck validates that there is a check from a single piece', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wN|  |  |',
      '----------------',
      '|bQ|bK|  |  |  |',
      '----------------',
      '|  |  |wP|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    expect(isCheck('black', testBoard)).toEqual(true)
  })

  test('isCheck validates that there is a check from multiple piece', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wN|  |  |',
      '----------------',
      '|bQ|bK|  |wR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
    ].join('\n'))
    expect(isCheck('black', testBoard)).toEqual(true)
  })
})

describe('getValidMoves', () => {
  test('finds all knight moves including those that remove check', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |wN|  |  |  |',
      '----------------',
      '|  |  |wK|  |  |',
      '----------------',
      '|  |  |wQ|  |  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [2, 1]
    const moves = getValidMoves(fromSquare, testBoard)
    const targets: Square[] = [[0, 0], [0, 2], [1, 3], [3, 3], [4, 0]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds only move for knight that blocks existing check', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wN|  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |wQ|wK|  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [2, 1]
    const moves = getValidMoves(fromSquare, testBoard)
    const targets: Square[] = [[3, 3]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds no moves for bishop that is blocking check', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [3, 3]
    const moves = getValidMoves(fromSquare, testBoard)
    expect(moves.sort(moveSorter)).toEqual([])
  });

  test('finds moves for king that take out of check from rook', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const fromSquare: Square = [4, 3]
    const moves = getValidMoves(fromSquare, testBoard)
    const targets: Square[] = [[3, 2], [4, 2], [3, 4], [4, 4]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { takenPiece } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });
})

describe('move', () => {
  test('throws error when no piece at from square', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    expect(() => {
      move([3, 3], [3, 4], 'black', testBoard)
    }).toThrowError()
  })

  test('throws error if piece at from square is not given side', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    expect(() => {
      move([4, 3], [4, 2], 'black', testBoard)
    }).toThrowError()
  })

  test('throws error if move goes to square out of piece movement range', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    expect(() => {
      move([4, 3], [4, 1], 'white', testBoard)
    }).toThrowError()
  })

  test('throws error if move goes to square resulting in check', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    expect(() => {
      move([3, 3], [2, 2], 'white', testBoard)
    }).toThrowError()
  })

  test('returns a new updated board for a valid move to an empty square', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
      '|  |  |wK|  |  |',
      '----------------',
    ].join('\n'))

    const from: Square = [4, 3]
    const to: Square = [4, 2]
    expect(move(from, to, 'white', preMoveBoard)).toEqual({
      board: postMoveBoard,
      move: {
        from,
        to,
      }
    })
  })

  test('returns a new updated board for a valid move taking a piece', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |wB|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const from: Square = [2, 2]
    const to: Square = [1, 3]
    expect(move(from, to, 'white', preMoveBoard)).toEqual({
      board: postMoveBoard,
      move: {
        from,
        to,
        takenPiece: { type: 'rook', side: 'black' }
      }
    })
  })
})

describe('executeMove', () => {
  // move needs from,to
  // move will replace piece if exists
  test('does not change board if from and to are both empty', () => {
    const board = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |wB|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const from: Square = [1, 1]
    const to: Square = [4, 1]
    expect(executeMove(from, to, board)).toEqual({
      board,
      move: {
        from,
        to,
      }
    })
  })

  test('replaces "to" piece with "from" piece even if same side', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |wB|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wB|  |',
      '----------------',
    ].join('\n'))

    const from: Square = [2, 2]
    const to: Square = [4, 3]
    expect(executeMove(from, to, preMoveBoard)).toEqual({
      board: postMoveBoard,
      move: {
        from,
        to,
      }
    })
  })

  test('replaces "to" piece with "from" piece if different sides', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |wB|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |bR|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const from: Square = [1, 3]
    const to: Square = [2, 2]
    expect(executeMove(from, to, preMoveBoard)).toEqual({
      board: postMoveBoard,
      move: {
        from,
        to,
      }
    })
  })

  test('takes piece at "from" and places it on empty "to" without move rules', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |wB|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|wB|  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const from: Square = [2, 2]
    const to: Square = [2, 0]
    expect(executeMove(from, to, preMoveBoard)).toEqual({
      board: postMoveBoard,
      move: {
        from,
        to,
      }
    })
  })
})
