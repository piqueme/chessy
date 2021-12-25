import {
  createPlayerGame,
  createMasterGame,
  movePlayerGame,
  moveMasterGame,
} from '../game'
import { readBoard } from '../board'

// TODO: These tests are somewhat hacky, they could definitely be beefed up.

describe('player game', () => {
  describe('at start', () => {
    test('is on white side', () => {
      const game = createPlayerGame()
      expect(game.sideToMove).toEqual('white')
    })

    test('has empty history', () => {
      const game = createPlayerGame()
      expect(game.history).toHaveLength(0)
    })
  })

  describe('after move', () => {
    test('game board has updated positions', () => {
      const game = createPlayerGame()
      const updatedGame = movePlayerGame([4, 6], [2, 5], undefined, game)
      const expectedBoard = readBoard([
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |wN|bP|  |',
        '-------------------------',
        '|  |  |  |  |  |  |  |bK|',
        '-------------------------',
        '|  |  |  |bR|  |  |  |wP|',
        '-------------------------',
        '|wB|  |  |  |  |  |wP|wK|',
        '-------------------------',
        '|  |  |bB|bR|wR|  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
      ].join('\n'))
      expect(updatedGame.board).toEqual(expectedBoard)
    })

    test('history contains new move', () => {
      const game = createPlayerGame()
      const updatedGame = movePlayerGame([4, 6], [2, 5], undefined, game)
      expect(updatedGame.history).toEqual([{
        move: { from: [4, 6], to: [2, 5] },
        notation: 'Nf6+',
      }])
    })
  })
})

describe('master game', () => {
  describe('at start', () => {
    test('is on white side', () => {
      const game = createMasterGame()
      expect(game.sideToMove).toEqual('white')
    })

    test('has empty history', () => {
      const game = createMasterGame()
      expect(game.history).toHaveLength(0)
    })
  })

  describe('after incorrect move', () => {
    test('no change in game state', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([5, 0], [0, 5], undefined, game)
      expect(game).toEqual(moveResult.game)
    })

    test('move is marked as failure', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([5, 0], [0, 5], undefined, game)
      expect(moveResult.success).toEqual(false)
    })
  })

  describe('after correct move', () => {
    test('game board has updated positions', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], undefined, game)
      const expectedBoard = readBoard([
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |wN|bP|bK|',
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
        '|  |  |  |bR|  |  |  |wP|',
        '-------------------------',
        '|wB|  |  |  |  |  |wP|wK|',
        '-------------------------',
        '|  |  |bB|bR|wR|  |  |  |',
        '-------------------------',
        '|  |  |  |  |  |  |  |  |',
        '-------------------------',
      ].join('\n'))
      expect(moveResult.game.board).toEqual(expectedBoard)
    })

    test('move is marked as successful', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], undefined, game)
      expect(moveResult.success).toEqual(true)
    })

    test('result includes puzzle move', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], undefined, game)
      expect(moveResult.puzzleMove).toEqual({
        move: { from: [3, 7], to: [2, 7] },
        notation: 'Kh6',
      })
    })

    test('history contains new move', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], undefined, game)
      expect(moveResult.game.history).toEqual([{
        move: { from: [4, 6], to: [2, 5] },
        notation: 'Nf6+',
      }, {
        move: { from: [3, 7], to: [2, 7] },
        notation: 'Kh6',
      }])
    })
  })
})
