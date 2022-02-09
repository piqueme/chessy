import React, { useState, useReducer, useEffect } from 'react'
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
import type { Move, Puzzle, PlayerGame, Square as SquareData } from '@chessy/core'
import { isValidMove, movePlayerGame } from '@chessy/core'
/* import type { Piece, Puzzle, Board, Square, PlayerGame } from '@chessy/core' */

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type Game = {
  id: string;
  board: PlayerGame['board'];
  sideToMove: PlayerGame['sideToMove'];
  checkState: PlayerGame['checkState'];
  progressState: 'PLAYING' | 'COMPLETED';
  puzzle: Puzzle & { difficulty: Difficulty };
  history: PlayerGame['history'];
};
type FetchGameQueryResponse = {
  game: Game
}
type FetchGameQueryVariables = {
  id: string;
}
const GAME_PAGE_GAME_DETAILS = gql`
  fragment GamePageGameDetails on Game {
    _id
    board {
      type
      side
    }
    sideToMove
    checkState
    progressState
    puzzle {
      id
      sideToMove
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
`
const fetchGameQuery = gql`
  ${GAME_PAGE_GAME_DETAILS}
  query FetchGameQuery($id: ID!) {
    game(id: $id) {
      ...GamePageGameDetails
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

type MoveMutationResponse = {
  move: {
    game: Game;
    puzzleMove: PlayerGame['history'][0];
    success: boolean;
  }
}
type MoveMutationVariables = {
  gameId: string;
  move: {
    from: SquareData;
    to: SquareData;
  };
}
const MoveMutation = gql`
  ${GAME_PAGE_GAME_DETAILS}
  mutation MoveMutation($gameId: ID!, $move: MoveInput!) {
    move(gameId: $gameId, move: $move) {
      game {
        ...GamePageGameDetails
      }
      puzzleMove {
        move {
          from
          to
        }
      }
      success
    }
  }
`

type MoveState = { from: null | SquareData; to: null | SquareData }
type MoveAction = {
  type: 'START';
  payload: SquareData;
} | {
  type: 'END';
  payload: SquareData;
} | {
  type: 'CLEAR';
}
function reducer(moveState: MoveState, action: MoveAction): MoveState {
  switch (action.type) {
    case 'START':
      return { from: action.payload, to: null }
    case 'END':
      return { from: moveState.from, to: action.payload }
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
  // const [startMoveSquare, setStartMoveSquare] = useState<SquareData | null>(null)
  const [moveState, dispatch] = useReducer(reducer, { from: null, to: null })
  const transitionDuration = 400

  if (!params['gameId']) {
    return <NotFoundPage/>
  }
  const variables = { id: params['gameId'] }
  const { data, error, mutate } = useSWR<FetchGameQueryResponse, FetchGameQueryVariables>([fetchGameQuery, variables], apiClient, { revalidateOnFocus: false })

  useEffect(() => {
    console.log("GOT MOVE CHANGE")
    const { from, to } = moveState
    if (from && to) {
      console.log("EXECUTING MOVE")
      const move = { from, to }
      const previousMove = game?.history[game.history.length - 1]?.move
      const valid = isValidMove(move, previousMove, game.sideToMove, game.board)
      if (!valid) {
        console.log("NOT A VALID MOVE")
        return
      }

      const newGame = {
        ...game,
        ...movePlayerGame(move.from, move.to, undefined, game)
      }
      console.log("NEW GAME", newGame)
      mutate({ game: newGame }, false)
      console.log("API REQUEST")
      apiClient<MoveMutationResponse, MoveMutationVariables>(
        MoveMutation, { gameId: game.id, move }
      ).then(data => {
        mutate({ game: data.move.game }, false)
        dispatch({ type: 'CLEAR' })
      })
    }
  }, [moveState])


  if (!data && !error) {
    return <CircularProgress />
  } else if (!data) {
    return <div> ERROR! </div>
  }

  const { game } = data
  console.log("RENDERING", game)

  const handleMoveStart = ({ square }: { square: SquareData }) => {
    dispatch({ type: 'START', payload: square })
  }

  const handleMoveEnd = ({ square }: { square: SquareData }) => {
    dispatch({ type: 'END', payload: square })
  }

  return (
    <Fade in={!isNavigating} timeout={transitionDuration}>
      <Grid container spacing={2}>
        <Grid item xs={1} />
        <Grid item xs={10} md={5}>
          <Board
            board={game.board}
            interactingSquare={moveState.from}
            viewSide={game.puzzle.sideToMove}
            moveSide={game.sideToMove}
            onMoveStart={handleMoveStart}
            onMoveEnd={handleMoveEnd}
          />
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
