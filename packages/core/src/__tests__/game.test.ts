import {
  createMasterGame,
  moveMasterGame,
} from '../game'
import { readBoard } from '../board'

// TODO: These tests are somewhat hacky, they could definitely be beefed up.

describe('game', () => {
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
      const moveResult = moveMasterGame([5, 0], [0, 5], null, game)
      expect(game).toEqual(moveResult.game)
    })

    test('move is marked as failure', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([5, 0], [0, 5], null, game)
      expect(moveResult.success).toEqual(false)
    })
  })

  describe('after correct move', () => {
    test('game board has updated positions', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], null, game)
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
      expect(moveResult.game.board).toEqual(expectedBoard)
    })

    test('move is marked as successful', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], null, game)
      expect(moveResult.success).toEqual(true)
    })

    test('history contains new move', () => {
      const game = createMasterGame()
      const moveResult = moveMasterGame([4, 6], [2, 5], null, game)
      expect(moveResult.game.history).toEqual([{
        from: [4, 6],
        to: [2, 5],
        resultCheckState: 'CHECK'
      }])
    })
  })
})
