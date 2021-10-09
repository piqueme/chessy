import { createStandardBoard, getEnemySide } from './board'
import { getCheckState, move } from './moves'
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

type ViewState = 'VIEWING' | 'CURRENT'
type Game = {
  currentSide: Side;
  board: Board;
  history: Move[];
  checkState: CheckState;
  viewState: ViewState;
}

export function createGame(): Game {
  return {
    currentSide: 'white',
    board: createStandardBoard(),
    history: ([] as Move[]),
    checkState: 'SAFE',
    viewState: 'CURRENT',
  }
}

export function submitMove(from: Square, to: Square, game: Game): Game {
  if (game.viewState !== 'CURRENT') {
    throw new Error('Cannot make a move in a game when reviewing history')
  }

  const moveOutcome = move(from, to, game.currentSide, game.board)
  game.board = moveOutcome.board
  game.currentSide = getEnemySide(game.currentSide)
  game.history.push(moveOutcome.move)
  game.checkState = getCheckState(game.currentSide, game.board)
  return game
}

export function gotoMove(moveNumber: number, game: Game): Game {
  if (moveNumber < 0 || moveNumber >= game.history.length) {
    throw new Error(`Move number is out of game range. Max number is ${game.history.length - 1}`)
  }

  // move numbers 0-indexed
  let board = createStandardBoard()
  let moveSide: Side = 'white'
  for (let i = 0; i <= moveNumber; i++) {
    const historyMove = game.history[i]
    if (!historyMove) { throw new Error(`Move number ${i} not found in history`) }
    const moveResult = move(historyMove.from, historyMove.to, moveSide, board)
    board = moveResult.board
    moveSide = getEnemySide(moveSide)
  }

  game.board = board
  game.currentSide = moveSide
  game.checkState = getCheckState(game.currentSide, game.board)
  game.viewState = (moveNumber === game.history.length - 1) ? 'CURRENT' : 'VIEWING'
  return game
}
