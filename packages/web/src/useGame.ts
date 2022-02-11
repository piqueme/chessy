import { gql } from 'graphql-request'
import useSWR from 'swr'
import { apiClient } from './api'
import { isValidMove, movePlayerGame } from '@chessy/core'
import type { KeyedMutator } from 'swr'
import type { Move, Puzzle, PlayerGame, Square as SquareData } from '@chessy/core'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
type Game = {
  _id: string;
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
      _id
      type
      side
    }
    sideToMove
    checkState
    progressState
    puzzle {
      _id
      sideToMove
      difficulty
    }
    history {
      move {
        from
        to
        take {
          piece {
            _id
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
    game(_id: $id) {
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

type SyncState = 'LOADING' | 'SYNCED' | 'SYNCING' | 'UNSYNCED'

/**
 * Performs an optimistic update of the game given a move, requesting
 * the game to be updated from the server in the background.
 */
function move(
  mutate: KeyedMutator<FetchGameQueryResponse>,
  move: Move,
  game: Game,
): Promise<void> {
  console.log("EXECUTING MOVE")
  const previousMove = game?.history[game.history.length - 1]?.move
  const valid = isValidMove(move, previousMove, game.sideToMove, game.board)
  if (!valid) {
    console.log("NOT A VALID MOVE")
    return Promise.resolve()
  }

  const newGame = {
    ...game,
    ...movePlayerGame(move.from, move.to, undefined, game)
  }
  console.log("NEW GAME", newGame)
  mutate({ game: newGame }, false)
  console.log("API REQUEST")
  return apiClient<MoveMutationResponse, MoveMutationVariables>(
    MoveMutation, { gameId: game._id, move }
  ).then(data => {
    mutate({ game: data.move.game }, false)
  })
}

function remove(gameId: string): Promise<RemoveGameMutationResponse> {
  return apiClient<RemoveGameMutationResponse, RemoveGameMutationVariables>(
    RemoveGameMutation,
    { gameId }
  )
}

type LoadingGameResult = {
  syncState: SyncState;
}
type CompleteGameResult = {
  game: Game;
  syncState: SyncState;
  move: (nextMove: Move) => Promise<void>;
  remove: (gameId: string) => Promise<RemoveGameMutationResponse>
}
type GameContext = LoadingGameResult | CompleteGameResult;

function useGame(_id: string): GameContext {
  const variables = { id: _id }
  const { data, error, isValidating, mutate } =
    useSWR<FetchGameQueryResponse, FetchGameQueryVariables>(
      [fetchGameQuery, variables], apiClient, { revalidateOnFocus: false }
    )

  let syncState: SyncState
  if (!data && !error) {
    syncState = 'LOADING'
  } else if (error) {
    syncState = 'UNSYNCED'
  } else if (isValidating) {
    syncState = 'SYNCING'
  } else {
    syncState = 'SYNCED'
  }

  const game = data?.game
  if (!game) {
    return { syncState }
  } else {
    return {
      game: data?.game,
      syncState,
      move: (nextMove: Move) => move(mutate, nextMove, game),
      remove: () => remove(game._id)
    }
  }
}

export default useGame
