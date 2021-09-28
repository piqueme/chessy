import { readBoard } from '../board'
import type { Square } from '../board'
import type { Move } from '../moves'
import { getPotentialMoves } from '../moves'

// helps compare sets of moves
const moveSorter = (move1: Move, move2: Move) => {
  if (move2.to[0] === move1.to[0] && move2.to[1] === move1.to[1]) { return 0 }
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
    const moves = getPotentialMoves(testBoard, fromSquare)
    const targets: Square[] = [[0, 0], [0, 2], [1, 3], [3, 3], [4, 0]]
    const expectedMoves = targets.map(to => ({ from: fromSquare, to }))
    expect(moves.sort(moveSorter)).toEqual(expectedMoves.sort(moveSorter))
  });

  test('finds all bishop moves in presence of empty, blocked, and takeable squares', () => {

  });

  test('finds all queen moves in presence of empty, blocked, and takeable squares', () => {

  });

  test('finds all rook moves in presence of empty, blocked, and takeable squares', () => {

  });

  test('finds all pawn moves in presence of empty, blocked, and takeable squares', () => {

  });
});
