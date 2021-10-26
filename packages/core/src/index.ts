export type { Side, Square, Piece, Board } from './board'
export type { Game } from './game'

import { createGame, submitMove, executeGameMove } from './game'
export const gameMutations = { createGame, submitMove, executeGameMove }
// EXPORTS
// Types
//  board, square, piece
//  game
//  move
//
// Actions
//  submit move
//  execute move
