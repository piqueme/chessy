import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllSquares, isValidMove, movePlayerGame } from '@chessy/core'
import ChessPiece from './ChessPiece'
import CSSReset from './CSSReset'
import axios from 'axios'
import useSWR from 'swr'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Piece, Board, Square, PuzzlePlayerGame } from '@chessy/core'

function getGameKey(gameId: string): string {
  return `/game/${gameId}&includeHistory`
}

async function fetcher(url: string) {
  const response = await instance.get(url)
  return response.data
}

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8080',
  timeout: 10000,
})

function GamePage(): JSX.Element {
  const params = useParams()
  const navigate = useNavigate()
  if (!params['gameId']) { throw new Error('whatup') }
  const { data: game, error } = useSWR(getGameKey(params['gameId']), fetcher, { revalidateIfStale: false })

  if (!game && !error) {
    return <div> Loading </div>
  }
  if (!game && error) {
    return <div> ERROR! </div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        css={{
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CSSReset />
        <h1
          css={{
            fontSize: '2rem',
            marginTop: 72,
            marginBottom: 72,
          }}
        >
          Chessy
        </h1>
        <ChessBoard size="512px" board={game.board} gameId={game.id} />
        <button
          css={{ marginTop: 24 }}
          onClick={async () => {
            await instance.delete('/game')
            navigate('/puzzles')
          }}
        >
          Clear all games
        </button>
      </div>
    </DndProvider>
  )
}

type SquareProps = {
  gameId: string;
  row: number;
  col: number;
  color?: 'black' | 'white';
  size?: number | string;
  piece?: Piece;
}

type BoardProps = {
  size?: number | string;
  board: Board;
  gameId: string;
};

type DataPuzzleGame = PuzzlePlayerGame & { id: string }
function ChessSquare({
  gameId,
  row,
  col,
  color = 'black',
  size = 48,
  piece
}: SquareProps): JSX.Element {
  const { data: game, mutate } = useSWR<DataPuzzleGame>(getGameKey(gameId), fetcher, { revalidateIfStale: false, revalidateOnFocus: false })
  const [, drop] = useDrop(
    () => ({
      accept: 'piece',
      drop: (item: Square) => {
        const to: Square = [row, col]
        const move = { from: item, to }
        const lastMove = game?.history[game.history.length - 1] || null
        const isValid = game && isValidMove(move, lastMove, game.sideToMove, game.board)
        if (isValid) {
          const newGame = movePlayerGame(item, to, null, game)
          mutate({ ...newGame, id: game.id }, false)
          instance.post(`/game/${game.id}/submitMove`, move).then(puzzleResult => {
            setTimeout(() => {
              const { success, puzzleMove } = puzzleResult.data
              if (!success) {
                mutate(game, false)
              } else if (success && puzzleMove) {
                const gameAfterPuzzleMove = movePlayerGame(puzzleMove.from, puzzleMove.to, null, newGame)
                mutate({ ...gameAfterPuzzleMove, id: game.id }, false)
              } else if (success) {
                console.log("WE DID IT!!!!")
              }
            }, 5000)
          })
        }
        // is move valid?
        // can promote?
        //  set promoting
        //  set pending move
        // can't promote?
        //  execute move (client)
        //  API call
        //  mutate
      }
    }),
    [row, col, game?.history.length || 0]
  )
  return (
    <div
      ref={drop}
      css={{
        backgroundColor: color === 'black' ? '#b88b4a': '#e3c16f',
        width: size,
        height: size,
        position: 'relative'
      }}
    >
      {piece && (
        <ChessPiece
          size={100}
          unit="%"
          cssOverrides={{ position: 'absolute', top: 0, left: 0 }}
          piece={piece}
          square={[row, col]}
        />
      )}
    </div>
  )
}

function ChessBoard({ size = '100%', board, gameId }: BoardProps): JSX.Element {
  const squares = getAllSquares(board)
  return (
    <div css={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: size,
      height: size,
    }}>
      {squares.map(square => {
        const parity = (square[0] + square[1]) % 2
        const color = parity === 1 ? 'black' : 'white'
        const piece = board[square[0]]?.[square[1]]
        return (
          <ChessSquare
            gameId={gameId}
            row={square[0]}
            col={square[1]}
            key={`${square[0]}~${square[1]}`}
            color={color}
            size={`calc(${size} / 8)`}
            {...(piece ? { piece } : {})}
          />
        )
      })}
    </div>
  )
}

export default GamePage
