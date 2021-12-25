import { readBoard } from './board'
import type { Board, Side } from './board'
import type { HistoryMove } from './moves'

export type Puzzle = {
  id: string;
  startBoard: Board;
  sideToMove: Side;
  correctMoves: HistoryMove[];
}

export const testPuzzle: Puzzle = {
  id: 'test-puzzle',
  startBoard: readBoard([
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |bP|  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |bK|',
    '-------------------------',
    '|  |  |  |bR|  |  |wN|wP|',
    '-------------------------',
    '|wB|  |  |  |  |  |wP|wK|',
    '-------------------------',
    '|  |  |bB|bR|wR|  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
  ].join('\n')),
  sideToMove: 'white',
  correctMoves: [
    {
      move: { from: [4, 6], to: [2, 5] },
      notation: 'Nf6+',
    },
    {
      move: { from: [3, 7], to: [2, 7] },
      notation: 'Kh6',
    },
    {
      move: { from: [5, 0], to: [0, 5] },
      notation: 'Bf1#',
    }
  ]
};
