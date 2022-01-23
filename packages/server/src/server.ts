import dotenv from 'dotenv'
import fastify from 'fastify'
import fp from 'fastify-plugin'
import fastifyCors from 'fastify-cors'
import fastifyMongoose from './fastify-mongoose'
import mercurius from 'mercurius'
import type { IResolvers } from 'mercurius'
import { gql } from 'mercurius-codegen'
import type { FastifyPluginAsync } from 'fastify'
import GameManager, { createGameManager } from './gameManager'
// import type { Side, Square, Board } from '@chessy/core'
import type { MongoosePluginOptions } from './fastify-mongoose'

dotenv.config()
const server = fastify()

// GRAPHQL
// TODO: Logging on every request.
// TODO: Documentation of fields.
// TODO: De-duplicate input and query types with fragments.
// TODO: Figure out how to restrict fields for different users.
// TODO: Pagination
// TODO: Editor GraphQL Linting
// TODO: "Reset Game" Operation
// TODO: "Inspect Move" Operation
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
    createGameFromPuzzle(puzzleId: String!): Game
    deleteGame(gameId: String!): String!
    move(gameId: String!, move: MoveInput!): MoveResult
  }
`

const buildContext = async () => {
  return { gameManager: server.gameManager }
}
type PromiseType<T> = T extends PromiseLike<infer U> ? U : T
declare module 'mercurius' {
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
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
  }
}

const managers: FastifyPluginAsync = async (server) => {
  const gameManager = createGameManager(server.db)
  server.decorate('gameManager', gameManager)
}

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
})
// unfortunately needs to be manually typed
const mongooseOptions: MongoosePluginOptions = {
  uri: process.env['DB_URI'] as string,
  connectOptions: {
    user: process.env['DB_USERNAME'] as string,
    pass: process.env['DB_PASSWORD'] as string,
    autoIndex: false
  }
}
server.register(fastifyMongoose, mongooseOptions)
server.register(fp(managers))
// TODO: Make GraphiQL an environment variable.
server.register(mercurius, {
  schema,
  resolvers,
  context: buildContext,
  graphiql: true,
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
