import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import PuzzleCard from './PuzzleCard'
import { apiClient } from './api'
import { gql } from 'graphql-request'

import type { Board, Side } from '@chessy/core'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type ProgressState = 'PLAYING' | 'COMPLETED'
type Game = {
  id: string;
  progressState: ProgressState;
}
type Puzzle = {
  id: string;
  difficulty: Difficulty;
  sideToMove: Side;
  startBoard: Board;
  game?: Game;
}

export type PuzzlesPageProps = {
  puzzles?: Puzzle[]
}

type FetchPuzzlesQueryResponse = {
  puzzles: Puzzle[]
};
const fetchPuzzlesQuery = gql`
  query FetchPuzzlesQuery {
    puzzles {
      id
      difficulty
      sideToMove
      startBoard {
        type
        side
      }
      game {
        id
        progressState
      }
    }
  }
`

type CreateGameMutationResponse = {
  createGameFromPuzzle: {
    id: string
  }
}
type CreateGameMutationVariables = {
  puzzleId: string
}
const createGameMutation = gql`
  mutation CreateGameMutation($puzzleId: ID!) {
    createGameFromPuzzle(puzzleId: $puzzleId) {
      id
    }
  }
`

export default function PuzzlesPage(): JSX.Element {
  const navigate = useNavigate()
  const { data: puzzleData, error } = useSWR<FetchPuzzlesQueryResponse>(fetchPuzzlesQuery, apiClient)
  const [navigating, setNavigating] = useState(false)
  const loading = !puzzleData && !error
  const transitionDuration = navigating ? 250 : 450

  const handleGotoGame = (gameId: string) => {
    setNavigating(true)
    setTimeout(() => {
      navigate(`/game/${gameId}`)
    }, transitionDuration)
  }

  const handleCreateGame = async (puzzleId: string) => {
    const data = await apiClient<CreateGameMutationResponse, CreateGameMutationVariables>(
      createGameMutation, { puzzleId }
    )
    setNavigating(true)
    setTimeout(
      () => { navigate(`/game/${data.createGameFromPuzzle.id}`) },
      transitionDuration
    )
  }

  // TODO: Ideally should be "placeholder" state...
  if (loading || error) {
    return (
      <Grid container spacing={2}>
        {loading && (
          <div css={{ marginTop: 48 }}>
            <CircularProgress />
          </div>
        )}
        {error && (
          <div css={{ marginTop: 48 }}>
            Uhoh! There was a problem loading the page.
          </div>
        )}
      </Grid>
    )
  }

  return (
    <Fade in={!navigating} timeout={transitionDuration}>
      <Grid container spacing={2}>
        {puzzleData && puzzleData.puzzles.map((puzzle, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={puzzle.id}>
            <PuzzleCard
              index={i + 1}
              puzzle={puzzle}
              onClick={() => {
                if (puzzle.game) {
                  handleGotoGame(puzzle.game.id)
                } else {
                  handleCreateGame(puzzle.id)
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Fade>
  )
}
