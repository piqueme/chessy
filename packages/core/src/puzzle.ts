import type { Board, Side } from './board'
import type { HistoryMove } from './moves'

export type Puzzle = {
  id: string;
  startBoard: Board;
  sideToMove: Side;
  correctMoves: HistoryMove[];
}

const pieces = [
  { type: 'pawn', side: 'black' },
  { type: 'king', side: 'black' },
  { type: 'bishop', side: 'black' },
  { type: 'rook', side: 'black' },
  { type: 'rook', side: 'white' },
  { type: 'bishop', side: 'white' },
  { type: 'pawn', side: 'white' },
  { type: 'king', side: 'white' },
  { type: 'rook', side: 'black' },
  { type: 'knight', side: 'white' },
  { type: 'pawn', side: 'white' },
];

export const testPuzzle: Puzzle = {
  id: 'test-puzzle',
  startBoard: [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, pieces[0], null],
    [null, null, null, null, null, null, null, pieces[1]],
    [null, null, null, pieces[8], null, null, pieces[9], pieces[10]],
    [pieces[5], null, null, null, null, null, pieces[6], pieces[7]],
    [null, null, pieces[2], pieces[3], pieces[4], null, null, null],
    [null, null, null, null, null, null, null, null],
  ] as Board,
  sideToMove: 'white',
  correctMoves: [
    { from: [4, 6], to: [2, 5], resultCheckState: 'CHECK' },
    { from: [3, 7], to: [2, 7], resultCheckState: 'SAFE' },
    { from: [5, 0], to: [0, 5], resultCheckState: 'CHECKMATE' },
  ]
};
