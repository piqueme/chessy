import { createMasterGame, moveMasterGame } from '@chessy/core'
import type {
  HistoryMove,
  PuzzleMasterGame,
  Square,
  Puzzle
} from '@chessy/core'
import { v4 as uuidv4 } from 'uuid'
import { Schema } from 'mongoose'
import type { Connection, Model } from 'mongoose'

type Stored<T> = T & { _id: string; }
type StoredPuzzle = Stored<Puzzle>
type StoredPuzzleGame = Stored<PuzzleMasterGame>

// DB SETUP
type Models = {
  Puzzle: Model<Puzzle>,
  Game: Model<PuzzleMasterGame>
}
const PuzzleSchema = new Schema<Puzzle>()
const GameSchema = new Schema<PuzzleMasterGame>()

function createModels(db: Connection): Models {
  return {
    Puzzle: db.model('Puzzle', PuzzleSchema),
    Game: db.model('Game', GameSchema)
  }
}
// END DB SETUP

// type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
// type ProgressState = 'WAITING' | 'READY' | 'NOT_STARTED' | 'COMPLETED'
// type PuzzleMetadata = {
//   id: string;
//   title: string;
//   moveCount: number;
//   difficulty: Difficulty;
//   progress: ProgressState;
// };

// function randomOrDefault<T>(arr: [T, ...T[]]): T {
//   const randomIndex = Math.floor(Math.random() * arr.length)
//   return arr[randomIndex] || arr[0]
// }

// function convertPuzzleToMetadata(puzzle: Puzzle): PuzzleMetadata {
//   return {
//     id: puzzle.id,
//     title: `Test Puzzle ${puzzle.id[puzzle.id.length - 1]}`,
//     moveCount: puzzle.correctMoves.length,
//     difficulty: randomOrDefault(['EASY', 'MEDIUM', 'HARD']),
//     progress: randomOrDefault(['WAITING', 'READY', 'NOT_STARTED', 'COMPLETED'])
//   }
// }

export default class GameManager {
  models: Models;

  constructor(db: Connection) {
    this.models = createModels(db)
  }

  // getPuzzleMetadata(puzzleId: string): PuzzleMetadata {
  //   const puzzle = testPuzzles.find(p => p.id === puzzleId)
  //   if (!puzzle) { throw new Error('Puzzle not found!') }
  //   return convertPuzzleToMetadata(puzzle)
  // }

  // getAllPuzzleMetadatas(): PuzzleMetadata[] {
  //   return testPuzzles.map(convertPuzzleToMetadata)
  // }

  async createPuzzle(puzzle: Puzzle, { id }: { id?: string }): Promise<void> {
    const resolvedID = id || uuidv4()
    const puzzleDocument = new this.models.Puzzle({
      _id: resolvedID,
      ...puzzle
    })
    await puzzleDocument.save()
  }

  async createGameFromPuzzle(puzzleId = 'test-puzzle'): Promise<void> {
    const puzzle = await this.models.Puzzle.findById(puzzleId).exec()
    if (!puzzle) {
      throw new Error(`No puzzle found in DB with ID: ${puzzleId}`)
    }
    const gameID = uuidv4()
    const gameDocument = new this.models.Game({
      _id: gameID,
      ...createMasterGame(puzzle)
    })
    await gameDocument.save()
  }

  async getPuzzle(puzzleId: string): Promise<StoredPuzzle> {
    const puzzle = await this.models.Puzzle.findById(puzzleId).exec()
    if (!puzzle) {
      throw new Error(`No puzzle found in DB with ID: ${puzzleId}`)
    }
    return puzzle
  }

  async getGame(gameId: string): Promise<StoredPuzzleGame> {
    const game = await this.models.Game.findById(gameId).exec()
    if (!game) {
      throw new Error(`No game found in DB with ID: ${gameId}`)
    }
    return game
  }

  async getGameByPuzzle(puzzleId: string): Promise<StoredPuzzleGame> {
    const game = await this.models.Game.findOne({ 'puzzle._id': puzzleId })
    if (!game) {
      throw new Error(`No game found in DB for puzzle with ID: ${puzzleId}`)
    }
    return game
  }

  async removeGame(gameId: string): Promise<StoredPuzzleGame> {
    const game = await this.models.Game.findByIdAndDelete(gameId).exec()
    if (!game) {
      throw new Error(`No game found in DB for ID: ${gameId}`)
    }
    return game
  }

  // NOTE: Dangerous, for internal use only!
  async removeAllGames(): Promise<void> {
    await this.models.Game.deleteMany()
  }

  async move(gameId: string, from: Square, to: Square): Promise<{
    game: StoredPuzzleGame;
    puzzleMove?: HistoryMove;
    success: boolean;
  }> {
    const game = await this.getGame(gameId)
    const moveResult = moveMasterGame(from, to, undefined, game)
    return {
      ...moveResult,
      game: { ...moveResult.game, _id: game._id },
    }
  }
}

export function createGameManager(db: Connection): GameManager {
  return new GameManager(db)
}
