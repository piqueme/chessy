import { createMasterGame, moveMasterGame } from '@chessy/core'
import type {
  HistoryMove,
  PuzzleMasterGame,
  Square,
  Puzzle
} from '@chessy/core'
import { Schema } from 'mongoose'
import logger from './logger'
import type { Connection, Model } from 'mongoose'

// type Stored<T> = T & { _id: string; }
// type StoredPuzzle = Stored<Puzzle>
// type StoredPuzzleGame = Stored<PuzzleMasterGame> & { puzzle: StoredPuzzle }
type PuzzleDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type GameProgressState = 'PLAYING' | 'COMPLETED'
export type ObjectPuzzle = Puzzle & { difficulty: PuzzleDifficulty }
export type ObjectPuzzleGame = PuzzleMasterGame & { progressState: GameProgressState }

// DB SETUP
// TODO: Remove Mongoose schema duplication with Typescript types, hard to synchronize.
// TODO: Tighten up types with validations.
type Models = {
  Puzzle: Model<Puzzle>,
  Game: Model<PuzzleMasterGame>
}
const HistoryMoveSchema = new Schema<HistoryMove>({
  move: {
    from: [Number],
    to: [Number],
    take: {
      piece: { _id: String, type: { type: String }, side: String },
      square: { type: [Number], default: undefined }
    },
    promotion: String,
  },
  notation: String
})
const PuzzleSchema = new Schema<Puzzle>({
  _id: String,
  sideToMove: String,
  startBoard: [[{ _id: String, type: { type: String }, side: String } ]],
  correctMoves: [HistoryMoveSchema]
})
const GameSchema = new Schema<PuzzleMasterGame>({
  _id: String,
  board: [[{ _id: String, type: { type: String }, side: String } ]],
  sideToMove: String,
  checkState: String,
  puzzle: PuzzleSchema,
  history: [HistoryMoveSchema]
})

function createModels(db: Connection): Models {
  return {
    Puzzle: db.model('Puzzle', PuzzleSchema),
    Game: db.model('Game', GameSchema)
  }
}
// END DB SETUP

function computeGameProgressState(storedGame: PuzzleMasterGame): GameProgressState {
  if (storedGame.puzzle.correctMoves.length === storedGame.history.length) {
    return 'COMPLETED'
  }
  return 'PLAYING'
}

function computePuzzleDifficulty(storedPuzzle: Puzzle): PuzzleDifficulty {
  const numMoves = storedPuzzle.correctMoves.length
  if (numMoves <= 1) {
    return 'BEGINNER'
  }
  if (numMoves <= 3) {
    return 'INTERMEDIATE'
  }
  return 'HARD'
}

function convertStoredToObjectPuzzle(storedPuzzle: Puzzle): ObjectPuzzle {
  return {
    ...storedPuzzle,
    difficulty: computePuzzleDifficulty(storedPuzzle),
  }
}

function convertStoredToObjectGame(storedGame: PuzzleMasterGame): ObjectPuzzleGame {
  const puzzle = convertStoredToObjectPuzzle(storedGame.puzzle)
  return {
    ...storedGame,
    progressState: computeGameProgressState(storedGame),
    puzzle
  }
}

export default class GameManager {
  models: Models;

  constructor(db: Connection) {
    this.models = createModels(db)
  }

  async getPuzzle(_id: string): Promise<ObjectPuzzle> {
    const puzzleDocument = await this.models.Puzzle.findById(_id).exec()
    if (!puzzleDocument) {
      throw new Error(`No puzzle found in DB with ID: ${_id}`)
    }
    const puzzleObject = puzzleDocument.toObject()
    return convertStoredToObjectPuzzle(puzzleObject)
  }

  async getAllPuzzles(): Promise<ObjectPuzzle[]> {
    const puzzleDocuments = await this.models.Puzzle.find().exec()
    const puzzleObjects = puzzleDocuments.map(p => p.toObject())
    return puzzleObjects.map(convertStoredToObjectPuzzle)
  }

  async createPuzzle(puzzle: Puzzle): Promise<ObjectPuzzle> {
    const puzzleDocument = new this.models.Puzzle(puzzle)
    try {
      logger.info(`Storing puzzle\n${JSON.stringify(puzzleDocument)}`)
      await puzzleDocument.save()
      logger.info(`Successfully stored puzzle ${puzzle._id}`)
      return convertStoredToObjectPuzzle(puzzle)
    } catch (e) {
      console.error(e)
      throw new Error('Failed to save to DB during puzzle creation')
    }
  }

  async createGameFromPuzzle(puzzleId = 'test-puzzle'): Promise<ObjectPuzzleGame> {
    const puzzle = await this.getPuzzle(puzzleId)
    const existingGames = await this.models.Game.find({ 'puzzle._id': puzzleId }).exec()
    if (existingGames.length > 0) {
      throw new Error(`Game already exists in DB for puzzle with ID: ${puzzleId}`)
    }
    const game = createMasterGame(puzzle)
    const gameDocument = new this.models.Game(game)
    try {
      logger.info(`Saving new game: ${JSON.stringify(game, null, 2)}`)
      await gameDocument.save()
      logger.info(`Successfully saved new game with ID: ${game._id}`)
      return convertStoredToObjectGame(game)
    } catch (e) {
      throw new Error('Failed to save game in DB during creation')
    }
  }

  async getGame(gameId: string): Promise<ObjectPuzzleGame> {
    const gameDocument = await this.models.Game.findById(gameId).exec()
    if (!gameDocument) {
      throw new Error(`No game found in DB with ID: ${gameId}`)
    }
    return convertStoredToObjectGame(gameDocument.toObject())
  }

  async getGamesByPuzzles(puzzleIds: string[]): Promise<ObjectPuzzleGame[]> {
    const gameDocuments = await this.models.Game.find({ 'puzzle._id': { $in: puzzleIds } }).exec()
    const gameObjects = gameDocuments.map(g => g.toObject())
    return gameObjects.map(g => {
      return convertStoredToObjectGame(g)
    })
  }

  async removeGame(gameId: string): Promise<ObjectPuzzleGame> {
    const gameDocument = await this.models.Game.findByIdAndDelete(gameId).exec()
    if (!gameDocument) {
      throw new Error(`No game found in DB for ID: ${gameId}`)
    }
    logger.info(`Succesfully removed Game ${gameId} from DB`)
    const gameObject = gameDocument.toObject()
    return convertStoredToObjectGame(gameObject)
  }

  // NOTE: Dangerous, for internal use only!
  async removeAllGames(): Promise<void> {
    await this.models.Game.deleteMany()
  }

  async move(gameId: string, from: Square, to: Square): Promise<{
    game: ObjectPuzzleGame;
    puzzleMove?: HistoryMove;
    success: boolean;
  }> {
    const game = await this.getGame(gameId)
    logger.info(`Moving game.\n${JSON.stringify(game, null, 2)}\nMove:${JSON.stringify(from)}:${JSON.stringify(to)}`)
    const moveResult = moveMasterGame(from, to, undefined, game)
    try {
      logger.info(`Saving updated game.\n${JSON.stringify(moveResult.game)}`)
      await this.models.Game.findOneAndReplace({ _id: gameId }, moveResult.game)
      logger.info(`Successfully updated game ${gameId}.`)
      const objectGame = convertStoredToObjectGame(moveResult.game)
      return {
        ...moveResult,
        game: objectGame
      }
    } catch (e) {
      logger.error(e)
      throw new Error('Failed to save game after move to DB.')
    }
  }
}

export function createGameManager(db: Connection): GameManager {
  return new GameManager(db)
}
