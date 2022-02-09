import { Piece as PieceData } from '@chessy/core'
import { useDrag } from 'react-dnd'
import type { CSSObject } from '@emotion/react'

type Props = {
  piece: PieceData;
  size?: number | string;
  isMovable?: boolean;
  onMoveStart?: () => void;
  cssOverrides?: CSSObject;
}

const piecePositions: Record<PieceData['type'], number> = {
  king: 0,
  queen: 1,
  rook: 4,
  bishop: 2,
  knight: 3,
  pawn: 5
}

const sidePositions: Record<PieceData['side'], number> = {
  black: 1,
  white: 0,
}

// TODO: Potentially separate Chess Piece into "Draggable" and "Non-Draggable"
export default function ChessPiece({
  piece,
  size = 48,
  isMovable = false,
  onMoveStart,
  cssOverrides = {},
}: Props): JSX.Element {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: () => {
      onMoveStart && onMoveStart()
      return piece
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    }),
    canDrag: isMovable,
  }))

  return (
    <div
      ref={drag}
      css={{
        opacity: isDragging ? 0.5 : 1,
        backgroundImage: 'url("/pieces.svg")',
        backgroundSize: `600% 200%`,
        width: size,
        height: size,
        backgroundPosition: `top calc(${sidePositions[piece.side]} * 300%) left calc(${piecePositions[piece.type]} * 20%)`,
        ...cssOverrides,
      }}
    />
  )
}

