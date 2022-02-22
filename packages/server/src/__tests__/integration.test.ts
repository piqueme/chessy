import gqlRequest from 'graphql-request'
import { gql } from 'mercurius-codegen'
import createServer from '../createServer'
import testConfig from '../config.test'
import { Config } from '../config'
import { mockPuzzle } from './mockPuzzles'
import type { FastifyInstance } from 'fastify'

/**
 * This is a "smoke test" intended to catch issues integrating IO layers
 * and heavy external dependencies:
 *  e.g. Fastify (server), Mercurius (GraphQL plugin), MongoDB
 *
 * It is sequential, and attempts to go through major API operations in logical
 * order. Pay attention to order if you edit!
 *
 * As the number of API operations scale, it may be worth refactoring into
 * indivdiual tests for each operation.
 */

let server: FastifyInstance
let testingConfig: Config

const pause = (millis: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, millis)
  })
}

describe('API integration tests', () => {
  let gameId: string;

  beforeAll(async () => {
    testingConfig = await testConfig()
    console.log("TESTING CONFIG", JSON.stringify(testingConfig, null, 2))
    server = await createServer({ overrideConfig: testingConfig })
  })

  afterAll(async () => {
    try {
      await server.close()
    } catch (e) {
      console.error(e)
    }
  })

  test('create puzzle mutation gives successful response', async () => {
    const config = await testConfig()
    const query = gql`
      mutation CreatePuzzle($puzzle: CreatePuzzleInput!) {
        createPuzzle(puzzle: $puzzle) {
          _id
        }
      }
    `
    const variables = { puzzle: mockPuzzle }
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    expect(response.createPuzzle._id).toEqual(mockPuzzle._id)
    pause(200)
  })

  test('querying for created puzzle responds with stored puzzle', async () => {
    const config = await testConfig()
    const query = gql`
      query PuzzlesQuery {
        puzzles {
          _id
        }
      }
    `
    const response = await gqlRequest(`${config.serverURI}/graphql`, query)
    expect(response.puzzles).toHaveLength(1)
    expect(response.puzzles[0]._id).toEqual(mockPuzzle._id)
    pause(200)
  })

  test('creating game for puzzle responds successfully', async () => {
    const config = await testConfig()
    const query = gql`
      mutation GameCreateMutation($puzzleId: ID!) {
        createGameFromPuzzle(puzzleId: $puzzleId) {
          _id
          puzzle {
            _id
          }
        }
      }
    `
    const variables = { puzzleId: mockPuzzle._id }
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    gameId = response.createGameFromPuzzle._id
    expect(response.createGameFromPuzzle.puzzle._id).toEqual(mockPuzzle._id)
    expect(response.createGameFromPuzzle._id).toBeDefined()
    pause(200)
  })

  test('querying for created game returns same game', async () => {
    const config = await testConfig()
    const query = gql`
      query GameQuery($id: ID) {
        game(_id: $id) {
          _id
          puzzle {
            _id
          }
        }
      }
    `
    const variables = { id: gameId }
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    expect(response.game._id).toEqual(gameId)
    expect(response.game.puzzle._id).toEqual(mockPuzzle._id)
    pause(200)
  })

  test('submitting an incorrect move gives a response with an unsuccessful flag', async () => {
    const config = await testConfig()
    const query = gql`
      mutation MoveSubmission($gameId: ID!, $move: MoveInput!) {
        move(gameId: $gameId, move: $move) {
          puzzleMove {
            notation
            move {
              from
              to
            }
          }
          success
        }
      }
    `
    const variables = { gameId, move: { from: [0, 4], to: [0, 3] }}
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    expect(response.move.puzzleMove).toEqual(null)
    expect(response.move.success).toEqual(false)
    pause(200)
  })

  test('submitting a correct move gives a response with an successful flag and puzzle move', async () => {
    const config = await testConfig()
    const query = gql`
      mutation MoveSubmission($gameId: ID!, $move: MoveInput!) {
        move(gameId: $gameId, move: $move) {
          puzzleMove {
            notation
            move {
              from
              to
            }
          }
          success
        }
      }
    `
    const variables = { gameId, move: { from: [0, 4], to: [0, 2] }}
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    expect(response.move.success).toEqual(true)
    pause(200)
  })

  test('remove game mutation gives successful response', async () => {
    const config = await testConfig()
    const query = gql`
      mutation DeleteGame($gameId: ID!) {
        deleteGame(gameId: $gameId)
      }
    `
    const variables = { gameId }
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    expect(response.deleteGame).toEqual(gameId)
    pause(200)
  })

  test('querying for removed game responds with empty', async () => {
    const config = await testConfig()
    const query = gql`
      query GameQuery($id: ID!) {
        game(_id: $id) {
          _id
        }
      }
    `
    const variables = { id: gameId }
    expect(async () => {
        await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    }).rejects.toThrowError()
  })
})
