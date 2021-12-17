import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { createGameManager, convertGameForResponse } from './gameManager'
import { Square } from '@chessy/core'

const gameManager = createGameManager()
const server = fastify()

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
})

type GetGameRouteParams = {
  gameId: string;
}
type GameQueryString = {
  includeHistory?: boolean;
};
server.get<{
  Params: GetGameRouteParams;
  Querystring: GameQueryString;
}>('/game/:gameId', async (request) => {
  console.log(`[GET] ${request.url}`)
  const game = gameManager.getGame(request.params.gameId)
  return convertGameForResponse(game, request.query.includeHistory)
})

type GamePuzzleFinderQueryString = {
  q: 'byPuzzle';
  puzzleId: string;
  includeHistory?: boolean;
};
type GameAllFinderQueryString = {
  q: 'all';
  includeHistory?: boolean;
};
type GameFinderQueryString =
  GamePuzzleFinderQueryString |
  GameAllFinderQueryString
server.get<{
  Querystring: GameFinderQueryString
}>('/game', async (request) => {
  console.log(`[GET] ${request.url}`)
  console.log(`Query Params: ${JSON.stringify(request.query, null, 2)}`)
  if (request.query.q === 'all') {
    return gameManager.getAllGames()
  }
  if (request.query.q === 'byPuzzle') {
    const game = gameManager.getGameByPuzzle(request.query.puzzleId)
    return convertGameForResponse(game, request.query.includeHistory)
  }
  throw new Error(`Invalid finder!`)
})

type GameCreateQueryString = {
  includeHistory?: boolean;
};
type GameCreateBody = {
  puzzleId: string;
};
server.post<{
  Body: GameCreateBody;
  Querystring: GameCreateQueryString
}>('/game', async (request) => {
  console.log(`[POST] ${request.url}`)
  const game = gameManager.createGame(request.body.puzzleId)
  return convertGameForResponse(game, request.query.includeHistory)
})

type GameDeleteParams = {
  gameId: string;
};
server.delete<{
  Params: GameDeleteParams
}>('/game/:gameId', async (request) => {
  console.log(`[DELETE] ${request.url}`)
  gameManager.removeGame(request.params.gameId)
  return {}
})

server.delete('/game', async (request) => {
  console.log(`[DELETE] ${request.url}`)
  gameManager.removeAllGames()
  return {}
})

type GetPuzzleRouteParams = {
  puzzleId: string;
}
server.get<{
  Params: GetPuzzleRouteParams;
}>('/puzzle/:puzzleId', async (request) => {
  console.log(`[GET] ${request.url}`)
  const puzzleMetadata = gameManager.getPuzzleMetadata(request.params.puzzleId)
  return puzzleMetadata
})

type PuzzleAllFinderQueryString = {
  q: 'all';
};
server.get<{
  Querystring: PuzzleAllFinderQueryString
}>('/puzzle', async (request) => {
  console.log(`[GET] ${request.url}`)
  console.log(`Query Params: ${JSON.stringify(request.query, null, 2)}`)
  if (request.query.q === 'all') {
    return gameManager.getAllPuzzleMetadatas()
  }
  throw new Error(`Invalid finder!`)
})

type MoveParams = {
  gameId: string;
}
type MoveBody = {
  from: Square;
  to: Square;
}
type MoveReply = {
  success: boolean;
  puzzleMove?: { from: Square; to: Square };
}

server.post<{
  Params: MoveParams;
  Body: MoveBody;
  Reply: MoveReply;
}>('/game/:gameId/submitMove', async (request) => {
  console.log(`[POST] ${request.url}`)
  console.log(`BODY: ${JSON.stringify(request.body, null, 2)}`)
  const { gameId } = request.params
  const { from, to } = request.body
  const { puzzleMove, success } = gameManager.move(gameId, from, to)
  return {
    success,
    ...(puzzleMove ? { puzzleMove } : {})
  }
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
