import { fetch } from '@chessy/puzzle-fetcher'
import { gql } from 'mercurius-codegen'
import urljoin from 'url-join'
import axios from 'axios'
import pmap from 'p-map'
import type { Puzzle } from '@chessy/core'

type Options = {
  numPuzzles: number;
  apiHost?: string;
};

export async function loadPuzzlesIntoDB({
  numPuzzles,
  apiHost = 'http://127.0.0.1:8080'
}: Options): Promise<void> {
  const puzzles = await fetch({ numPuzzles, pause: 3000, concurrency: 1 })
  const endpoint = urljoin(apiHost, 'graphql')
  const operationName = 'CreatePuzzle'
  const query = gql`
    mutation CreatePuzzle($puzzle: CreatePuzzleInput!) {
      createPuzzle(puzzle: $puzzle) {
        _id
      }
    }
  `

  const mapper = async (puzzle: Puzzle): Promise<void> => {
    try {
      await axios.post(endpoint, {
        operationName,
        query,
        variables: { puzzle }
      })
    } catch (e) {
      console.error(e)
      return undefined
    }
  }

  await pmap(puzzles, mapper, { concurrency: 1, stopOnError: false })
}

(async() => {
  const numPuzzles = process.argv[2]
  if (!numPuzzles) {
    throw new Error('Missing number of puzzles argument!')
  }
  await loadPuzzlesIntoDB({ numPuzzles: parseInt(numPuzzles) })
})()
