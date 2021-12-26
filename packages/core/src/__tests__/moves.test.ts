import { readBoard } from '../board'
import type { Square, Piece } from '../board'
import type { Move, FullMove, MoveWithTake } from '../moves'
import {
  getFeasibleMoves,
  getAllFeasibleMoves,
  getValidMoves,
  getCheckState,
  canPromoteFromAssumedValidMove,
  executeMove,
  notate,
  parseMoveNotation,
} from '../moves'

// helps compare sets of moves
const moveSorter = (move1: Move, move2: Move) => {
  if (move2.to[0] === move1.to[0]) {
    return move1.to[1] - move2.to[1]
  }
  if (move2.to[0] < move1.to[0]) { return 1 }
  return -1
}

describe('getFeasibleMoves', () => {
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
    const moves = getFeasibleMoves(fromSquare, undefined, 'white', testBoard)
    const targets: Square[] = [[0, 0], [0, 2], [1, 3], [3, 3], [4, 0]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
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
    const moves = getFeasibleMoves(fromSquare, undefined, 'white', testBoard)
    const targets: Square[] = [
      [0, 2], [1, 2], [2, 2], [3, 2], [3, 3],
      [2, 0], [3, 1], [4, 0], [4, 1], [4, 3], [4, 4]
    ]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
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
    const moves = getFeasibleMoves(fromSquare, undefined, 'black', testBoard)
    const targets: Square[] = [[3, 1], [3, 2]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
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
    const moves = getFeasibleMoves(fromSquare, undefined, 'black', testBoard)
    const targets: Square[] = [[1, 0], [1, 1], [1, 2], [2, 2], [3, 0], [3, 1], [3, 2]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });
});

describe('getAllFeasibleMoves', () => {
  test('gets all feasible moves for small board with few pieces', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |  |bK|  |  |',
      '----------------',
      '|  |  |wN|  |  |',
      '----------------',
      '|bQ|  |wR|  |  |',
      '----------------',
      '|  |wP|  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))

    const feasibleMoves = getAllFeasibleMoves(
      undefined,
      'black',
      testBoard
    )
    const whiteRook: Piece = { type: 'rook', side: 'white' }
    const whitePawn: Piece = { type: 'pawn', side: 'white' }
    const whiteKnight: Piece = { type: 'knight', side: 'white' }
    const expectedMoves: MoveWithTake[] = [
      { from: [0, 2], to: [0, 1] },
      { from: [0, 2], to: [1, 1] },
      { from: [0, 2], to: [1, 2], take: { square: [1, 2], piece: whiteKnight } },
      { from: [0, 2], to: [0, 3] },
      { from: [0, 2], to: [1, 3] },
      { from: [2, 0], to: [0, 0] },
      { from: [2, 0], to: [1, 0] },
      { from: [2, 0], to: [3, 0] },
      { from: [2, 0], to: [4, 0] },
      { from: [2, 0], to: [1, 1] },
      { from: [2, 0], to: [2, 1] },
      { from: [2, 0], to: [3, 1], take: { square: [3, 1], piece: whitePawn } },
      { from: [2, 0], to: [2, 2], take: { square: [2, 2], piece: whiteRook } },
    ]
    expect(feasibleMoves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });
})

describe('getValidMoves', () => {
  test('finds all knight moves including those that remove piece', () => {
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
    const moves = getValidMoves(fromSquare, undefined, 'white', testBoard)
    const targets: Square[] = [[0, 0], [0, 2], [1, 3], [3, 3], [4, 0]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
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
    const moves = getValidMoves(fromSquare, undefined, 'white', testBoard)
    const targets: Square[] = [[3, 3]]
    const expectedMoves = targets.map(to => {
      const takenPiece = testBoard[to[0]]?.[to[1]]
      const take = { square: [to[0], to[1]], piece: takenPiece }
      return {
        from: fromSquare,
        to,
        ...(takenPiece ? { take } : {})
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
    const moves = getValidMoves(fromSquare, undefined, 'white', testBoard)
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
    const moves = getValidMoves(fromSquare, undefined, 'white', testBoard)
    const targets: Square[] = [[3, 2], [4, 2], [3, 4], [4, 4]]
    const expectedMoves = targets.map(to => {
      return {
        from: fromSquare,
        to,
      }
    })
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });
})

describe('getCheckState', () => {
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
    expect(getCheckState(undefined, 'black', testBoard)).toEqual('SAFE')
  })

  test('validates that there is a check from a single piece', () => {
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
    expect(getCheckState(undefined, 'black', testBoard)).toEqual('CHECK')
  })

  test('validates that there is a check from multiple pieces', () => {
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
    expect(getCheckState(undefined, 'black', testBoard)).toEqual('CHECK')
  })

  test('recognizes checkmate', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|  |  |wR|',
      '----------------',
      '|  |  |  |wR|  |',
      '----------------',
      '|  |  |  |  |wK|',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    expect(getCheckState(undefined, 'black', testBoard)).toEqual('CHECKMATE')
  })
})

describe('canPromoteFromAssumedValidMove', () => {
  test('returns true when pawn moves to last row validly', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|bR|  |  |',
      '----------------',
      '|  |  |  |wP|  |',
      '----------------',
      '|  |  |  |  |wK|',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    const canPromote = canPromoteFromAssumedValidMove({
      from: [1, 3],
      to: [0, 2]
    }, 'white', testBoard)
    expect(canPromote).toEqual(true)
  })

  test('returns true even when pawn moves to last row invalidly (existing check)', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|bR|  |  |',
      '----------------',
      '|  |  |  |wP|  |',
      '----------------',
      '|  |  |  |  |wK|',
      '----------------',
      '|  |  |  |  |bR|',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    const canPromote = canPromoteFromAssumedValidMove({
      from: [1, 3],
      to: [0, 3]
    }, 'white', testBoard)
    expect(canPromote).toEqual(true)
  })

  test('returns false pawn does not move to last row', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|bR|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wP|wK|',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    const canPromote = canPromoteFromAssumedValidMove({
      from: [2, 3],
      to: [1, 3]
    }, 'white', testBoard)
    expect(canPromote).toEqual(false)
  })

  test('returns false when pawn moves to own side last row', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|bR|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wR|wK|',
      '----------------',
      '|  |  |  |wP|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    const canPromote = canPromoteFromAssumedValidMove({
      from: [3, 3],
      to: [4, 3]
    }, 'white', testBoard)
    expect(canPromote).toEqual(false)
  })

  test('throws error when checking non-pawn moving to last row', () => {
    const testBoard = readBoard([
      '----------------',
      '|  |bK|bR|  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |wR|wK|',
      '----------------',
      '|  |  |  |bR|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
    ].join('\n'))
    const canPromote = canPromoteFromAssumedValidMove({
      from: [2, 3],
      to: [0, 3]
    }, 'white', testBoard)
    expect(canPromote).toEqual(false)
  })
})

