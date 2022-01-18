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
// const schema = gql`
//   """ Representation of a chess piece. """
//   type Piece {
//     type: String!
//     side: String!
//   }
//   type Take {
//     piece: Piece!
//     square: [Number!]!
//   }
//   type Move {
//     from: [Number!]!
//     to: [Number!]!
//     take: Take
//     promotion: String
//   }
//   type HistoryMove {
//     move: Move!
//     notation: String!
//   }
//   type Puzzle {
//     id: ID!
//     sideToMove: String!
//     startBoard: [[Piece]]
//     correctMoves: [HistoryMove!]

//     get(id: ID): Puzzle
//   }
//   type Game {
//     sideToMove: String!
//     board: [[Piece]]
//     checkState: String!
//     history: [HistoryMove!]

//     get(id: ID): Game
//   }
//   type Query {
//     puzzle: Puzzle
//     game: Game
//   }
// `
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
  }
  type Query {
    getPuzzle(id: ID): Puzzle
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
  }
`

const buildContext = async () => {
  return { gameManager: server.gameManager }
}
type PromiseType<T> = T extends PromiseLike<infer U> ? U : T
declare module 'mercurius' {
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
}
//
// puzzle
//  byID
//  (later) bySide
//  (later) by number of moves
//  (later) by elo
const resolvers: IResolvers = {
  Query: {
    getPuzzle: async (_: unknown, { id }: { id: string }, context) => {
      console.log("I GOT A QUERY GET PUZZLE!")
      const puzzle = context.gameManager.getPuzzle(id)
      return puzzle
    }
  },
  Mutation: {
    createPuzzle: async (_: unknown, { puzzle }: any, context) => {
      const { id, ...otherPuzzleFields } = puzzle
      await context.gameManager.createPuzzle(otherPuzzleFields, { id })
      return puzzle
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
server.register(mercurius, {
  schema,
  resolvers,
  context: buildContext,
  graphiql: true, // NOTE: This can be toggled by environment (dev)
})

// type GetGameRouteParams = {
//   gameId: string;
// }
// type GameQueryString = {
//   includeHistory?: boolean;
// };
// server.get<{
//   Params: GetGameRouteParams;
//   Querystring: GameQueryString;
// }>('/game/:gameId', async (request) => {
//   console.log(`[GET] ${request.url}`)
//   const game = server.gameManager.getGame(request.params.gameId)
//   return convertGameForResponse(game, request.query.includeHistory)
// })

// type GamePuzzleFinderQueryString = {
//   q: 'byPuzzle';
//   puzzleId: string;
//   includeHistory?: boolean;
// };
// type GameAllFinderQueryString = {
//   q: 'all';
//   includeHistory?: boolean;
// };
// type GameFinderQueryString =
//   GamePuzzleFinderQueryString |
//   GameAllFinderQueryString
// server.get<{
//   Querystring: GameFinderQueryString
// }>('/game', async (request) => {
//   console.log(`[GET] ${request.url}`)
//   console.log(`Query Params: ${JSON.stringify(request.query, null, 2)}`)
//   if (request.query.q === 'all') {
//     return server.gameManager.getAllGames()
//   }
//   if (request.query.q === 'byPuzzle') {
//     const game = server.gameManager.getGameByPuzzle(request.query.puzzleId)
//     return convertGameForResponse(game, request.query.includeHistory)
//   }
//   throw new Error(`Invalid finder!`)
// })

// type GameCreateQueryString = {
//   includeHistory?: boolean;
// };
// type GameCreateBody = {
//   puzzleId: string;
// };
// server.post<{
//   Body: GameCreateBody;
//   Querystring: GameCreateQueryString
// }>('/game', async (request) => {
//   console.log(`[POST] ${request.url}`)
//   const game = server.gameManager.createGame(request.body.puzzleId)
//   return convertGameForResponse(game, request.query.includeHistory)
// })

// type GameDeleteParams = {
//   gameId: string;
// };
// server.delete<{
//   Params: GameDeleteParams
// }>('/game/:gameId', async (request) => {
//   console.log(`[DELETE] ${request.url}`)
//   server.gameManager.removeGame(request.params.gameId)
//   return {}
// })

// server.delete('/game', async (request) => {
//   console.log(`[DELETE] ${request.url}`)
//   server.gameManager.removeAllGames()
//   return {}
// })

// type GetPuzzleRouteParams = {
//   puzzleId: string;
// }
// server.get<{
//   Params: GetPuzzleRouteParams;
// }>('/puzzle/:puzzleId', async (request) => {
//   console.log(`[GET] ${request.url}`)
//   const puzzleMetadata = server.gameManager.getPuzzleMetadata(request.params.puzzleId)
//   return puzzleMetadata
// })

// type PuzzleAllFinderQueryString = {
//   q: 'all';
// };
// server.get<{
//   Querystring: PuzzleAllFinderQueryString
// }>('/puzzle', async (request) => {
//   console.log(`[GET] ${request.url}`)
//   console.log(`Query Params: ${JSON.stringify(request.query, null, 2)}`)
//   if (request.query.q === 'all') {
//     return server.gameManager.getAllPuzzleMetadatas()
//   }
//   throw new Error(`Invalid finder!`)
// })

// type CreatePuzzleBody = {
//   startBoard: Board;
//   sideToMove: Side;
//   correctMoves: {
//     move: {
//       from: Square;
//       to: Square;
//     },
//     notation: string;
//   }[];
// }
// type CreatePuzzleReply = {
//   success: boolean;
// }
// server.post<{
//   Body: CreatePuzzleBody;
//   Reply: CreatePuzzleReply
// }>('/puzzle', async (request) => {
//   console.log(`[POST] ${request.url}`)
//   console.log(`BODY: ${JSON.stringify(request.body, null, 2)}`)
//   console.log("in method game manager", server.gameManager)
//   await server.gameManager.createPuzzle(request.body)
//   return { success: true }
// })

// type MoveParams = {
//   gameId: string;
// }
// type MoveBody = {
//   from: Square;
//   to: Square;
// }
// type MoveReply = {
//   success: boolean;
//   puzzleMove?: { from: Square; to: Square };
// }

// server.post<{
//   Params: MoveParams;
//   Body: MoveBody;
//   Reply: MoveReply;
// }>('/game/:gameId/submitMove', async (request) => {
//   console.log(`[POST] ${request.url}`)
//   console.log(`BODY: ${JSON.stringify(request.body, null, 2)}`)
//   const { gameId } = request.params
//   const { from, to } = request.body
//   const { puzzleMove, success } = server.gameManager.move(gameId, from, to)
//   return {
//     success,
//     ...(puzzleMove ? { puzzleMove: puzzleMove.move } : {})
//   }
// })

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
