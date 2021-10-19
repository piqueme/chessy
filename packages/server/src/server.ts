import fastify from 'fastify'
import { createGameManager } from './gameManager'
import type { Square } from './board'
import type { Game } from './game'

const gameManager = createGameManager()
const server = fastify()

type GetGameRouteParams = {
  gameId: string
}

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