describe('executeMove', () => {
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
      executeMove(
        { from: [3, 3], to: [3, 4] },
        undefined,
        undefined,
        'black',
        testBoard
      )
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
      executeMove(
        { from: [4, 3], to: [4, 2] },
        undefined,
        undefined,
        'black',
        testBoard
      )
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
      '|  |wQ|  |  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    expect(() => {
      executeMove(
        { from: [3, 1], to: [0, 4] },
        undefined,
        undefined,
        'white',
        testBoard
      )
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
      executeMove(
        { from: [3, 3], to: [2, 2] },
        undefined,
        undefined,
        'white',
        testBoard
      )
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

    const move: Move = { from: [4, 3], to: [4, 2] }
    const moveResult = executeMove(
      move,
      undefined,
      undefined,
      'white',
      preMoveBoard
    )

    expect(moveResult).toEqual({
      fullMove: move,
      newBoard: postMoveBoard,
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

    const move: Move = { from: [2, 2], to: [1, 3] }
    const moveResult = executeMove(
      move,
      undefined,
      undefined,
      'white',
      preMoveBoard
    )

    expect(moveResult).toEqual({
      fullMove: {
        ...move,
        take: {
          square: [1, 3],
          piece: { type: 'rook', side: 'black' }
        }
      },
      newBoard: postMoveBoard,
    })
  })

  test('successfully executes first pawn move two squares', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |bK|  |',
      '----------------',
      '|bP|bP|bP|bP|  |',
      '----------------',
      '|  |  |  |  |bP|',
      '----------------',
      '|  |  |  |wP|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |bK|  |',
      '----------------',
      '|bP|  |bP|bP|  |',
      '----------------',
      '|  |  |  |  |bP|',
      '----------------',
      '|  |bP|  |wP|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const move: Move = { from: [1, 1], to: [3, 1] }
    const moveResult = executeMove(
      move,
      undefined,
      undefined,
      'black',
      preMoveBoard
    )

    expect(moveResult).toEqual({
      fullMove: move,
      newBoard: postMoveBoard,
    })
  })

  test('successfully executes pawn en passant', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |  |bK|  |',
      '----------------',
      '|bP|bP|  |bP|  |',
      '----------------',
      '|  |  |  |  |bP|',
      '----------------',
      '|  |  |bP|wP|  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |  |bK|  |',
      '----------------',
      '|bP|bP|  |bP|  |',
      '----------------',
      '|  |  |wP|  |bP|',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const move: Move = { from: [3, 3], to: [2, 2] }
    const previousMove: Move = { from: [1, 2], to: [3, 2] }
    const moveResult = executeMove(
      move,
      previousMove,
      undefined,
      'white',
      preMoveBoard
    )

    expect(moveResult).toEqual({
      fullMove: {
        ...move,
        take: {
          piece: { side: 'black', type: 'pawn' },
          square: [3, 2]
        }
      },
      newBoard: postMoveBoard,
    })
  })

  test('successfully executes pawn take and promote', () => {
    const preMoveBoard = readBoard([
      '----------------',
      '|  |  |bR|bK|  |',
      '----------------',
      '|bP|wP|  |bP|  |',
      '----------------',
      '|  |  |  |  |bP|',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const postMoveBoard = readBoard([
      '----------------',
      '|  |  |wQ|bK|  |',
      '----------------',
      '|bP|  |  |bP|  |',
      '----------------',
      '|  |  |  |  |bP|',
      '----------------',
      '|  |  |  |  |  |',
      '----------------',
      '|  |wP|wP|  |  |',
      '----------------',
      '|  |  |  |wK|  |',
      '----------------',
    ].join('\n'))

    const move: Move = { from: [1, 1], to: [0, 2] }
    const promotion = 'queen'
    const moveResult = executeMove(
      move,
      undefined,
      promotion,
      'white',
      preMoveBoard
    )

    expect(moveResult).toEqual({
      fullMove: {
        ...move,
        promotion,
        take: {
          piece: { side: 'black', type: 'rook' },
          square: [0, 2]
        },
      },
      newBoard: postMoveBoard,
    })
  })
})

