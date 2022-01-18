import { squareEquals, getEnemySide } from './board'
import { getCheckState, executeMove as chessMove, notate } from './moves'
import { testPuzzle } from './puzzle'
import type { Side, Square, Board, PieceType } from './board'
import type { HistoryMove, CheckState } from './moves'
import type { Puzzle } from './puzzle'

export type History = HistoryMove[];

export type PuzzleMasterGame = {
  sideToMove: Side;
  board: Board;
  checkState: CheckState;
  puzzle: Puzzle;
  history: History;
}

export type PlayerGame = {
  sideToMove: Side;
  board: Board;
  checkState: CheckState;
  history: History;
}

export function createPlayerGame(puzzle: Puzzle = testPuzzle): PlayerGame {
  return {
    sideToMove: 'white',
    board: puzzle.startBoard,
    checkState: 'SAFE',
    history: [],
  }
}

export function createMasterGame(puzzle: Puzzle = testPuzzle): PuzzleMasterGame {
  return {
    sideToMove: 'white',
    board: puzzle.startBoard,
    checkState: 'SAFE',
    puzzle,
    history: [],
  }
}

export function moveMasterGame(from: Square, to: Square, promotion: PieceType | undefined, game: PuzzleMasterGame): {
  game: PuzzleMasterGame;
  puzzleMove?: HistoryMove;
  success: boolean;
} {
  const currentMoveCount = game.history.length
  const nextCorrectMove = game.puzzle.correctMoves[currentMoveCount]?.move
  const previousMove = game.history[currentMoveCount - 1]?.move
  if (!nextCorrectMove) {
    throw new Error('No more moves left in the puzzle!')
  }
  const isCorrectPuzzleMove = squareEquals(from, nextCorrectMove.from) && squareEquals(to, nextCorrectMove.to)
  if (!isCorrectPuzzleMove) {
    return { game, success: false }
  }

  const { fullMove: fullUserMove, newBoard: boardAfterUserMove } = chessMove({ from, to }, previousMove, promotion, game.sideToMove, game.board)
  const notatedMove = notate(fullUserMove, previousMove, game.sideToMove, game.board)
  const historyMove = { move: fullUserMove, notation: notatedMove }
  const newHistory = [...game.history, historyMove]
  const puzzleMove = game.puzzle.correctMoves[currentMoveCount + 1]
  let finalMoveBoard = boardAfterUserMove

  if (puzzleMove) {
    const { newBoard: boardAfterPuzzleMove } = chessMove(
      { from: puzzleMove.move.from, to: puzzleMove.move.to },
      { from: fullUserMove.from, to: fullUserMove.to },
      puzzleMove.move.promotion,
      getEnemySide(game.sideToMove),
      boardAfterUserMove,
    )
    finalMoveBoard = boardAfterPuzzleMove
    newHistory.push(puzzleMove)
  }

  const newSideToMove = puzzleMove ? game.sideToMove : getEnemySide(game.sideToMove)
  const newCheckState = getCheckState(
    puzzleMove ? fullUserMove : previousMove,
    newSideToMove,
    finalMoveBoard
  )

  const newGameState = {
    ...game,
    sideToMove: newSideToMove,
    board: finalMoveBoard,
    checkState: newCheckState,
    history: newHistory
  }

  return {
    game: newGameState,
    success: true,
    ...(puzzleMove ? { puzzleMove } : {})
  }
}

export function movePlayerGame(from: Square, to: Square, promotion: PieceType | undefined, game: PlayerGame): PlayerGame {
  const previousMove = game.history[game.history.length - 1]?.move
  const { fullMove, newBoard } = chessMove({ from, to }, previousMove, promotion, game.sideToMove, game.board)
  const notatedMove = notate(fullMove, previousMove, game.sideToMove, game.board)
  const newSideToMove = getEnemySide(game.sideToMove)
  const newCheckState = getCheckState(previousMove, newSideToMove, newBoard)
  const newHistory = [
    ...game.history,
    { move: fullMove, notation: notatedMove }
  ]
  const newGameState = {
    board: newBoard,
    sideToMove: getEnemySide(game.sideToMove),
    checkState: newCheckState,
    history: newHistory
  }
  return newGameState
}
