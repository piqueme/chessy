import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider, useDrop } from 'react-dnd'
import { getAllSquares, atSquare } from '@chessy/core'
import type { Board as BoardData, Square as SquareData, Side } from '@chessy/core'
import ChessPiece from './ChessPiece'

// TODO: Potentially separate render and drag / drop functionality
// Behavior
//  drag -> drop locks to position
//  if api call fails, move back smoothly
//  if api call succeeds, move enemy smoothly

type Props = {
  board: BoardData;
  viewSide: Side;
  moveSide: Side;
  onMoveStart: ({ square }: { square: SquareData }) => void;
  onMoveEnd: ({ square }: { square: SquareData }) => void;
  interactingSquare: SquareData | null;
}

/**
 * Responsive container which provides a height equal to the responsive width.
 */
function SquareFrame({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div css={{
      display: 'inline-block',
      position: 'relative',
      width: '100%',
      border: `8px solid #a04a27`
    }}>
      <div css={{ marginTop: '100%' }} />
      <div css={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }}>
        {children}
      </div>
    </div>
  )
}

const BLACK_COLOR = '#d18b47'
const WHITE_COLOR = '#ffce9e'
type BLACK = typeof BLACK_COLOR
type WHITE = typeof WHITE_COLOR

function getSquareColor(square: SquareData): BLACK | WHITE {
  const polarity = (square[0] + square[1]) % 2
  return polarity === 0 ? WHITE_COLOR : BLACK_COLOR
}

type SquareProps = {
  square: SquareData,
  showRowText?: boolean,
  showColText?: boolean,
  size?: string | number,
  onMoveEnd?: () => void
}
function Square({
  square,
  showRowText = false,
  showColText = false,
  size = 'calc(100% / 8)',
  onMoveEnd,
}: SquareProps): JSX.Element {
  const [, drop] = useDrop(() => ({
    accept: 'piece',
    drop: () => {
      console.log("DROPPING")
      onMoveEnd && onMoveEnd()
    }
  }))

  return (
    <div
      css={{
        position: 'relative',
        backgroundColor: getSquareColor(square),
        width: size,
        height: size,
      }}
      ref={drop}
    >
      {showRowText && (
        <span css={{
          position: 'absolute',
          color: getSquareColor([square[0] + 1, square[1]]),
          top: 2,
          right: 2,
        }}>
          {8 - square[0]}
        </span>
      )}
      {showColText && (
        <span css={{
          position: 'absolute',
          color: getSquareColor([square[0] + 1, square[1]]),
          bottom: 2,
          left: 2,
        }}>
          {String.fromCharCode(97 + square[1])}
        </span>
      )}
    </div>
  )
}

function getSquareView(square: SquareData, side: Side): SquareData {
  return side === 'black' ? [7 - square[0], 7 - square[1]] : square
}

