import { readBoard } from '../board'
import type { Square } from '../board'
import type { Move } from '../moves'
import { getValidMoves, getPotentialMoves, isCheck } from '../moves'

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
  test('isCheck validates that there are no checks', () => {
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

  test('isCheck validates that there is a check', () => {
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
  // check cases
  //  own piece could put you in check but no other piece
  //  multiple pieces put you in check
  //  no other pieces
  //  no king on board
})

describe('getValidMoves', () => {
  test('finds all knight moves in presence of empty, blocked, and takeable squares', () => {
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
