import { createStandardBoard, getEnemySide } from './board'
import { getCheckState, executeMove, move } from './moves'
import type { Side, Square, Board } from './board'
import type { Move, CheckState } from './moves'

// What is a puzzle?
//  starting state -> Board, Side
//  sequence of correct moves
//
// Group Puzzle
//  start
//  history = Proposal + Move[]
//  promoting
//  check
//  propose
//    consensus
//    move
//      correct ? chess move | reject
//  view
//
// Emit Events

export type Game = {
  id: string;
  currentSide: Side;
  board: Board;
  history: Move[];
  checkState: CheckState;
}

export function createGame(id: string): Game {
  return {
    id,
    currentSide: 'white',
    board: createStandardBoard(),
    history: ([] as Move[]),
    checkState: 'SAFE',
  }
}

export function submitMove(from: Square, to: Square, game: Game): Game {
  const moveOutcome = move(from, to, game.currentSide, game.board)
  game.board = moveOutcome.board
  game.currentSide = getEnemySide(game.currentSide)
  game.history.push(moveOutcome.move)
  game.checkState = getCheckState(game.currentSide, game.board)
  return game
}

export function executeGameMove(from: Square, to: Square, game: Game): Game {
  const moveOutcome = executeMove(from, to, game.board)
  game.board = moveOutcome.board
  game.history.push(moveOutcome.move)
  game.checkState = getCheckState(game.currentSide, game.board)
  return game
}

// export function serializeGame(game: Game): string {
//   return ''
// }