// NOTE: This can be slightly annoying to maintain given all the notation move
// types it's trying to satisfy
describe('notate', () => {
  const notationTestBoard = readBoard([
    "-------------------------",
    "|bK|  |  |  |  |  |  |  |",
    "-------------------------",
    "|  |  |wP|  |  |wP|  |  |",
    "-------------------------",
    "|  |wP|  |  |  |  |  |  |",
    "-------------------------",
    "|  |  |  |  |  |  |bP|wP|",
    "-------------------------",
    "|  |bB|  |bB|wK|  |  |  |",
    "-------------------------",
    "|  |wR|  |  |  |  |  |  |",
    "-------------------------",
    "|  |bB|  |  |  |  |  |  |",
    "-------------------------",
    "|  |  |  |  |  |  |  |  |",
    "-------------------------",
  ].join('\n'))

  test('for basic non-pawn move includes piece and target square', () => {
    const from: Square = [5, 1]
    const to: Square = [5, 6]
    const move = { from, to }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('Rg3')
  })

  test('for basic pawn move includes only target square', () => {
    const from: Square = [3, 7]
    const to: Square = [2, 7]
    const move = { from, to }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('h6')
  })

  test('includes "x" with take for non-pawn move', () => {
    const from: Square = [5, 1]
    const to: Square = [4, 1]
    const take = {
      piece: { side: 'black', type: 'bishop' } as Piece,
      square: [4, 1] as Square,
    }
    const move: FullMove = { from, to, take }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('Rxb4')
  })

  test('for en passant appends e.p. without changing move target square', () => {
    const from: Square = [3, 7]
    const to: Square = [2, 6]
    const take = {
      piece: { side: 'black', type: 'pawn' } as Piece,
      square: [3, 6] as Square,
    }
    const move: FullMove = { from, to, take }
    const previous: FullMove = {
      from: [1, 6],
      to: [3, 6],
    }

    expect(notate(move, previous, 'white', notationTestBoard)).toEqual('hxg6 e.p.')
  })

  test('when move results in check adds +', () => {
    const from: Square = [5, 1]
    const to: Square = [5, 0]
    const move: FullMove = { from, to }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('Ra3+')
  })

  test('when move results in checkmate adds #', () => {
    const from: Square = [1, 2]
    const to: Square = [0, 2]
    const move: FullMove = { from, to, promotion: 'queen' }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('c8=Q#')
  })

  test('when move results in promotion to queen includes "=Q"', () => {
    const from: Square = [1, 5]
    const to: Square = [0, 5]
    const move: FullMove = { from, to, promotion: 'queen' }

    expect(notate(move, undefined, 'white', notationTestBoard)).toEqual('f8=Q+')
  })

  test('when only way to identify piece moved is by unique square includes square', () => {
    const from: Square = [4, 1]
    const to: Square = [5, 2]
    const move: FullMove = { from, to }

    expect(notate(move, undefined, 'black', notationTestBoard)).toEqual('Bb4c3')
  })
})

