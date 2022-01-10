import { createMasterGame, moveMasterGame } from '@chessy/core'
import type { PuzzleMasterGame, PuzzlePlayerGame, Square, Puzzle } from '@chessy/core'
import testPuzzles from './testPuzzles'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'

type StoredPuzzleGame = PuzzleMasterGame & { id: string; }

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
type ProgressState = 'WAITING' | 'READY' | 'NOT_STARTED' | 'COMPLETED'
type PuzzleMetadata = {
  id: string;
  title: string;
  moveCount: number;
  difficulty: Difficulty;
  progress: ProgressState;
};

export type ServerPuzzleGame = Omit<PuzzlePlayerGame, 'history'> & {
  id: string;
  history?: PuzzleMasterGame['history'];
}

function randomOrDefault<T>(arr: [T, ...T[]]): T {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex] || arr[0]
}

function convertPuzzleToMetadata(puzzle: Puzzle): PuzzleMetadata {
  return {
    id: puzzle.id,
    title: `Test Puzzle ${puzzle.id[puzzle.id.length - 1]}`,
    moveCount: puzzle.correctMoves.length,
    difficulty: randomOrDefault(['EASY', 'MEDIUM', 'HARD']),
    progress: randomOrDefault(['WAITING', 'READY', 'NOT_STARTED', 'COMPLETED'])
  }
}

export function convertGameForResponse(game: StoredPuzzleGame, includeHistory = false): ServerPuzzleGame {
  const { puzzle, history, ...gameForResponse } = game
  return {
    ...gameForResponse,
    ...(includeHistory ? { history } : {}),
    puzzleId: puzzle.id
  }
}

export default class GameManager {
  db: mongoose.Connection;
  #games: { [gameId: string]: StoredPuzzleGame } = {}

  constructor(db: mongoose.Connection) {
    this.db = db
  }

  getPuzzleMetadata(puzzleId: string): PuzzleMetadata {
    const puzzle = testPuzzles.find(p => p.id === puzzleId)
    if (!puzzle) { throw new Error('Puzzle not found!') }
    return convertPuzzleToMetadata(puzzle)
  }

  getAllPuzzleMetadatas(): PuzzleMetadata[] {
    return testPuzzles.map(convertPuzzleToMetadata)
  }

  getGame(gameId: string): StoredPuzzleGame {
    const game = this.#games[gameId]
    if (!game) { throw new Error('Game not found!') }
    return game
  }

  getGameHistory(gameId: string): PuzzleMasterGame['history'] {
    const game = this.#games[gameId]
    if (!game) { throw new Error('Game not found!') }
    return game.history
  }

  getGameByPuzzle(puzzleId: string): StoredPuzzleGame {
    const games = Object.values(this.#games)
    const matchedGame = games.find(game => game.puzzle.id === puzzleId)
    if (!matchedGame) { throw new Error('Game not found!') }
    return matchedGame
  }

  // TODO: Pagination
  getAllGames(): StoredPuzzleGame[] {
    return Object.values(this.#games)
  }

  /**
   * Has a side effect of storing a game.
   */
  createGame(puzzleId = 'test-puzzle'): StoredPuzzleGame {
    const games = Object.values(this.#games)
    const matchedGame = games.find(game => game.puzzle.id === puzzleId)
    if (matchedGame) {
      throw new Error('Game already exists!')
    }
    const id = uuidv4()
    const puzzle = testPuzzles.find(p => p.id === puzzleId)
    const newGame = { ...createMasterGame(puzzle), id }
    this.#games[id] = newGame
    return newGame
  }

  /**
   * Has a side effect of deleting a game.
   */
  removeGame(gameId: string): void {
    if (!this.#games[gameId]) {
      throw new Error('Game not found!')
    }
    delete this.#games[gameId]
  }

  /**
   * Has side effect of deleting all games.
   */
  removeAllGames(): void {
    this.#games = {}
  }

  move(gameId: string, from: Square, to: Square): {
    game: StoredPuzzleGame;
    puzzleMove?: { from: Square; to: Square };
    success: boolean;
  } {
    const game = this.getGame(gameId)
    const moveResult = moveMasterGame(from, to, null, game)
    const newStoredGame = { ...moveResult.game, id: game.id }
    this.#games[game.id] = newStoredGame
    return {
      ...moveResult,
      game: newStoredGame,
    }
  }
}

export function createGameManager(db: mongoose.Connection): GameManager {
  return new GameManager(db)
}
