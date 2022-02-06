import React, { useState } from 'react'
import { gql } from 'graphql-request'
import useSWR from 'swr'
import { useParams, useNavigate } from 'react-router-dom'
// Material UI components
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'

import NotFoundPage from './NotFoundPage'
import Board from './Board'
import { apiClient } from './api'
import type { Puzzle, PlayerGame } from '@chessy/core'
/* import { getAllSquares, isValidMove, movePlayerGame } from '@chessy/core' */
/* import type { Piece, Puzzle, Board, Square, PlayerGame } from '@chessy/core' */

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type FetchGameQueryResponse = {
  game: {
    id: string;
    board: PlayerGame['board'];
    sideToMove: PlayerGame['sideToMove'];
    checkState: PlayerGame['checkState'];
    progressState: 'PLAYING' | 'COMPLETED';
    puzzle: Puzzle & { difficulty: Difficulty };
    history: PlayerGame['history'];
  }
}
type FetchGameQueryVariables = {
  id: string;
}
const fetchGameQuery = gql`
  query FetchGameQuery($id: ID!) {
    game(id: $id) {
      id
      board {
        type
        side
      }
      sideToMove
      checkState
      progressState
      puzzle {
        id
        difficulty
      }
      history {
        move {
          from
          to
          take {
            piece {
              type
              side
            }
            square
          }
          promotion
        }
        notation
      }
    }
  }
`

type RemoveGameMutationResponse = {
  id: string;
}
type RemoveGameMutationVariables = {
  gameId: string;
}
const RemoveGameMutation = gql`
  mutation RemoveGameMutation($gameId: ID!) {
    deleteGame(gameId: $gameId)
  }
`

function GamePage(): JSX.Element {
  const params = useParams()
  const navigate = useNavigate()
  const [isNavigating, setNavigating] = useState(false)
  const transitionDuration = 400

  if (!params['gameId']) {
    return <NotFoundPage/>
  }
  const variables = { id: params['gameId'] }
  const { data, error } = useSWR<FetchGameQueryResponse, FetchGameQueryVariables>([fetchGameQuery, variables], apiClient)

  if (!data && !error) {
    return <CircularProgress />
  } else if (!data) {
    return <div> ERROR! </div>
  }

  const { game } = data

  // FLEX (row, wrap, space-between)
  // Board Width
  // History + Board Min-Height
  //
  // Screen less board width -> history gets full width

  // GRID
  // Tablet + Desktop
  //  space = 1
  //  board = left = 5
  //  space = 2
  //  history =  3
  //  space = 1
  // Mobile
  //  board = 12
  //  history = 12
  // Risk -> font sizes for history are weird

  return (
    <Fade in={!isNavigating} timeout={transitionDuration}>
      <Grid container spacing={2}>
        <Grid item xs={1} />
        <Grid item xs={10} md={5}>
          <Board board={game.board} />
        </Grid>
        <Grid item xs={1} md={2} />
        <Grid item xs={1} md={0} />
        <Grid item xs={10} md={3} />
        <Grid item xs={1} />
        <Grid item xs={1} md={5} />
        <Grid item xs={10} md={2}>
          <Button
            variant="contained"
            onClick={async () => {
              await apiClient<RemoveGameMutationResponse, RemoveGameMutationVariables>(
                RemoveGameMutation,
                { gameId: game.id }
              )
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
