import type { Board, Square, PieceSide } from './board'
import { opposite, shift, inBoard, findPieces, atSquare } from './board'

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
  if (!piece || !(piece.type === 'pawn')) { throw new Error('Not a pawn being moved!'); }
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
  if (!piece || !(piece.type === 'king')) { throw new Error('Not a king being moved!'); }

  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const moves: Move[] = []

  for (const dir of allDirs) {
    const moveSquare = shift(from, dir)
    const squareInBoard = inBoard(moveSquare, board)
    if (!squareInBoard) { continue }
    const squareEmpty = !(atSquare(moveSquare, board))
    const squareEnemy = atSquare(moveSquare, board)?.side === opposite(piece.side)
    if (squareEmpty || squareEnemy) {
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

export function getValidMoves(board: Board, from: Square): Move[] {
  const piece = atSquare(from, board)
  if (!piece) { return [] }
  const potentialMoves = getPotentialMoves(board, from)
  const validMoves: Move[] = []
  potentialMoves.forEach(move => {
    const maybeCapturedPiece = atSquare(move.to, board)
    const moveRow = board[move.to[0]]
    const fromRow = board[move.from[0]]
    if (!moveRow || !fromRow) {
      throw new Error('Bad board structure!')
    }
    moveRow[move.to[1]] = piece
    fromRow[move.from[1]] = null
    if (!isCheck(board, piece.side)) {
      validMoves.push(move)
    }
    fromRow[move.from[1]] = piece
    moveRow[move.to[1]] = maybeCapturedPiece
  })
  return validMoves
}

function getAllPotentialMoves(board: Board, side: PieceSide): Move[] {
  const squares = findPieces({ side }, board)
  return squares.map(
    square => getPotentialMoves(board, square)
  ).flat()
}

export function isCheck(board: Board, side: PieceSide): boolean {
  const ownKingSquare = findPieces({ type: 'king', side: side }, board)
  if (ownKingSquare.length !== 1) {
    throw new Error('Did not find exactly 1 king on own side!')
  }
  const enemySide = opposite(side)
  const enemyMoves = getAllPotentialMoves(board, enemySide)
  return enemyMoves.some(move => move.to[0] === ownKingSquare[0]?.[0] && move.to[1] === ownKingSquare[0]?.[1])
}

export function move(board: Board, side: PieceSide, from: Square, to: Square): Move {
  const validMoves = getValidMoves(board, from)
  const piece = atSquare(from, board)
  if (!piece || piece.side !== side || !validMoves.some(v => v.to === to)) {
    throw new Error(`Move ${from}:${to} is not valid.`)
  }
  const toRow = board[to[0]]
  const fromRow = board[from[0]]
  if (!toRow || !fromRow) {
    throw new Error('Target square does not exist.')
  }
  const maybeCapturedPiece = atSquare(to, board)
  toRow[to[1]] = piece
  const inCheck = isCheck(board, side)
  if (inCheck) {
    fromRow[from[1]] = piece
    toRow[to[1]] = maybeCapturedPiece
    throw new Error('Move would put you in check!')
  }
  return { from, to }
}

