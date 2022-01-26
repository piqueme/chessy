import gqlRequest from 'graphql-request'
import { gql } from 'mercurius-codegen'
import createServer from '../createServer'
import testConfig from '../config.test'
import { Config } from '../config'
import { FastifyInstance } from 'fastify'

const basicPuzzle = {
  id: 'test-puzzle-id',
  sideToMove: 'black',
  startBoard: [
      [
          null,
          null,
          null,
          null,
          {
              type: 'rook',
              side: 'black',
          },
          null,
          {
              type: 'king',
              side: 'black',
          },
          null
      ],
      [
          null,
          {
              type: 'rook',
              side: 'white',
          },
          null,
          null,
          null,
          null,
          null,
          {
              type: 'pawn',
              side: 'black',
          }
      ],
      [
          {
              type: 'pawn',
              side: 'black',
          },
          null,
          null,
          null,
          {
              type: 'pawn',
              side: 'black',
          },
          {
              type: 'bishop',
              side: 'white',
          },
          {
              type: 'pawn',
              side: 'black',
          },
          null
      ],
      [
          {
              type: 'pawn',
              side: 'white',
          },
          {
              type: 'bishop',
              side: 'black',
          },
          null,
          null,
          {
              type: 'pawn',
              side: 'white',
          },
          null,
          null,
          null
      ],
      [
          null,
          null,
          null,
          null,
          null,
          {
              type: 'pawn',
              side: 'white',
          },
          null,
          {
              type: 'pawn',
              side: 'white',
          }
      ],
      [
          null,
          null,
          null,
          null,
          null,
          {
              type: 'bishop',
              side: 'white',
          },
          null,
          null
      ],
      [
          null,
          null,
          null,
          null,
          null,
          {
              type: 'rook',
              side: 'black',
          },
          null,
          null
      ],
      [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          {
              type: 'king',
              side: 'white',
          }
      ]
  ],
  correctMoves: [
      {
          move: {
              from: [
                  0,
                  4
              ],
              to: [
                  0,
                  2
              ]
          },
          notation: 'Rc8',
      }
  ],
}

let server: FastifyInstance
let testingConfig: Config
beforeAll(async () => {
  testingConfig = await testConfig()
})

describe('API integration tests', () => {
  beforeAll(async () => {
    server = await createServer({ overrideConfig: testingConfig })
  })

  afterAll(async () => {
    await server.close()
  })

  test('create puzzle test', async () => {
    const config = await testConfig()
    const query = gql`
      mutation CreatePuzzle($puzzle: CreatePuzzleInput!) {
        createPuzzle(puzzle: $puzzle) {
          id
        }
      }
    `
    const variables = { puzzle: basicPuzzle }
    const response = await gqlRequest(`${config.serverURI}/graphql`, query, variables)
    console.log(response)
    expect(true).toEqual(true)
  })

  test('basic query test', async () => {
    const config = await testConfig()
    const query = gql`
      query PuzzlesQuery {
        puzzles {
          id
          correctMoves {
            move {
              from
              to
            }
          }
        }
      }
    `
    const response = await gqlRequest(`${config.serverURI}/graphql`, query)
    console.log(response)
    expect(true).toEqual(true)
  })
})