describe('parseMoveNotation', () => {
  test('parses correctly for pawn move forward', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |wP|  |wP|  |wP|wP|  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'd4'
    expect(parseMoveNotation(notatedMove, 'white', board)).toEqual({
      from: [6, 3],
      to: [4, 3],
    })
  })

  test('parses correctly for pawn take', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |bB|  |  |  |",
      "-------------------------",
      "|  |  |  |wP|wP|  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'dxe5'
    expect(parseMoveNotation(notatedMove, 'white', board)).toEqual({
      from: [4, 3],
      to: [3, 4],
      take: {
        piece: { type: 'bishop', side: 'black' },
        square: [3, 4]
      }
    })
  })

  test('parses correctly for bishop move without take', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |bB|  |  |  |",
      "-------------------------",
      "|  |  |  |wP|wP|  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'Bg3'
    expect(parseMoveNotation(notatedMove, 'black', board)).toEqual({
      from: [3, 4],
      to: [5, 6],
    })
  })

  test('parses correctly for rook take with disambiguation', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |bR|  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |bB|  |  |  |",
      "-------------------------",
      "|  |bR|  |wP|wP|  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'Rbxd4'
    expect(parseMoveNotation(notatedMove, 'black', board)).toEqual({
      from: [4, 1],
      to: [4, 3],
      take: {
        piece: { type: 'pawn', side: 'white' },
        square: [4, 3]
      }
    })
  })

  test('parses correctly for knight take placing king in check', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |bB|  |  |  |",
      "-------------------------",
      "|  |  |  |wP|wP|bN|  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |wB|  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'Nxe2+'
    expect(parseMoveNotation(notatedMove, 'black', board)).toEqual({
      from: [4, 5],
      to: [6, 4],
      take: {
        piece: { type: 'bishop', side: 'white' },
        square: [6, 4]
      }
    })
  })

  test('parses correctly for en passant', () => {
    const board = readBoard([
      "-------------------------",
      "|  |  |bK|  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|wP|bP|  |  |bB|  |  |  |",
      "-------------------------",
      "|  |  |  |wP|wP|  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'axb6 e.p.'
    expect(parseMoveNotation(notatedMove, 'white', board)).toEqual({
      from: [3, 0],
      to: [2, 1],
      take: {
        piece: { type: 'pawn', side: 'black' },
        square: [3, 1]
      }
    })
  })

  test('parses correctly for pawn promotion resulting in checkmate', () => {
    const board = readBoard([
      "-------------------------",
      "|bK|  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |wP|  |  |  |  |",
      "-------------------------",
      "|  |wQ|  |  |  |  |  |  |",
      "-------------------------",
      "|  |bP|  |  |bB|  |  |  |",
      "-------------------------",
      "|  |  |  |wP|wP|  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |  |  |  |  |  |  |",
      "-------------------------",
      "|  |  |wK|  |  |  |  |  |",
      "-------------------------",
    ].join('\n'))

    const notatedMove = 'd8=R#'
    expect(parseMoveNotation(notatedMove, 'white', board)).toEqual({
      from: [1, 3],
      to: [0, 3],
      promotion: 'rook',
    })
  })
})
