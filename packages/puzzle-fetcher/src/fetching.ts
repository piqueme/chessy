import axios from 'axios'
import pmap from 'p-map'
import mkdirp from 'mkdirp'
import path from 'path'
import yaml from 'js-yaml'
import { writeFile } from 'fs/promises'
import {
  readCompressedBoard,
  parseMoveNotation,
  getEnemySide,
  executeMove,
  serializeBoard,
} from '@chessy/core'
import type { Board, Puzzle, Side, History } from '@chessy/core'

export type Blunder = {
  id: string;
  elo: number;
  blunderMove: string;
  fenBefore: string;
  forcedLine: string[];
  move_index: number;
  pgn_id?: string;
  pv?: string[];
}

type BlunderResponse = {
  data: Blunder;
  status: "ok";
}

export async function fetchBlunder(): Promise<Blunder> {
  const response = await axios.post<BlunderResponse>('https://chessblunders.org/api/blunder/get', {
    type: 'rated',
  });
  return response.data.data
}

function sleep(timeInMillis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeInMillis))
}

export async function writePuzzles(puzzles: Puzzle[], targetDir = './'): Promise<void> {
  await mkdirp(targetDir)
  let p = Promise.resolve()
  puzzles.forEach(puzzle => {
    const serializedYaml = yaml.dump({
      ...puzzle,
      startBoard: serializeBoard(puzzle.startBoard)
    })
    p = p.then(() => {
        writeFile(
        path.join(targetDir, puzzle.id + '.yml'),
        serializedYaml,
        'utf-8',
      )
    })
  })
  return p
}

export function parseBlunder(blunder: Blunder): Puzzle {
  const [compressedBoard, compressedSide] = blunder.fenBefore.split(' ')
  if (!compressedBoard || !compressedSide) { throw new Error(`Improper starting fen for blunder ${blunder.id}`) }
  const preBlunderBoard = readCompressedBoard(compressedBoard)
  const preBlunderSide = (compressedSide === 'w') ? 'white' : 'black'
  const blunderMove = parseMoveNotation(blunder.blunderMove, preBlunderSide, preBlunderBoard)

  // NOTE: assuming no en passant!
  const { newBoard: startBoard } = executeMove(blunderMove, undefined, blunderMove.promotion, preBlunderSide, preBlunderBoard)
  const sideToMove = getEnemySide(preBlunderSide)

  const [_, finalHistory] = blunder.forcedLine.reduce<[Board, History, Side]>(
    ([board, history, side], notatedMove) => {
      const fullMove = parseMoveNotation(notatedMove, side, board)
      const previousMove = history[history.length - 1]?.move
      const { newBoard: updatedBoard } = executeMove(fullMove, previousMove, fullMove.promotion, side, board)
      const updatedHistory = [...history, { move: fullMove, notation: notatedMove }]
      const updatedSide = getEnemySide(side)
      return [updatedBoard, updatedHistory, updatedSide]
    },
    [startBoard, [] as History, sideToMove]
  )
  return {
    id: blunder.id,
    startBoard,
    sideToMove,
    correctMoves: finalHistory,
  }
}

async function fetchAndParseBlunder(): Promise<Puzzle> {
  const blunder = await fetchBlunder()
  try {
    const puzzle = parseBlunder(blunder)
    return puzzle
  } catch (e) {
    throw new Error(`Failed to parse blunder!\n${JSON.stringify(blunder, null, 2)}`)
  }
}

type FetchOptions = {
  numPuzzles: number;
  pause: number;
  concurrency: number;
};

/**
 * Fetches puzzles from designated source and parses them into Chessy
 * Puzzle data type. Allows configuration of concurrency and timeouts.
 * Currently only fetches from Chess Blunders database.
 */
export async function fetch({
  numPuzzles,
  pause = 2000,
  concurrency = 1
}: FetchOptions): Promise<(Puzzle | undefined)[]> {
  const mapper = async () => {
    try {
      const puzzle = await fetchAndParseBlunder()
      await sleep(pause)
      return puzzle
    } catch (e) {
      console.error(e)
      return undefined
    }
  }
  const requestIndex = (new Array(numPuzzles)).fill(undefined)
  const puzzles = await pmap(requestIndex, mapper, { concurrency, stopOnError: false })
  return puzzles.filter(p => !!p)
}
