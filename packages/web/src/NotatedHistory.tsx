import React from 'react'
import type { PlayerGame } from '@chessy/core'

type Props = {
  history: PlayerGame['history'];
}
type NotationPair = [string, string] | [string, null] | [null, string]

function segmentHistoryIntoPairs(history: PlayerGame['history']): NotationPair[] {
  return history.reduce((pairedHistory, historyMove, index) => {
    const chunkIndex = Math.floor(index / 2)
    const nextChunk = pairedHistory[chunkIndex]
    if (!nextChunk) {
      pairedHistory[chunkIndex] = [historyMove.notation, null]
      return pairedHistory
    } else {
      pairedHistory[chunkIndex] = [nextChunk[0], historyMove.notation]
      return pairedHistory
    }
  }, [] as NotationPair[])
}

function NotatedHistory({ history }: Props): JSX.Element {
  const segmentedHistory = segmentHistoryIntoPairs(history)
  console.log("SEGMENTED", segmentedHistory)
  return (
    <div css={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '75vh',
      overflowY: 'scroll'
    }}>
      {segmentedHistory.map(([whiteMove, blackMove], moveIndex) => {
        return (
          <div
            key={`${whiteMove}~${blackMove}`}
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
              fontSize: '0.9em',
              width: 36
            }}>
              {moveIndex}
            </div>
            <div css={{
              flexGrow: 1,
              backgroundColor: '#fefefe',
              width: 12,
              padding: '2px 6px',
              borderLeft: '1px solid #ccc',
              fontSize: '0.9em'
            }}>
              {whiteMove}
            </div>
            <div css={{
              flexGrow: 1,
              backgroundColor: '#fefefe',
              width: 12,
              padding: '2px 6px',
              borderLeft: '1px solid #ccc',
              fontSize: '0.9em'
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
