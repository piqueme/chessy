import type { Board, Square, Side } from './board'
import { getEnemySide, shift, inBoard, findPieces, atSquare } from './board'

type Direction = [number, number]
export type Move = { from: Square, to: Square }


function traverseUntilBlock(from: Square, dirs: Direction[], board: Board): Square[] {
  const piece = atSquare(from, board)
  if (!piece) { throw new Error('Cannot traverse without a piece!') }

  const traversal: Square[] = []
  for (const dir of dirs) {
    let current = shift(from, dir);
    while (inBoard(current, board) && !atSquare(current, board)) {
      traversal.push(current)
      current = shift(current, dir)
    }
    if (inBoard(current, board) && atSquare(current, board)?.side === getEnemySide(piece.side)) {
      traversal.push(current)
    }
  }
  return traversal
}

function getBishopMoves(from: Square, board: Board): Move[] {
  const diagonalDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const traversal: Square[] = traverseUntilBlock(from, diagonalDirs, board)
  return traversal.map(target => ({ from, to: target }))
}

function getRookMoves(from: Square, board: Board): Move[] {
  const rowColDirs: Direction[] = [[-1, 0], [0, 1], [0, -1], [1, 0]]
  const traversal = traverseUntilBlock(from, rowColDirs, board)
  return traversal.map(target => ({ from, to: target }))
}

function getKnightMoves(from: Square, board: Board) {
  const jumpDirs: Direction[] = [[-1, 2], [-1, -2], [1, -2], [1, 2], [-2, -1], [-2, 1], [2, 1], [2, -1]]
  const traversal = traverseUntilBlock(from, jumpDirs, board)
  return traversal.map(target => ({ from, to: target }))
}

function getPawnMoves(from: Square, board: Board) {
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
    if (inBoard(takeSquare, board) && atSquare(takeSquare, board)?.side === getEnemySide(piece.side)) {
      moves.push({ from, to: takeSquare })
    }
  }

  return moves
}

function getQueenMoves(from: Square, board: Board): Move[] {
  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const traversal: Square[] = traverseUntilBlock(from, allDirs, board)
  return traversal.map(target => ({ from, to: target }))
}

function getKingMoves(from: Square, board: Board): Move[] {
  const piece = atSquare(from, board)
  if (!piece || !(piece.type === 'king')) { throw new Error('Not a king being moved!'); }

  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const moves: Move[] = []

  for (const dir of allDirs) {
    const moveSquare = shift(from, dir)
    const squareInBoard = inBoard(moveSquare, board)
    if (!squareInBoard) { continue }
    const squareEmpty = !(atSquare(moveSquare, board))
    const squareEnemy = atSquare(moveSquare, board)?.side === getEnemySide(piece.side)
    if (squareEmpty || squareEnemy) {
      moves.push({ from, to: moveSquare })
    }
  }

  return moves
}

export function getPotentialMoves(from: Square, board: Board): Move[] {
  const piece = atSquare(from, board)
  if (!piece) { throw new Error(`No piece at square: ${from} to get moves for!`) }
  switch(piece.type) {
    case 'pawn':
      return getPawnMoves(from, board)
    case 'bishop':
      return getBishopMoves(from, board)
    case 'rook':
      return getRookMoves(from, board)
    case 'knight':
      return getKnightMoves(from, board)
    case 'queen':
      return getQueenMoves(from, board)
    case 'king':
      return getKingMoves(from, board)
  }
}

export function getValidMoves(from: Square, board: Board): Move[] {
  const piece = atSquare(from, board)
  if (!piece) { return [] }
  const potentialMoves = getPotentialMoves(from, board)
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
    if (!isCheck(piece.side, board)) {
      validMoves.push(move)
    }
    fromRow[move.from[1]] = piece
    moveRow[move.to[1]] = maybeCapturedPiece
  })
  return validMoves
}

function getAllPotentialMoves(side: Side, board: Board): Move[] {
  const squares = findPieces({ side }, board)
  return squares.map(
    square => getPotentialMoves(square, board)
  ).flat()
}

export function isCheck(side: Side, board: Board): boolean {
  const ownKingSquare = findPieces({ type: 'king', side: side }, board)
  if (ownKingSquare.length !== 1) {
    throw new Error('Did not find exactly 1 king on own side!')
  }
  const enemySide = getEnemySide(side)
  const enemyMoves = getAllPotentialMoves(enemySide, board)
  return enemyMoves.some(move => move.to[0] === ownKingSquare[0]?.[0] && move.to[1] === ownKingSquare[0]?.[1])
}

export function move(board: Board, side: Side, from: Square, to: Square): Move {
  const validMoves = getValidMoves(from, board)
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
  const inCheck = isCheck(side, board)
  if (inCheck) {
    fromRow[from[1]] = piece
    toRow[to[1]] = maybeCapturedPiece
    throw new Error('Move would put you in check!')
  }
  return { from, to }
}

