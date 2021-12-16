import React, { useState } from 'react'
import ExtensionIcon from '@mui/icons-material/Extension'
import DownloadingIcon from '@mui/icons-material/Downloading'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'

type ProgressState = 'WAITING' | 'READY' | 'NOT_STARTED' | 'COMPLETED'
type Difficulty = 'HARD' | 'MEDIUM' | 'EASY'
// popularity (?)
type Puzzle = {
  id: string;
  name: string;
  difficulty: Difficulty;
  progress: ProgressState;
}

export type PuzzlesPageProps = {
  puzzles?: Puzzle[]
}

type PuzzleCardProps = {
  puzzle: Puzzle;
};

const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']
const progressStates: ProgressState[] = ['WAITING', 'READY', 'NOT_STARTED', 'COMPLETED']
function getRandomPuzzle(index: number): Puzzle {
  const randomDifficulty = difficulties[Math.random() * difficulties.length] || 'EASY'
  const randomProgress = progressStates[Math.random() * progressStates.length] || 'NOT_STARTED'
  return {
    id: `test-${index}`,
    name: `Test Puzzle ${index}`,
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

function PuzzleCard({ puzzle }: PuzzleCardProps): JSX.Element {
  return (
    <Card>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <CardContent>
          <Typography variant="h6" css={{ marginBottom: 12 }}>
            {puzzle.name}
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
    </Card>
  )
}

export default function PuzzlesPage({ puzzles = mockPuzzles }: PuzzlesPageProps): JSX.Element {
  return (
    <Grid container spacing={2}>
      {puzzles.map(puzzle => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={puzzle.id}>
          <PuzzleCard puzzle={puzzle} />
        </Grid>
      ))}
    </Grid>
  )
}
