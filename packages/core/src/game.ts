import { squareEquals, getEnemySide } from './board'
import { getCheckState, executeMove as chessMove } from './moves'
import type { Side, Square, Board, PieceType } from './board'
import type { Take, CheckState } from './moves'

// What is a puzzle?
//  starting state -> Board, Side
//  sequence of correct moves
//
// What is a puzzle game?
//    current board
//    current side to move
//    history of user moves
//    player (IP)
//    [computed -> state -> safe | stale | check | mate]
//
// Puzzle Game Behavior
//  submit move
//  execute move (shortcut all the logic)
//  initialize
//  close
//  serialize (for storage)
//  serialize (for transport)
// History
//  list of moves that can be undo / redo
//  square moved from
//  square moved to
//  pieces taken
//  resulting check state

type HistoryMove = {
  from: Square;
  to: Square;
  take?: Take;
  promote?: PieceType;
  resultCheckState: CheckState;
};

type Puzzle = {
  id: string;
  startBoard: Board;
  sideToMove: Side;
  correctMoves: HistoryMove[];
}

export type PuzzleGame = {
  id: string;
  sideToMove: Side;
  board: Board;
  checkState: CheckState;
  puzzle: Puzzle;
  history: HistoryMove[];
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

const testPuzzle: Puzzle = {
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

// export function create(id: string): PuzzleGame {
//   return {
//     id,
//     sideToMove: 'white',
//     board: createStandardBoard(),
//     checkState: 'SAFE',
//   }
// }

export function createFromPuzzle(id: string, puzzle: Puzzle = testPuzzle): PuzzleGame {
  return {
    id,
    sideToMove: 'white',
    board: puzzle.startBoard,
    checkState: 'SAFE',
    puzzle,
    history: [],
  }
}

// submit move
//  -> if it matches the puzzle
//    -> execute it (chess logic)
//    -> execute next puzzle move (puzzle game response)
//  -> if it does not
//    -> game state is the same
//    -> mark failure

type Result = 'SUCCESS' | 'FAILURE'

export function tryMove(from: Square, to: Square, promote: PieceType | null, game: PuzzleGame): [PuzzleGame, Result] {
  const currentMoveCount = game.history.length
  const nextValidMove = game.puzzle.correctMoves[currentMoveCount]
  const previousMove = game.history[currentMoveCount - 1]
  if (!nextValidMove) {
    throw new Error('No more moves left in the puzzle!')
  }
  if (squareEquals(from, nextValidMove.from) && squareEquals(to, nextValidMove.to)) {
    const result = chessMove({ from, to }, previousMove || null, promote, game.sideToMove, game.board)
    const newSideToMove = getEnemySide(game.sideToMove)
    const newCheckState = getCheckState(previousMove || null, newSideToMove, result.board)

    return [{
      ...game,
      sideToMove: newSideToMove,
      board: result.board,
      checkState: newCheckState,
      history: [...game.history, {
        from,
        to,
        ...(result.take ? { take: result.take } : {}),
        ...(result.promotion ? { promote: result.promotion } : {}),
        resultCheckState: newCheckState
      }]
    }, 'SUCCESS']
  }

  return [game, 'FAILURE']
}

// CLIENT
// if move is valid, just submit it, no correctness
