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
  movingPiece?: string;
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

function Board({ board, viewSide, moveSide, onMoveStart, onMoveEnd, movingPiece }: Props): JSX.Element {
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
            const isMovingPiece = piece && piece?._id === movingPiece
            if (piece) {
              return (
                <ChessPiece
                  key={piece._id}
                  piece={piece}
                  size="12.5%"
                  cssOverrides={{
                    pointerEvents: `${movingPiece && !isMovingPiece ? 'none' : 'auto'}`,
                    position: 'absolute',
                    top: `${12.5 * squareView[0]}%`,
                    left: `${12.5 * squareView[1]}%`,
                    ...(isMovingPiece ? {} : { transitionProperty: `top, left`, transitionDuration: `0.3s, 0.3s` })
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

export default Board
