import fs from 'fs'
import path from 'path'
import axios from 'axios'
import * as core from '@chessy/core'
import {
  fetchBlunder,
  parseBlunder,
  fetch
} from '../fetching'
import type {
  Blunder,
} from '../fetching'
import type { Board, Piece, HistoryMove } from '@chessy/core'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockBlunder: Blunder = {
  id: 'mock-blunder-id',
  elo: 1449,
  blunderMove: 'c5',
  fenBefore: '8/2p5/1pPp1k1p/p2P1p2/P1Pn1n1P/2n5/6B1/7K w - - 3 49',
  forcedLine: ['bxc5'],
  move_index: 96,
}

describe('fetching blunder', () => {
  test('makes single request through axios', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: mockBlunder
      }
    })
    const resultBlunder = await fetchBlunder()
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(resultBlunder).toEqual(mockBlunder)
  })

  test('rejects with error when API call fails', async () => {
    const errorMessage = 'Network error'
    mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))
    await expect(
      async () => { await fetchBlunder() }
    ).rejects.toThrow(errorMessage)
  })
})

// NOTE: This test is focused on _unit_ testing parsing, so we mock external
// dependencies on core logic.
describe('parsing blunder', () => {
  const readCompressedBoardSpy = jest.spyOn(core, 'readCompressedBoard')
  const parseMoveNotationSpy = jest.spyOn(core, 'parseMoveNotation')
  const executeMoveSpy = jest.spyOn(core, 'executeMove')

  const mockSideToMove = 'black'
  const getEnemySideSpy = jest.spyOn(core, 'getEnemySide')

  const moveOne: HistoryMove['move'] = { from: [2, 3], to: [1, 3] }
  const moveTwo: HistoryMove['move'] = { from: [1, 3], to: [0, 3] }
  const moveTwoNotation = mockBlunder.forcedLine[0]

  const whiteKing: Piece = { type: 'king', side: 'white' }
  const boardBeforeBlunderMove: Board = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, whiteKing, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
  ]
  const boardAfterBlunderMove: Board = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, whiteKing, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
  ]
  const boardAfterAllPuzzleMoves: Board = [
    [null, null, null, whiteKing, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
  ]

  beforeEach(() => {
    readCompressedBoardSpy.mockReturnValue(boardBeforeBlunderMove)

    parseMoveNotationSpy
      .mockReturnValueOnce(moveOne)
      .mockReturnValueOnce(moveTwo)

    executeMoveSpy
      .mockReturnValueOnce({
        fullMove: moveOne,
        newBoard: boardAfterBlunderMove
      })
      .mockReturnValueOnce({
        fullMove: moveTwo,
        newBoard: boardAfterAllPuzzleMoves
      })

    getEnemySideSpy.mockReturnValue(mockSideToMove)
  })

  afterAll(() => {
    readCompressedBoardSpy.mockRestore()
    parseMoveNotationSpy.mockRestore()
    executeMoveSpy.mockRestore()
    getEnemySideSpy.mockRestore()
  })

  test('parses blunder move separately first as first output puzzle move', () => {
    parseBlunder(mockBlunder)
    expect(readCompressedBoardSpy).toHaveBeenCalledTimes(1)
    expect(parseMoveNotationSpy).toHaveBeenCalledTimes(2)
    expect(executeMoveSpy).toHaveBeenCalledTimes(2)
  })

  test('outputs puzzle with start board after blunder move and moves excluding blunder move in history', () => {
    const parsedPuzzle = parseBlunder(mockBlunder)
    expect(parsedPuzzle).toEqual({
      startBoard: boardAfterBlunderMove,
      sideToMove: mockSideToMove,
      correctMoves: [{ move: moveTwo, notation: moveTwoNotation }]
    })
  })
})

describe('[INTEGRATION] blunder fetching and parsing pipeline', () => {
  test('fetches and parses puzzles, throwing out fetch/parse failures', async () => {
    const mockDir = path.join(__dirname, 'mocks')
    const readBlunder = (filename: string): Blunder =>
      JSON.parse(fs.readFileSync(path.join(mockDir, filename), 'utf-8'))

    const blunder1 = readBlunder('blunder-1.json')
    const blunder2 = readBlunder('blunder-2.json')
    const brokenBlunder3 = readBlunder('blunder-3-broken.json')
    const blunder4 = readBlunder('blunder-4.json')

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: blunder1 }
    })
    .mockResolvedValueOnce({
      data: { data: blunder2 }
    })
    .mockRejectedValueOnce(new Error('Blunder fetch error'))
    .mockResolvedValueOnce({
      data: { data: brokenBlunder3 }
    })
    .mockResolvedValueOnce({
      data: { data: blunder4 }
    })

    const puzzles = await fetch({
      numPuzzles: 5,
      pause: 100,
      concurrency: 1
    })

    expect(puzzles).toHaveLength(3)
    expect(puzzles).toMatchSnapshot()
  })
})
