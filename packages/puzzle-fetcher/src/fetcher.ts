import yargs from 'yargs/yargs'
import chalk from 'chalk'
import axios from 'axios'
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

type Blunder = {
  id: string;
  elo: number;
  blunderMove: string;
  fenBefore: string;
  forcedLine: string[];
  move_index: number;
  pgn_id: string;
  pv: string[];
}

type BlunderResponse = {
  data: Blunder;
  status: "ok";
}

async function fetchBlunder(): Promise<Blunder> {
  const response = await axios.post<BlunderResponse>('https://chessblunders.org/api/blunder/get', {
    type: 'rated',
  });
  return response.data.data
}

function sleep(timeInMillis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeInMillis))
}

async function writeBlunders(blunders: Blunder[], targetDir = './'): Promise<void> {
  await mkdirp(targetDir)
  let p = Promise.resolve()
  blunders.forEach(blunder => {
    p = p.then(() => {
      writeFile(
        path.join(targetDir, blunder.id + '.json'),
        JSON.stringify(blunder, null, 2)
      )
    })
  })
  return p
}

async function writePuzzles(puzzles: Puzzle[], targetDir = './'): Promise<void> {
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

function parseBlunder(blunder: Blunder): Puzzle {
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

async function run({ numPuzzles, pause }: {
  numPuzzles: number;
  pause: number;
}): Promise<void> {
  const blunders: Blunder[] = []
  console.log(chalk.green(`Starting to fetch all puzzles...`))
  for (let i = 0; i < numPuzzles; i++) {
    try {
      const newBlunder = await fetchBlunder()
      blunders.push(newBlunder)
      console.log(`Fetched blunder ${i + 1}/${numPuzzles}`)
      await sleep(pause)
    } catch (e) {
      console.log(chalk.red(`Failed to fetch blunder ${i + 1}/${numPuzzles}`))
    }
  }
  console.log(chalk.green(`Completed fetching all puzzles!`))
  await writeBlunders(blunders, './blunders')
  console.log(chalk.green(`Completed writing all puzzles!`))

  const puzzles = blunders.map((blunder, i) => {
    try {
      const puzzle = parseBlunder(blunder)
      console.log(`Parsed blunder ${i + 1}/${numPuzzles}`)
      return puzzle
    } catch (e) {
      console.error(chalk.red(e))
      return null
    }
  })

  const writablePuzzles = puzzles.filter((p): p is Puzzle => p !== null)
  const successCount = writablePuzzles.length
  const errorCount = numPuzzles - successCount
  await writePuzzles(writablePuzzles, './puzzles')
  console.log(`Statistics: ${successCount} success, ${errorCount} error`)
  console.log(chalk.green(`Completed writing all puzzles!`))
}

(async () => {
  const { n: numPuzzles, p: pause } = yargs(process.argv.slice(2)).options({
    n: { type: 'number', alias: 'numPuzzles', default: 50 },
    p: { type: 'number', alias: 'pause', default: 2000 },
  }).parseSync()

  await run({ numPuzzles, pause })
})();
