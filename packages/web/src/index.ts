import { createBoard, printBoard } from '@chessy/server'

export const board = createBoard()
export const printedBoard = printBoard(board)

