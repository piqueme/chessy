import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useSWR, { useSWRConfig } from 'swr'
import CircularProgress from '@mui/material/CircularProgress'
import ExtensionIcon from '@mui/icons-material/Extension'
import DownloadingIcon from '@mui/icons-material/Downloading'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActionArea from '@mui/material/CardActionArea'
// Dialog
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'


type ProgressState = 'WAITING' | 'READY' | 'NOT_STARTED' | 'COMPLETED'
type Difficulty = 'HARD' | 'MEDIUM' | 'EASY'
// popularity (?)
type Puzzle = {
  id: string;
  title: string;
  difficulty: Difficulty;
  progress: ProgressState;
}

export type PuzzlesPageProps = {
  puzzles?: Puzzle[]
}

const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']
const progressStates: ProgressState[] = ['WAITING', 'READY', 'NOT_STARTED', 'COMPLETED']
function getRandomPuzzle(index: number): Puzzle {
  const randomDifficulty = difficulties[Math.random() * difficulties.length] || 'EASY'
  const randomProgress = progressStates[Math.random() * progressStates.length] || 'NOT_STARTED'
  return {
    id: `test-${index}`,
    title: `Test Puzzle ${index}`,
    difficulty: randomDifficulty,
    progress: randomProgress,
  }
}

function getReadableDifficulty(difficulty: Difficulty): string {
  const readableDifficultyMapping = {
    'EASY': 'Easy',
    'MEDIUM': 'Medium',
    'HARD': 'Hard'
  }

  return readableDifficultyMapping[difficulty]
}

function getReadableProgress(progress: ProgressState): string {
  const readableProgressMapping = {
    'WAITING': 'Waiting...',
    'READY': 'Ready',
    'NOT_STARTED': 'Not Started',
    'COMPLETED': 'Completed',
  }

  return readableProgressMapping[progress]
}

const mockPuzzles: Puzzle[] = [...Array(10)].map((_, idx) => getRandomPuzzle(idx))
type PuzzleCardProps = {
  puzzle: Puzzle;
  onClick?: () => void;
};

function PuzzleCard({ puzzle, onClick }: PuzzleCardProps): JSX.Element {
  return (
    <Card onClick={onClick}>
      <CardActionArea>
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <CardContent>
            <Typography variant="h6" css={{ marginBottom: 12 }}>
              {puzzle.title}
            </Typography>
            <div css={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <ExtensionIcon />
              <Typography variant="body1" css={{ marginLeft: 8 }}>
                {getReadableDifficulty(puzzle.difficulty)}
              </Typography>
            </div>
            <div css={{ display: 'flex', alignItems: 'center' }}>
              <DownloadingIcon />
              <Typography variant="body1" css={{ marginLeft: 8 }}>
                {getReadableProgress(puzzle.progress)}
              </Typography>
            </div>
          </CardContent>
          <CardMedia
            component="img"
            image="/chess-puzzle.png"
            height="96"
            alt="chess puzzle"
            css={{
              width: 96,
              marginRight: 16,
              marginTop: 16,
              marginBottom: 16,
            }}
          />
        </div>
      </CardActionArea>
    </Card>
  )
}

// DATA FETCHING
// getAllPuzzles
//  PuzzleMetadata
//    id
//    author
//    popularity
//    difficulty
//    initialSide
//    initialPosition
//  PuzzleGame
//    {...puzzleMetadata}
//    player
//    gameId
//    history
//    checkState
//    sideToMove
// useSWR
//
// ideally should be GraphQL
// Server
//  Puzzle
//    id
//    author
//    popularity
//    difficulty
//    progress
//    initialSide
//    initialPosition
//    numMoves
//    history
//
// Click Card
//  Modal Dialog (route?)
//  create game
//
// SERVER TYPES
// puzzleMeta
// puzzleGame
//  puzzleId
//  playerId
//
// puzzleStorage -> a few mock puzzles
//

function getGameKey(gameId: string): string {
  return `/game/${gameId}&includeHistory`
}

const GET_PUZZLES_KEY = '/puzzle?q=all'
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8080',
  timeout: 10000,
})
async function fetcher(url: string) {
  const response = await instance.get(url)
  return response.data
}

export default function PuzzlesPage(): JSX.Element {
  const navigate = useNavigate()
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | undefined>(undefined)
  const { data: puzzleData, error } = useSWR<Puzzle[]>(GET_PUZZLES_KEY, fetcher)
  const { mutate } = useSWRConfig()
  const loading = !puzzleData && !error

  const handleCreatePuzzle = async (puzzle: Puzzle) => {
    const gameData = await instance.post(
      '/game?includeHistory=true',
      { puzzleId: puzzle.id }
    )
    mutate(getGameKey(gameData.data.id), gameData.data, false)
    navigate(`/game/${gameData.data.id}`)
  }

  // on click card
  //  if game in progress -> go to game page
  //  if game not started -> open creation modal
  //    -> click create -> useSWR(createGame) -> redirect
  //
  // GAME PAGE
  // useSWR(getGame)
  // if (!getGame) -> go to puzzle page

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
      {puzzleData && puzzleData.map(puzzle => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={puzzle.id}>
          <PuzzleCard puzzle={puzzle} onClick={() => { setSelectedPuzzle(puzzle) }}/>
        </Grid>
      ))}
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={!!selectedPuzzle}
        onClose={() => { setSelectedPuzzle(undefined) }}
      >
        {selectedPuzzle && (
          <>
            <DialogTitle> Start Puzzle </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <ul>
                  <li css={{ display: 'flex', alignItems: 'space-between'}}>
                    <Typography variant="body1" css={{ fontWeight: 'bold' }}> TITLE: </Typography>
                    <Typography variant="body1"> {selectedPuzzle.title} </Typography>
                  </li>
                  <li css={{ display: 'flex', alignItems: 'space-between'}}>
                    <Typography variant="body1" css={{ fontWeight: 'bold' }}> DIFFICULTY: </Typography>
                    <Typography variant="body1"> {selectedPuzzle.difficulty} </Typography>
                  </li>
                  <li css={{ display: 'flex', alignItems: 'space-between'}}>
                    <Typography variant="body1" css={{ fontWeight: 'bold' }}> STATUS: </Typography>
                    <Typography variant="body1"> {selectedPuzzle.progress} </Typography>
                  </li>
                </ul>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setSelectedPuzzle(undefined) }}> Cancel </Button>
              <Button onClick={() => { handleCreatePuzzle(selectedPuzzle) }}> Start </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Grid>
  )
}
