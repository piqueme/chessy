import { useDrop } from 'react-dnd'
import type { Square as SquareData, Piece as PieceData } from '@chessy/core'

type Props = {
  square: SquareData;
  color: string;
  labelColor: string;
  rowLabel?: string;
  colLabel?: string;
  size?: string | number;
  onPieceDrop?: (piece: PieceData) => void;
}

function Square({
  square,
  color,
  labelColor,
  rowLabel,
  colLabel,
  size = 'calc(100% / 8)',
  onPieceDrop,
}: Props): JSX.Element {
  const [, drop] = useDrop(() => ({
    accept: 'piece',
    drop: (piece: PieceData) => {
      console.log(`Received drop at square ${square}`)
      onPieceDrop && onPieceDrop(piece)
    }
  }))

  return (
    <div
      css={{
        position: 'relative',
        backgroundColor: color,
        width: size,
        height: size,
      }}
      ref={drop}
    >
      {rowLabel && (
        <span css={{
          position: 'absolute',
          color: labelColor,
          top: 2,
          right: 2,
        }}>
          {rowLabel}
        </span>
      )}
      {colLabel && (
        <span css={{
          position: 'absolute',
          color: labelColor,
          bottom: 2,
          left: 2,
        }}>
          {colLabel}
        </span>
      )}
    </div>
  )
}

export default Square
