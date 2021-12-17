import { squareEquals, getEnemySide } from './board'
import { getCheckState, executeMove as chessMove } from './moves'
import { testPuzzle } from './puzzle'
import type { Side, Square, Board, PieceType } from './board'
import type { HistoryMove, CheckState } from './moves'
import type { Puzzle } from './puzzle'

export type PuzzleMasterGame = {
  sideToMove: Side;
  board: Board;
  checkState: CheckState;
  puzzle: Puzzle;
  history: HistoryMove[];
}

export type PuzzlePlayerGame = {
  sideToMove: Side;
  board: Board;
  checkState: CheckState;
  puzzleId: string;
  history: HistoryMove[];
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

export function moveMasterGame(from: Square, to: Square, promote: PieceType | null, game: PuzzleMasterGame): {
  game: PuzzleMasterGame;
  puzzleMove?: HistoryMove;
  success: boolean;
} {
  const currentMoveCount = game.history.length
  const nextValidMove = game.puzzle.correctMoves[currentMoveCount]
  const previousMove = game.history[currentMoveCount - 1]
  if (!nextValidMove) {
    throw new Error('No more moves left in the puzzle!')
  }
  if (squareEquals(from, nextValidMove.from) && squareEquals(to, nextValidMove.to)) {
    const userMoveResult = chessMove({ from, to }, previousMove || null, promote, game.sideToMove, game.board)
    let finalMoveResult = userMoveResult
    const newCheckState = getCheckState(previousMove || null, getEnemySide(game.sideToMove), userMoveResult.board)
    const newHistory = [...game.history]
    const newHistoryMove = {
      from,
      to,
      ...(userMoveResult.take ? { take: userMoveResult.take } : {}),
      ...(userMoveResult.promotion ? { promote: userMoveResult.promotion } : {}),
      resultCheckState: newCheckState
    }
    newHistory.push(newHistoryMove)
    const puzzleMove = game.puzzle.correctMoves[currentMoveCount + 1]
    if (puzzleMove) {
      const puzzleMoveResult = chessMove(
        { from: puzzleMove.from, to: puzzleMove.to },
        { from, to },
        puzzleMove.promotion || null,
        getEnemySide(game.sideToMove),
        userMoveResult.board
      )
      newHistory.push(puzzleMove)
      finalMoveResult = puzzleMoveResult
    }

    const newGameState = {
      ...game,
      sideToMove: puzzleMove ? game.sideToMove : getEnemySide(game.sideToMove),
      board: finalMoveResult.board,
      checkState: newHistory?.[newHistory.length - 1]?.resultCheckState || 'SAFE',
      history: newHistory
    }

    return {
      game: newGameState,
      success: true,
      ...(puzzleMove ? { puzzleMove } : {})
    }
  }

  return { game, success: false }
}

export function movePlayerGame(from: Square, to: Square, promote: PieceType | null, game: PuzzlePlayerGame): PuzzlePlayerGame {
  const previousMove = game.history[game.history.length - 1]
  const result = chessMove({ from, to }, previousMove || null, promote, game.sideToMove, game.board)
  const { take, promotion } = result
  const newSideToMove = getEnemySide(game.sideToMove)
  const newCheckState = getCheckState(previousMove || null, newSideToMove, result.board)
  const newHistory = [
    ...game.history,
    {
      from,
      to,
      ...(take ? { take } : {}),
      ...(promotion ? { promotion } : {}),
      resultCheckState: newCheckState
    }
  ]
  const newGameState = {
    puzzleId: game.puzzleId,
    board: result.board,
    sideToMove: getEnemySide(game.sideToMove),
    checkState: newCheckState,
    history: newHistory
  }
  return newGameState
}
