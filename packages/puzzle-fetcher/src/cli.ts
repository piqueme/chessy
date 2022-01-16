import yargs from 'yargs/yargs'
import chalk from 'chalk'
import { fetch, writePuzzles } from './fetching'
import type { Puzzle } from '@chessy/core'

type Options = {
  numPuzzles: number;
  pause: number;
  concurrency: number;
};

async function run({
  numPuzzles,
  pause = 1000,
  concurrency = 1,
}: Options): Promise<void> {
  console.log(chalk.green(`Starting to fetch all puzzles...`))
  const puzzles = await fetch({ numPuzzles, pause, concurrency })
  console.log(chalk.green(`Completed fetching all puzzles!`))

  const writablePuzzles = puzzles.filter((p): p is Puzzle => p !== null)
  const successCount = writablePuzzles.length
  const errorCount = numPuzzles - successCount
  await writePuzzles(writablePuzzles, './puzzles')
  console.log(`Statistics: ${successCount} success, ${errorCount} error`)
  console.log(chalk.green(`Completed writing all puzzles!`))
}

(async () => {
  const {
    n: numPuzzles,
    p: pause,
    c: concurrency
  } = yargs(process.argv.slice(2)).options({
    n: { type: 'number', alias: 'numPuzzles', require: true },
    p: { type: 'number', alias: 'pause', default: 2000 },
    c: { type: 'number', alias: 'concurrency', default: 1 },
  }).parseSync()

  await run({ numPuzzles, pause, concurrency })
})();
