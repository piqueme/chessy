import React, { useState, useReducer, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Material UI components
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'

import NotFoundPage from './NotFoundPage'
import useGame from './useGame'
import Board from './Board'
import NotatedHistory from './NotatedHistory'
import type { Square as SquareData } from '@chessy/core'
import { atSquare } from '@chessy/core'

type BuildMoveState = { from: SquareData | null; to: SquareData | null }
type BuildMoveAction = {
  type: 'START';
  payload: SquareData;
} | {
  type: 'END';
  payload: SquareData;
} | {
  type: 'CLEAR';
}

function buildMoveReducer(
  builtMove: BuildMoveState,
  action: BuildMoveAction
): BuildMoveState {
  switch (action.type) {
    case 'START':
      return { from: action.payload, to: null }
    case 'END':
      return { from: builtMove.from, to: action.payload }
    case 'CLEAR':
      return { from: null, to: null }
    default: {
      throw new Error('Invalid action!')
    }
  }
}

function GamePage(): JSX.Element {
  const params = useParams()
  const navigate = useNavigate()
  const [isNavigating, setNavigating] = useState(false)
  const [builtMove, dispatch] = useReducer(buildMoveReducer, { from: null, to: null })
  const transitionDuration = 400

  if (!params['gameId']) {
    return <NotFoundPage/>
  }
  const { game, syncState, move, remove } = useGame(params['gameId'])

  useEffect(() => {
    console.log("")
    const { from, to } = builtMove
    if (from && to) {
      move(builtMove).then(() => {
        dispatch({ type: 'CLEAR' })
      })
    }
  }, [builtMove])


  if (syncState === 'LOADING') {
    return <CircularProgress />
  } else if (syncState === 'UNSYNCED') {
    return <div> ERROR! </div>
  }

  const handleMoveStart = ({ square }: { square: SquareData }) => {
    dispatch({ type: 'START', payload: square })
  }

  const handleMoveEnd = ({ square }: { square: SquareData }) => {
    dispatch({ type: 'END', payload: square })
  }

  const movingPiece = builtMove.from ? atSquare(builtMove.from, game.board) : null

  return (
    <Fade in={!isNavigating} timeout={transitionDuration}>
      <Grid container spacing={2}>
        <Grid item xs={1} />
        <Grid item xs={10} md={5}>
          <div css={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div css={{ width: '100%', maxWidth: '75vh' }}>
              <Board
                board={game.board}
                viewSide={game.puzzle.sideToMove}
                moveSide={game.sideToMove}
                onMoveStart={handleMoveStart}
                onMoveEnd={handleMoveEnd}
                {...(movingPiece ?
                 { movingPiece: movingPiece._id } :
                 {}
                )}
              />
            </div>
          </div>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={1} md="auto" />
        <Grid item xs={10} md={4}>
          <NotatedHistory history={game.history} startSide={game.puzzle.sideToMove}/>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={1} md={5} />
        <Grid item xs={10} md={2}>
          <Button
            variant="contained"
            onClick={async () => {
              await remove()
              setNavigating(true)
              setTimeout(() => {
                navigate('/puzzles')
              }, transitionDuration)
            }}
          >
            Clear Game
          </Button>
        </Grid>
        <Grid item xs={1} md={5} />
      </Grid>
    </Fade>
  )
}

export default GamePage
