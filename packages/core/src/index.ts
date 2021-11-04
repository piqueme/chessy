export type { Side, Square, Piece, Board } from './board'
export type { PuzzleGame } from './game'

import { createFromPuzzle, tryMove } from './game'
export const gameMutations = { createFromPuzzle, tryMove }
// EXPORTS
// Types
//  board, square, piece
//  game
//  move
//
// Actions
//  submit move
//  execute move
