import {
  createGame,
  submitMove,
} from '../game'
import { readBoard } from '../board'
import type { Move } from '../moves'

// TODO: These tests are somewhat hacky, they could definitely be beefed up.

describe('game', () => {
  describe('at start', () => {
    test('is on white side', () => {
      const game = createGame('test')
      expect(game.currentSide).toEqual('white')
    })

    test('has empty history', () => {
      const game = createGame('test')
      expect(game.history).toHaveLength(0)
    })
  })

  describe('after 2 legal pawn and knight moves', () => {
    let game = createGame('test')
    const moves: Move[] = [
      { from: [6, 4], to: [5, 4] },
      { from: [1, 3], to: [2, 3] },
      { from: [7, 6], to: [5, 5] },
      { from: [0, 1], to: [2, 2] }
    ]

    beforeEach(() => {
      game = createGame('test')
      moves.forEach(move => {
        game = submitMove(move.from, move.to, game)
      })
    })

    test('board has pieces in correct new state', () => {
      expect(game.board).toEqual(
        readBoard([
          '-------------------------',
          '|bR|  |bB|bQ|bK|bB|bN|bR|',
          '-------------------------',
          '|bP|bP|bP|  |bP|bP|bP|bP|',
          '-------------------------',
          '|  |  |bN|bP|  |  |  |  |',
          '-------------------------',
          '|  |  |  |  |  |  |  |  |',
          '-------------------------',
          '|  |  |  |  |  |  |  |  |',
          '-------------------------',
          '|  |  |  |  |wP|wN|  |  |',
          '-------------------------',
          '|wP|wP|wP|wP|  |wP|wP|wP|',
          '-------------------------',
          '|wR|wN|wB|wQ|wK|wB|  |wR|',
          '-------------------------',
        ].join('\n'))
      )
    })

    test('history has 4 moves (2 each white and black)', () => {
      expect(game.history).toEqual(moves)
    })

    test('check state is still safe', () => {
      expect(game.checkState).toEqual('SAFE')
    })
  })
})
