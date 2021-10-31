import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { createGameManager } from './gameManager'
import type { Square, Game } from '@chessy/core'

const gameManager = createGameManager()
const server = fastify()

type GetGameRouteParams = {
  gameId: string
}

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
})

server.get<{
  Params: GetGameRouteParams
}>('/game/:gameId', async (request) => {
  const game = gameManager.getGame(request.params.gameId)
  return game
})

server.get('/game', async () => {
  return gameManager.getAllGames()
})

server.post('/game', async () => {
  const game = gameManager.createGame()
  return game
})

type SubmitMoveBody = {
  gameId: string;
  from: Square;
  to: Square;
}

type SubmitMoveReply = Game


server.post<{
  Body: SubmitMoveBody;
  Reply: SubmitMoveReply
}>('/submitMove', async (request) => {
  const { gameId, from, to } = request.body
  console.log("REQUEST", request.body, gameId, from, to)
  const gameAfterMove = gameManager.submitMove(gameId, from, to)
  return gameAfterMove
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
