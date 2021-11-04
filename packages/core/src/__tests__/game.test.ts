import {
  createFromPuzzle,
  tryMove,
} from '../game'
import { readBoard } from '../board'

// TODO: These tests are somewhat hacky, they could definitely be beefed up.

describe('game', () => {
  describe('at start', () => {
    test('is on white side', () => {
      const game = createFromPuzzle('test')
      expect(game.sideToMove).toEqual('white')
    })

    test('has empty history', () => {
      const game = createFromPuzzle('test')
      expect(game.history).toHaveLength(0)
    })
  })

  describe('after incorrect move', () => {
    test('no change in game state', () => {
      const game = createFromPuzzle('test')
      const moveResult = tryMove([5, 0], [0, 5], null, game)
      expect(game).toEqual(moveResult[0])
    })

    test('move is marked as failure', () => {
      const game = createFromPuzzle('test')
      const moveResult = tryMove([5, 0], [0, 5], null, game)
      expect(moveResult[1]).toEqual('FAILURE')
    })
  })

  describe('after correct move', () => {
    test('game board has updated positions', () => {
      const game = createFromPuzzle('test')
      const moveResult = tryMove([4, 6], [2, 5], null, game)
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
      expect(moveResult[0].board).toEqual(expectedBoard)
    })

    test('move is marked as successful', () => {
      const game = createFromPuzzle('test')
      const moveResult = tryMove([4, 6], [2, 5], null, game)
      expect(moveResult[1]).toEqual('SUCCESS')
    })

    test('history contains new move', () => {
      const game = createFromPuzzle('test')
      const moveResult = tryMove([4, 6], [2, 5], null, game)
      expect(moveResult[0].history).toEqual([{
        from: [4, 6],
        to: [2, 5],
        resultCheckState: 'CHECK'
      }])
    })
  })
})
