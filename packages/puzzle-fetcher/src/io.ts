import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import yaml from 'js-yaml'
import { writeFile } from 'fs/promises'
import mkdirp from 'mkdirp'
import { serializeBoard } from '@chessy/core'
import type { Puzzle } from '@chessy/core'

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
        path.join(targetDir, uuidv4() + '.yml'),
        serializedYaml,
        'utf-8',
      )
    })
  })
  return p
}
