import type { Puzzle } from '@chessy/core'
import { readBoard } from '@chessy/core'

export const mockPuzzle: Puzzle = {
  _id: 'test-puzzle-id',
  sideToMove: 'black',
  startBoard: readBoard([
      '-------------------------',
      '|  |  |  |  |bR|  |bK|  |',
      '-------------------------',
      '|wR|  |  |  |  |  |  |bP|',
      '-------------------------',
      '|bP|  |  |  |bP|wB|bP|  |',
      '-------------------------',
      '|wP|bB|  |  |wP|  |  |  |',
      '-------------------------',
      '|  |  |  |  |  |wP|  |wP|',
      '-------------------------',
      '|  |  |  |  |  |wB|  |  |',
      '-------------------------',
      '|  |  |  |  |  |bR|  |  |',
      '-------------------------',
      '|  |  |  |  |  |  |  |wK|',
      '-------------------------',
  ].join('\n')),
  correctMoves: [
      {
          move: {
              from: [
                  0,
                  4
              ],
              to: [
                  0,
                  2
              ]
          },
          notation: 'Rc8',
      },
  ],
}
