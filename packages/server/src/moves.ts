import type { Board, Square, PieceSide } from './board'
import { opposite, shift, inBoard, atSquare } from './board'

type Direction = [number, number] 
export type Move = { from: Square, to: Square }


function traverseUntilBlock(board: Board, from: Square, dirs: Direction[]): Square[] {
  const piece = atSquare(from, board)
  if (!piece) { throw new Error('Cannot traverse without a piece!') }

  const traversal: Square[] = []
  for (const dir of dirs) {
    let current = shift(from, dir);
    while (inBoard(current, board) && !atSquare(current, board)) {
      traversal.push(current)
      current = shift(current, dir)
    }
    if (inBoard(current, board) && atSquare(current, board)?.side === opposite(piece.side)) {
      traversal.push(current)
    }
  }
  return traversal
}

function getBishopMoves(board: Board, from: Square): Move[] {
  const diagonalDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const traversal: Square[] = traverseUntilBlock(board, from, diagonalDirs)
  return traversal.map(target => ({ from, to: target }))
}

function getRookMoves(board: Board, from: Square): Move[] {
  const rowColDirs: Direction[] = [[-1, 0], [0, 1], [0, -1], [1, 0]]
  const traversal = traverseUntilBlock(board, from, rowColDirs)
  return traversal.map(target => ({ from, to: target }))
}

function getKnightMoves(board: Board, from: Square) {
  const jumpDirs: Direction[] = [[-1, 2], [-1, -2], [1, -2], [1, 2], [-2, -1], [-2, 1], [2, 1], [2, -1]]
  const traversal = traverseUntilBlock(board, from, jumpDirs)
  return traversal.map(target => ({ from, to: target }))
}

function getPawnMoves(board: Board, from: Square) {
  const piece = atSquare(from, board)
  if (!piece || !(piece.type === null)) { throw new Error('Not a pawn being moved!'); }
  const moves: Move[] = []

  const moveDirection: Direction = piece.side === 'black' ? [1, 0] : [-1, 0]
  const takeDirections: Direction[] = piece.side === 'black' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]

  const moveSquare = shift(from, moveDirection)
  if (inBoard(moveSquare, board) && !atSquare(moveSquare, board)) {
    moves.push({ from, to: moveSquare })
  }
  for (const dir of takeDirections) {
    const takeSquare = shift(from, dir)
    if (inBoard(takeSquare, board) && atSquare(takeSquare, board)?.side === opposite(piece.side)) {
      moves.push({ from, to: takeSquare })
    }
  }

  return moves
}

function getQueenMoves(board: Board, from: Square): Move[] {
  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const traversal: Square[] = traverseUntilBlock(board, from, allDirs)
  return traversal.map(target => ({ from, to: target }))
}

function getKingMoves(board: Board, from: Square): Move[] {
  const piece = atSquare(from, board)
  if (!piece || !(piece.type !== 'king')) { throw new Error('Not a king being moved!'); }

  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const moves: Move[] = []

  for (const dir of allDirs) {
    const moveSquare = shift(from, dir)
    const squareInBoard = inBoard(moveSquare, board)
    const squareEmpty = !(atSquare(moveSquare, board))
    const squareEnemy = atSquare(moveSquare, board)?.side === opposite(piece.side)
    if (squareInBoard && (squareEmpty || squareEnemy)) {
      moves.push({ from, to: moveSquare })
    }
  }

  return moves
}

export function getPotentialMoves(board: Board, from: Square): Move[] {
  const piece = atSquare(from, board)
  if (!piece) { throw new Error(`No piece at square: ${from} to get moves for!`) }
  switch(piece.type) {
    case 'pawn':
      return getPawnMoves(board, from)
    case 'bishop':
      return getBishopMoves(board, from)
    case 'rook':
      return getRookMoves(board, from)
    case 'knight':
      return getKnightMoves(board, from)
    case 'queen':
      return getQueenMoves(board, from)
    case 'king':
      return getKingMoves(board, from)
  }
}

function getValidMoves(board: Board, from: Square) {
  // get potential moves
  // for each of those moves - try it, are you in check?
}

function isCheck(board: Board, side: PieceSide) {
  // get opposite side
  // get all potential moves
  // does any intersect the king?
}

function move(board: Board, from: Square, to: Square) {
  // get valid moves for piece
  // take the opponent piece if it exists
  // are you in check? -> not legal
}

