import { Piece as PieceData } from '@puzlr/core'
import { useDrag } from 'react-dnd'
import type { CSSObject } from '@emotion/react'

type Props = {
  piece: PieceData;
  size?: number | string;
  onDragStart?: (piece: PieceData) => void;
  cssOverrides?: CSSObject;
}

const colForPieceInBackgroundImage: Record<PieceData['type'], number> = {
  king: 0,
  queen: 1,
  rook: 4,
  bishop: 2,
  knight: 3,
  pawn: 5
}

const rowForSideInBackgroundImage: Record<PieceData['side'], number> = {
  black: 1,
  white: 0,
}

/**
 * Renders a chess piece. Gets piece image from pieces.svg asset.
 */
function Piece({
  piece,
  size = 48,
  onDragStart,
  cssOverrides = {},
}: Props): JSX.Element {

  const isDraggable = !!onDragStart
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: () => {
      console.log(`Received drag for piece: ${piece}`)
      onDragStart && onDragStart(piece)
      return piece
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    }),
    canDrag: isDraggable,
  }))

  const backgroundSize = `600% 200%`
  const topPositionInBG = `calc(${rowForSideInBackgroundImage[piece.side]} * 300%)`
  const leftPositionInBG = `calc(${colForPieceInBackgroundImage[piece.type]} * 20%)`

  return (
    <div
      ref={drag}
      css={{
        opacity: isDragging ? 0.5 : 1,
        backgroundImage: 'url("/pieces.svg")',
        backgroundSize,
        width: size,
        height: size,
        backgroundPosition: `top ${topPositionInBG} left ${leftPositionInBG}`,
        ...cssOverrides,
      }}
    />
  )
}

export default Piece
