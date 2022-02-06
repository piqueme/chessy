import getConfig from './config'
import fastify from 'fastify'
import fp from 'fastify-plugin'
import fastifyCors from 'fastify-cors'
import fastifyMongoose from './fastify-mongoose'
import mercurius from 'mercurius'
import type { IResolvers } from 'mercurius'
import { gql } from 'mercurius-codegen'
import type { FastifyPluginAsync, FastifyInstance } from 'fastify'
import GameManager, { createGameManager } from './gameManager'
import context from './async-context'
import logger from './logger'
import { Log as CoreLog } from '@chessy/core'
import type { MongoosePluginOptions } from './fastify-mongoose'
import type { MercuriusPlugin } from 'mercurius'
import type { Config } from './config'

// GRAPHQL
// TODO: Documentation of fields.
// TODO: De-duplicate input and query types with fragments.
// TODO: Figure out how to restrict fields for different users.
// TODO: Pagination
// TODO: Editor GraphQL Linting
// TODO: "Reset Game" Operation
// TODO: "Inspect Move" Operation
// TODO: UUID Request IDs (not seq)
const schema = gql`
  """ Representation of a chess piece. """
  type Piece {
    type: String!
    side: String!
  }
  type Take {
    piece: Piece!
    square: [Int!]!
  }
  type Move {
    from: [Int!]!
    to: [Int!]!
    take: Take
    promotion: String
  }
  type HistoryMove {
    move: Move!
    notation: String!
  }
  type Puzzle {
    id: ID!
    difficulty: String!
    sideToMove: String!
    startBoard: [[Piece]]
    correctMoves: [HistoryMove!]

    game: Game
  }
  type Game {
    id: ID!
    board: [[Piece]]
    sideToMove: String!
    checkState: String!
    progressState: String!
    puzzle: Puzzle!
    history: [HistoryMove!]!
  }
  type Query {
    game(id: ID): Game
    puzzle(id: ID): Puzzle
    puzzles: [Puzzle]
  }
  type MoveResult {
    game: Game
    puzzleMove: HistoryMove
    success: Boolean!
  }

  input PieceInput {
    type: String!
    side: String!
  }
  input TakeInput {
    piece: PieceInput!
    square: [Int!]!
  }
  input MoveInput {
    from: [Int!]!
    to: [Int!]!
    take: TakeInput
    promotion: String
  }
  input HistoryMoveInput {
    move: MoveInput!
    notation: String!
  }
  input CreatePuzzleInput {
    id: ID!
    sideToMove: String!
    startBoard: [[PieceInput]]
    correctMoves: [HistoryMoveInput!]
  }

  type Mutation {
    createPuzzle(puzzle: CreatePuzzleInput!): Puzzle
    createGameFromPuzzle(puzzleId: ID!): Game
    deleteGame(gameId: ID!): ID!
    move(gameId: ID!, move: MoveInput!): MoveResult
  }
`

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T
declare module 'mercurius' {
  // Mercurius unfortunately requires the interface context type to be defined
  // this way.
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface MercuriusContext extends PromiseType<{ gameManager: GameManager }> {}
}

// TODO: Figure out how to get Typescript validation (?)
// TODO: Figure out how to get deeper validation beyond type?
const resolvers: IResolvers = {
  Query: {
    game: async (_: unknown, { id }: { id: string }, context) => {
      console.log("Query Resolver: game", id)
      const game = await context.gameManager.getGame(id)
      return game
    },
    puzzle: async (_: unknown, { id }: { id: string }, context) => {
      console.log("Query Resolver: puzzle", id)
      const puzzle = await context.gameManager.getPuzzle(id)
      const games = await context.gameManager.getGamesByPuzzles([id])
      return {
        ...puzzle,
        game: games[0]
      }
    },
    puzzles: async (_a: unknown, _b: unknown, context) => {
      console.log("Query Resolver: puzzles")
      const puzzles = await context.gameManager.getAllPuzzles()
      const games = await context.gameManager.getGamesByPuzzles(puzzles.map(p => p.id))
      return puzzles.map(p => ({
        ...p,
        game: games.find(g => g.puzzle.id === p.id)
      }))
    }
  },
  Mutation: {
    createPuzzle: async (_: unknown, { puzzle }: any, context) => {
      const { id, ...otherPuzzleFields } = puzzle
      console.log("Mutation Resolver: createPuzzle")
      const storedPuzzle = await context.gameManager.createPuzzle(otherPuzzleFields, { id })
      return storedPuzzle
    },
    createGameFromPuzzle: async (_: unknown, { puzzleId }: { puzzleId: string }, context) => {
      console.log("Mutation Resolver: createGameFromPuzzle")
      const game = await context.gameManager.createGameFromPuzzle(puzzleId)
      return game
    },
    deleteGame: async (_: unknown, { gameId }: { gameId: string }, context) => {
      console.log("Mutation Resolver: deleteGame")
      const game = await context.gameManager.removeGame(gameId)
      return game.id
    },
    move: async (_: unknown, { gameId, move }: { gameId: string, move: any }, context) => {
      console.log("Mutation Resolver: move")
      const moveResult = await context.gameManager.move(gameId, move.from, move.to)
      return moveResult
    }
  }
}

declare module 'fastify' {
  export interface FastifyInstance {
    gameManager: GameManager
    graphql: MercuriusPlugin
  }
}

const managers: FastifyPluginAsync = async (server) => {
  const gameManager = createGameManager(server.db)
  server.decorate('gameManager', gameManager)
}

export default async ({ overrideConfig = {} }: { overrideConfig?: Partial<Config> }): Promise<FastifyInstance> => {
  const baseConfig = await getConfig()
  const finalConfig = { ...baseConfig, ...overrideConfig }
  logger.level = finalConfig.logging['server']
  const server = fastify({ logger })
  const coreLogger = logger.child({}, { level: finalConfig.logging['core'] })
  CoreLog.setLogger(coreLogger)

  await server.register(fastifyCors, {
    origin: finalConfig.clientOrigin,
    methods: ['GET', 'POST', 'DELETE'],
  })
  // unfortunately needs to be manually typed
  const mongooseOptions: MongoosePluginOptions = {
    uri: finalConfig.databaseURI,
    connectOptions: {
      user: finalConfig.databaseUser,
      pass: finalConfig.databasePassword,
      autoIndex: false
    }
  }
  await server.register(fastifyMongoose, mongooseOptions)
  await server.register(fp(managers))
  // TODO: Make GraphiQL an environment variable.
  await server.register(mercurius, {
    schema,
    resolvers,
    context: async () => ({ gameManager: server.gameManager }),
    graphiql: true,
  })

  server.addHook('onClose', async (instance) => {
    await instance.db.close()
  })
  server.addHook('preHandler', (request, _, next) => {
    context.run({ requestId: request.id }, next)
  })
  server.graphql.addHook('preParsing', async (_schema, source, _context) => {
    server.log.info({ query: source }, 'Received a GraphQL query')
  })

  server.listen(8080, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
  await server.ready()

  return server
}
