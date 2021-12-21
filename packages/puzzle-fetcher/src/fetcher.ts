import yargs from 'yargs/yargs'
import chalk from 'chalk'
import axios from 'axios';
import mkdirp from 'mkdirp';
import path from 'path';
import { writeFile } from 'fs/promises';

type Blunder = {
  id: string;
  elo: number;
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

async function writePuzzles(blunders: Blunder[], targetDir = './'): Promise<void> {
  await mkdirp(targetDir)
  blunders.forEach(async blunder => {
    await writeFile(
      path.join(targetDir, blunder.id + '.json'),
      JSON.stringify(blunder, null, 2)
    )
  })
}

async function parseBlunder(blunder: Blunder): Promise<any> {
  // CORE
  //  compress board, expand board
  //  notate(board, move) -> board, move, notation
  //  read(board, notation) -> move
  // PUZZLE FILE
  //  => readable board
  //  => Field:
  // JSON
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
      console.log(`Fetched blunder ${i}/${numPuzzles}`)
      await sleep(pause)
    } catch (e) {
      console.log(chalk.red(`Failed to fetch blunder ${i}/${numPuzzles}`))
    }
  }
  console.log(chalk.green(`Completed fetching all puzzles!`))
  writePuzzles(blunders, './puzzles')
}

(async () => {
  const { n: numPuzzles, p: pause } = yargs(process.argv.slice(2)).options({
    n: { type: 'number', alias: 'numPuzzles', default: 50 },
    p: { type: 'number', alias: 'pause', default: 2000 },
  }).parseSync()

  await run({ numPuzzles, pause })
})();
