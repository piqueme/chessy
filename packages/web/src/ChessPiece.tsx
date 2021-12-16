import { Piece, Square } from '@chessy/core'
import { useDrag } from 'react-dnd'
import type { CSSObject } from '@emotion/react'

type Props = {
  piece: Piece;
  square: Square;
  size?: number;
  unit?: 'px' | '%';
  cssOverrides?: CSSObject;
}

const piecePositions: Record<Piece['type'], number> = {
  king: 0,
  queen: 5,
  rook: 2,
  bishop: 4,
  knight: 3,
  pawn: 1
}

const sidePositions: Record<Piece['side'], number> = {
  black: 1,
  white: 0,
}

// TODO cannot drag if not side to move

export default function ChessPiece({ 
  piece, 
  square,
  size = 48, 
  unit = 'px', 
  cssOverrides = {} 
}: Props): JSX.Element {
  const pieceTopOffset = sidePositions[piece.side] * size
  const pieceLeftOffset = piecePositions[piece.type] * size

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: square,
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  }))

  return (
    <div
      ref={drag}
      css={{
        opacity: isDragging ? 0.5 : 1,
        backgroundImage: 'url("/pieces.svg")',
        backgroundSize: `${6 * size}${unit} ${2 * size}${unit}`,
        width: `${size}${unit}`,
        height: `${size}${unit}`,
        backgroundPosition: `top ${pieceTopOffset}${unit} left ${pieceLeftOffset}${unit}`,
        ...cssOverrides
      }}
    />
  )
}

