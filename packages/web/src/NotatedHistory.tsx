import React from 'react'
import type { PlayerGame, Side } from '@puzlr/core'

type Props = {
  history: PlayerGame['history'];
  startSide: Side;
}
type NotationPair = [string | null, string | null]

function padPairsHistory(pairedHistory: NotationPair[], length: number): NotationPair[] {
  if (pairedHistory.length >= length) {
    return pairedHistory
  }
  const lengthToPad = length - pairedHistory.length
  const paddedEntries: NotationPair[] = Array(lengthToPad).fill([null, null])
  return [...pairedHistory, ...paddedEntries]
}

function segmentHistoryIntoPairs(
  history: PlayerGame['history'],
  startSide: Side,
): NotationPair[] {
  if (history.length === 0) { return [] }

  const initialPairs: NotationPair[] = startSide === 'black' ? [[null, null]] : []
  const initialChunkOffset = startSide === 'black' ? 1 : 0
  return history.reduce((pairedHistory, historyMove, index) => {
    const chunkIndex = Math.floor((index + initialChunkOffset) / 2)
    const nextChunk = pairedHistory[chunkIndex]
    if (!nextChunk) {
      pairedHistory[chunkIndex] = [historyMove.notation, null]
      return pairedHistory
    } else {
      pairedHistory[chunkIndex] = [nextChunk[0], historyMove.notation]
      return pairedHistory
    }
  }, initialPairs)
}

function NotatedHistory({ history, startSide }: Props): JSX.Element {
  const segmentedHistory = segmentHistoryIntoPairs(history, startSide)
  const presentedHistory = padPairsHistory(segmentedHistory, 5)
  return (
    <div css={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '75vh',
      overflowY: 'scroll'
    }}>
      {presentedHistory.map(([whiteMove, blackMove], moveIndex) => {
        return (
          <div
            key={`${whiteMove}~${blackMove}~${moveIndex}`}
            css={{
              width: '100%',
              display: 'flex',
              borderBottom: '1px solid #ccc',
            }}
          >
            <div css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 0,
              backgroundColor: '#ddd',
              fontSize: '1.5em',
              width: 36
            }}>
              {moveIndex}
            </div>
            <div css={{
              flexGrow: 1,
              backgroundColor: '#fefefe',
              width: 12,
              padding: '6px 6px',
              borderLeft: '1px solid #ccc',
              fontSize: '1.5em'
            }}>
              {whiteMove}
            </div>
            <div css={{
              flexGrow: 1,
              backgroundColor: '#fefefe',
              width: 12,
              padding: '6px 6px',
              borderLeft: '1px solid #ccc',
              fontSize: '1.5em'
            }}>
              {blackMove}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotatedHistory
