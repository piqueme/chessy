import {
  createGame,
  submitMove as submitGameMove,
  gotoMove as gotoGameMove
} from './game'
import type { Game } from './game'
import type { Square } from './board'
import { v4 as uuidv4 } from 'uuid'

export default class GameManager {
  #games: { [gameId: string]: Game } = {}

  getGame(gameId: string): Game {
    const game = this.#games[gameId]
    if (!game) { throw new Error('Game not found!') }
    return game
  }

  // TODO: Pagination
  getAllGames(): Game[] {
    return Object.values(this.#games)
  }

  /**
   * Has a side effect of storing a game.
   */
  createGame(): Game {
    const id = uuidv4()
    const newGame = createGame(id)
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

  submitMove(gameId: string, from: Square, to: Square): Game {
    const game = this.getGame(gameId)
    submitGameMove(from, to, game)
    return game
  }

  gotoMove(gameId: string, moveNumber: number): Game {
    const game = this.getGame(gameId)
    gotoGameMove(moveNumber, game)
    return game
  }
}

export function createGameManager(): GameManager {
  return new GameManager()
}