function Board({ board, viewSide, moveSide, onMoveStart, onMoveEnd, interactingSquare }: Props): JSX.Element {
  const squares = getAllSquares(board)
  const squaresView = (viewSide === 'black' ? squares.slice().reverse() : squares)

  return (
    <DndProvider backend={HTML5Backend}>
      <SquareFrame>
        <div css={{
          width: 'calc(100%)',
          height: 'calc(100%)',
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {squaresView.map((square, viewIdx) => (
            <Square
              key={`${square[0]}~${square[1]}`}
              square={square}
              showRowText={(viewIdx + 1) % 8 === 0}
              showColText={(viewIdx + 1) / 8 > 7}
              onMoveEnd={() => { onMoveEnd({ square }) }}
            />
          ))}
          {squaresView.map((square) => {
            const piece = atSquare(square, board)
            const squareView = getSquareView(square, viewSide)
            if (piece) {
              const squareKey = `${square[0]}~${square[1]}`
              const interactingSquareKey = interactingSquare ?
                `${interactingSquare[0]}~${interactingSquare[1]}` : ''
              return (
                <ChessPiece
                  key={`${square[0]}~${square[1]}`}
                  piece={piece}
                  size="12.5%"
                  cssOverrides={{
                    pointerEvents: (!interactingSquareKey || squareKey === interactingSquareKey) ? 'auto' : 'none',
                    position: 'absolute',
                    top: `${12.5 * squareView[0]}%`,
                    left: `${12.5 * squareView[1]}%`,
                  }}
                  isMovable={moveSide === piece.side}
                  onMoveStart={() => { onMoveStart({ square }) }}
                />
              )
            }
            return null
          })}
        </div>
      </SquareFrame>
    </DndProvider>
  )
}


/* type SquareProps = { */
/*   gameId: string; */
/*   row: number; */
/*   col: number; */
/*   color?: 'black' | 'white'; */
/*   size?: number | string; */
/*   piece?: Piece; */
/* } */

/* type BoardProps = { */
/*   size?: number | string; */
/*   board: Board; */
/*   gameId: string; */
/* }; */

/* type DataPuzzleGame = PuzzlePlayerGame & { id: string } */
/* function ChessSquare({ */
/*   gameId, */
/*   row, */
/*   col, */
/*   color = 'black', */
/*   size = 48, */
/*   piece */
/* }: SquareProps): JSX.Element { */
/*   const { data: game, mutate } = useSWR<DataPuzzleGame>(getGameKey(gameId), fetcher, { revalidateIfStale: false, revalidateOnFocus: false }) */
/*   const [, drop] = useDrop( */
/*     () => ({ */
/*       accept: 'piece', */
/*       drop: (item: Square) => { */
/*         const to: Square = [row, col] */
/*         const move = { from: item, to } */
/*         const lastMove = game?.history[game.history.length - 1] || null */
/*         const isValid = game && isValidMove(move, lastMove, game.sideToMove, game.board) */
/*         if (isValid) { */
/*           const newGame = movePlayerGame(item, to, null, game) */
/*           mutate({ ...newGame, id: game.id }, false) */
/*           instance.post(`/game/${game.id}/submitMove`, move).then(puzzleResult => { */
/*             setTimeout(() => { */
/*               const { success, puzzleMove } = puzzleResult.data */
/*               if (!success) { */
/*                 mutate(game, false) */
/*               } else if (success && puzzleMove) { */
/*                 const gameAfterPuzzleMove = movePlayerGame(puzzleMove.from, puzzleMove.to, null, newGame) */
/*                 mutate({ ...gameAfterPuzzleMove, id: game.id }, false) */
/*               } else if (success) { */
/*                 console.log("WE DID IT!!!!") */
/*               } */
/*             }, 5000) */
/*           }) */
/*         } */
/*         // is move valid? */
/*         // can promote? */
/*         //  set promoting */
/*         //  set pending move */
/*         // can't promote? */
/*         //  execute move (client) */
/*         //  API call */
/*         //  mutate */
/*       } */
/*     }), */
/*     [row, col, game?.history.length || 0] */
/*   ) */
/*   return ( */
/*     <div */
/*       ref={drop} */
/*       css={{ */
/*         backgroundColor: color === 'black' ? '#b88b4a': '#e3c16f', */
/*         width: size, */
/*         height: size, */
/*         position: 'relative' */
/*       }} */
/*     > */
/*       {piece && ( */
/*         <ChessPiece */
/*           size={100} */
/*           unit="%" */
/*           cssOverrides={{ position: 'absolute', top: 0, left: 0 }} */
/*           piece={piece} */
/*           square={[row, col]} */
/*         /> */
/*       )} */
/*     </div> */
/*   ) */
/* } */

/* function ChessBoard({ size = '100%', board, gameId }: BoardProps): JSX.Element { */
/*   const squares = getAllSquares(board) */
/*   return ( */
/*     <div css={{ */
/*       display: 'flex', */
/*       flexDirection: 'row', */
/*       flexWrap: 'wrap', */
/*       width: size, */
/*       height: size, */
/*     }}> */
/*       {squares.map(square => { */
/*         const parity = (square[0] + square[1]) % 2 */
/*         const color = parity === 1 ? 'black' : 'white' */
/*         const piece = board[square[0]]?.[square[1]] */
/*         return ( */
/*           <ChessSquare */
/*             gameId={gameId} */
/*             row={square[0]} */
/*             col={square[1]} */
/*             key={`${square[0]}~${square[1]}`} */
/*             color={color} */
/*             size={`calc(${size} / 8)`} */
/*             {...(piece ? { piece } : {})} */
/*           /> */
/*         ) */
/*       })} */
/*     </div> */
/*   ) */
/* } */

export default Board
