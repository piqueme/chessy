import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { getAllSquares, atSquare } from '@chessy/core'
import SquareFrame from './SquareFrame'
import Square from './Square'
import Piece from './Piece'
import type {
  Board as BoardData,
  Square as SquareData,
  Piece as PieceData,
  Side
} from '@chessy/core'

type PieceDragHandler = (square: SquareData, piece: PieceData) => void
type PieceDropHandler = (square: SquareData, piece: PieceData) => void
type Props = {
  board: BoardData;
  isAnimated?: boolean;
  showLabels?: boolean;
  sideToView: Side;
  sideToMove: Side;
  onPieceDragStart: PieceDragHandler;
  onPieceDrop: PieceDropHandler;
  movingPieceId?: string;
}

const BLACK_COLOR = '#d18b47'
const WHITE_COLOR = '#ffce9e'
type BLACK = typeof BLACK_COLOR
type WHITE = typeof WHITE_COLOR

function getSquareColor(square: SquareData): BLACK | WHITE {
  const polarity = (square[0] + square[1]) % 2
  return polarity === 0 ? WHITE_COLOR : BLACK_COLOR
}

function getSquareLabelColor(square: SquareData): BLACK | WHITE {
  const polarity = (square[0] + square[1]) % 2
  return polarity === 1 ? WHITE_COLOR : BLACK_COLOR
}

function getSquareKey(square: SquareData): string {
  return `${square[0]}~${square[1]}`
}

function getSquareView(square: SquareData, side: Side): SquareData {
  return side === 'black' ? [7 - square[0], 7 - square[1]] : square
}

function Board({
  board,
  isAnimated = false,
  showLabels = true,
  sideToView,
  sideToMove,
  onPieceDragStart,
  onPieceDrop,
  movingPieceId,
}: Props): JSX.Element {
  const squares = getAllSquares(board)
  const squaresView = (sideToView === 'black' ? squares.slice().reverse() : squares)

  return (
    <DndProvider backend={HTML5Backend}>
      <SquareFrame border="8px solid #a04a27">
        <div css={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {squaresView.map((square, viewIdx) => {
            const isLastRow = (viewIdx + 1) % board.length === 0
            const isLastCol = (viewIdx + 1) / 8 > (board[0].length - 1)
            const rowLabel = `${board.length - square[0]}`
            const colLabel = String.fromCharCode(97 + square[1])
            const canDrop = !!onPieceDrop
            return (
              <Square
                key={getSquareKey(square)}
                square={square}
                color={getSquareColor(square)}
                labelColor={getSquareLabelColor(square)}
                {...((showLabels && isLastRow) ? { rowLabel } : {})}
                {...((showLabels && isLastCol) ? { colLabel } : {})}
                {...(canDrop ? {
                  onPieceDrop: (piece) => { onPieceDrop(square, piece) }
                } : {})}
              />
            )
          })}
          {squaresView.map((square) => {
            const piece = atSquare(square, board)
            const squareView = getSquareView(square, sideToView)
            const isMovingPiece = piece && piece?._id === movingPieceId
            const canMovePiece = sideToMove === piece?.side
            const canAnimatePiece = !isMovingPiece && isAnimated
            const animationCSS = {
              transitionProperty: `top, left`,
              transitionDuration: `0.3s, 0.3s`
            }

            if (piece) {
              return (
                <Piece
                  key={piece._id}
                  piece={piece}
                  size="12.5%"
                  cssOverrides={{
                    pointerEvents: `${movingPieceId && !isMovingPiece ? 'none' : 'auto'}`,
                    position: 'absolute',
                    top: `${12.5 * squareView[0]}%`,
                    left: `${12.5 * squareView[1]}%`,
                    ...(canAnimatePiece ? {} : animationCSS)
                  }}
                  {...canMovePiece ? { onDragStart: () => { onPieceDragStart(square, piece) } } : {}}
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
