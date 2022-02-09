import { createMasterGame, moveMasterGame } from '@chessy/core'
import type {
  HistoryMove,
  PuzzleMasterGame,
  Square,
  Puzzle
} from '@chessy/core'
import { v4 as uuidv4 } from 'uuid'
import { Schema } from 'mongoose'
import logger from './logger'
import type { Connection, Model } from 'mongoose'

type Stored<T> = T & { _id: string; }
type StoredPuzzle = Stored<Puzzle>
type StoredPuzzleGame = Stored<PuzzleMasterGame> & { puzzle: StoredPuzzle }
type PuzzleDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type GameProgressState = 'PLAYING' | 'COMPLETED'
export type ObjectPuzzle = Omit<StoredPuzzle, '_id'> & { id: string; difficulty: PuzzleDifficulty }
export type ObjectPuzzleGame = Omit<StoredPuzzleGame, '_id' | 'puzzle'> & { id: string; progressState: GameProgressState } & { puzzle: ObjectPuzzle }

// DB SETUP
// TODO: Remove Mongoose schema duplication with Typescript types, hard to synchronize.
// TODO: Tighten up types with validations.
type Models = {
  Puzzle: Model<StoredPuzzle>,
  Game: Model<StoredPuzzleGame>
}
const HistoryMoveSchema = new Schema<HistoryMove>({
  move: {
    from: [Number],
    to: [Number],
    take: {
      piece: { type: { type: String }, side: String },
      square: { type: [Number], default: undefined }
    },
    promotion: String,
  },
  notation: String
})
const PuzzleSchema = new Schema<StoredPuzzle>({
  _id: String,
  sideToMove: String,
  startBoard: [[{ type: { type: String }, side: String } ]],
  correctMoves: [HistoryMoveSchema]
})
const GameSchema = new Schema<StoredPuzzleGame>({
  _id: String,
  board: [[{ type: { type: String }, side: String } ]],
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

function computeGameProgressState(storedGame: StoredPuzzleGame): GameProgressState {
  if (storedGame.puzzle.correctMoves.length === storedGame.history.length) {
    return 'COMPLETED'
  }
  return 'PLAYING'
}

function computePuzzleDifficulty(storedPuzzle: StoredPuzzle): PuzzleDifficulty {
  const numMoves = storedPuzzle.correctMoves.length
  if (numMoves <= 1) {
    return 'BEGINNER'
  }
  if (numMoves <= 3) {
    return 'INTERMEDIATE'
  }
  return 'HARD'
}

function convertStoredToObjectPuzzle(storedPuzzle: StoredPuzzle): ObjectPuzzle {
  const { _id, ...otherPuzzleFields } = storedPuzzle
  return {
    id: _id,
    difficulty: computePuzzleDifficulty(storedPuzzle),
    ...otherPuzzleFields
  }
}

function convertStoredToObjectGame(storedGame: StoredPuzzleGame): ObjectPuzzleGame {
  const { _id, ...gameObject } = storedGame
  const puzzle = convertStoredToObjectPuzzle(gameObject.puzzle)
  return {
    id: _id,
    ...gameObject,
    progressState: computeGameProgressState(storedGame),
    puzzle
  }
}

function convertObjectToStoredPuzzle(objectPuzzle: ObjectPuzzle): StoredPuzzle {
  const { id, difficulty, ...otherPuzzleFields } = objectPuzzle
  return {
    _id: id,
    ...otherPuzzleFields
  }
}

export default class GameManager {
  models: Models;

  constructor(db: Connection) {
    this.models = createModels(db)
  }

  async getPuzzle(id: string): Promise<ObjectPuzzle> {
    const puzzleDocument = await this.models.Puzzle.findById(id).exec()
    if (!puzzleDocument) {
      throw new Error(`No puzzle found in DB with ID: ${id}`)
    }
    const puzzleObject = puzzleDocument.toObject()
    return convertStoredToObjectPuzzle(puzzleObject)
  }

  async getAllPuzzles(): Promise<ObjectPuzzle[]> {
    const puzzleDocuments = await this.models.Puzzle.find().exec()
    const puzzleObjects = puzzleDocuments.map(p => p.toObject())
    return puzzleObjects.map(convertStoredToObjectPuzzle)
  }

  async createPuzzle(puzzle: Puzzle, { id }: { id?: string }): Promise<ObjectPuzzle> {
    const resolvedID = id || uuidv4()
    const storedPuzzle = { _id: resolvedID, ...puzzle }
    const puzzleDocument = new this.models.Puzzle(storedPuzzle)
    try {
      logger.info(`Storing puzzle\n${JSON.stringify(puzzleDocument)}`)
      await puzzleDocument.save()
      logger.info(`Successfully stored puzzle ${resolvedID}`)
      return convertStoredToObjectPuzzle(storedPuzzle)
    } catch (e) {
      throw new Error('Failed to save to DB during puzzle creation')
    }
  }

  async createGameFromPuzzle(puzzleId = 'test-puzzle'): Promise<ObjectPuzzleGame> {
    const puzzle = await this.getPuzzle(puzzleId)
    const existingGames = await this.models.Game.find({ 'puzzle._id': puzzleId }).exec()
    if (existingGames.length > 0) {
      throw new Error(`Game already exists in DB for puzzle with ID: ${puzzleId}`)
    }
    const gameID = uuidv4()
    const game = createMasterGame(puzzle)
    const storedPuzzle = convertObjectToStoredPuzzle(puzzle)
    const storedGame = { _id: gameID, ...game, puzzle: storedPuzzle }
    const gameDocument = new this.models.Game(storedGame)
    try {
      logger.info(`Saving new game: ${JSON.stringify(storedGame, null, 2)}`)
      await gameDocument.save()
      logger.info(`Successfully saved new game with ID: ${gameID}`)
      return convertStoredToObjectGame(storedGame)
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
    const moveResultPuzzle = moveResult.game.puzzle
    const storedPuzzle = { _id: game.puzzle.id, ...moveResultPuzzle }
    const storedGame = { ...moveResult.game, puzzle: storedPuzzle }
    try {
      logger.info(`Saving updated game.\n${JSON.stringify(storedGame)}`)
      await this.models.Game.findOneAndReplace({ _id: gameId }, storedGame)
      logger.info(`Successfully updated game ${gameId}.`)
      const objectGame = convertStoredToObjectGame({ _id: game.id, ...storedGame })
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
