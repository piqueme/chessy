import React from 'react'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActionArea from '@mui/material/CardActionArea'
import ExtensionIcon from '@mui/icons-material/Extension'
import DownloadingIcon from '@mui/icons-material/Downloading'
import type { Side } from '@chessy/core'

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
  game?: Game;
};

type Props = {
  puzzle: Puzzle;
  index?: number;
  onClick?: (() => void) | (() => Promise<void>);
};

function getReadableDifficulty(difficulty: Difficulty): string {
  const readableDifficultyMapping = {
    'BEGINNER': 'Beginner',
    'INTERMEDIATE': 'Intermediate',
    'HARD': 'Hard'
  }

  return readableDifficultyMapping[difficulty]
}

function getReadableProgress(progress?: ProgressState): string {
  if (!progress) { return 'Not Started' }
  const readableProgressMapping = {
    'PLAYING': 'Playing',
    'COMPLETED': 'Completed',
  }

  return readableProgressMapping[progress]
}

function PuzzleCard({ puzzle, index, onClick }: Props): JSX.Element {
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
              {index ? `Puzzle ${index}` : puzzle.id}
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
                {getReadableProgress(puzzle.game?.progressState)}
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

export default PuzzleCard
