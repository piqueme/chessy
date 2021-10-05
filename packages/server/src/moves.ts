import type { Board, Piece, Square, Side } from './board'
import { getEnemySide, shift, inBoard, findPieces, atSquare, mutateBoard } from './board'

type Direction = [number, number]
export type Move = { from: Square, to: Square, takenPiece?: Piece }

// moves need full information
// traverse (maybe do a bit much) -> generate moves
//

function getTraversalUntilBlockOrEnemy(from: Square, side: Side, dirs: Direction[], board: Board): Move[] {
  const traversal: Move[] = []
  for (const dir of dirs) {
    let current = shift(from, dir);
    while (inBoard(current, board) && !atSquare(current, board)) {
      traversal.push({ from, to: current })
      current = shift(current, dir)
    }
    const finalSquareInBoard = inBoard(current, board)
    const pieceAtEnd = finalSquareInBoard && atSquare(current, board)
    if (finalSquareInBoard && pieceAtEnd && pieceAtEnd.side === getEnemySide(side)) {
      traversal.push({
        from,
        to: current,
        takenPiece: pieceAtEnd
      })
    }
  }
  return traversal
}

function getBishopMoves(from: Square, board: Board): Move[] {
  const pieceAtSquare = atSquare(from, board)
  if (!pieceAtSquare) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(pieceAtSquare.type === 'bishop')) {
    throw new Error(`Piece is not a bishop to move!`)
  }
  const diagonalDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  return getTraversalUntilBlockOrEnemy(from, pieceAtSquare.side, diagonalDirs, board)
}

function getRookMoves(from: Square, board: Board): Move[] {
  const pieceAtSquare = atSquare(from, board)
  if (!pieceAtSquare) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(pieceAtSquare.type === 'rook')) {
    throw new Error(`Piece is not a rook to move!`)
  }
  const rowColDirs: Direction[] = [[-1, 0], [0, 1], [0, -1], [1, 0]]
  return getTraversalUntilBlockOrEnemy(from, pieceAtSquare.side, rowColDirs, board)
}

function getKnightMoves(from: Square, board: Board) {
  const pieceAtSquare = atSquare(from, board)
  if (!pieceAtSquare) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(pieceAtSquare.type === 'knight')) {
    throw new Error(`Piece is not a knight to move!`)
  }
  const jumpDirs: Direction[] = [[-1, 2], [-1, -2], [1, -2], [1, 2], [-2, -1], [-2, 1], [2, 1], [2, -1]]
  return getTraversalUntilBlockOrEnemy(from, pieceAtSquare.side, jumpDirs, board)
}

function getPawnMoves(from: Square, board: Board) {
  const pieceAtSquare = atSquare(from, board)
  if (!pieceAtSquare) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(pieceAtSquare.type === 'pawn')) {
    throw new Error(`Piece is not a pawn to move!`)
  }
  const moves: Move[] = []

  const moveDirection: Direction = pieceAtSquare.side === 'black' ? [1, 0] : [-1, 0]
  const takeDirections: Direction[] = pieceAtSquare.side === 'black' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]

  const moveSquare = shift(from, moveDirection)
  if (inBoard(moveSquare, board) && !atSquare(moveSquare, board)) {
    moves.push({ from, to: moveSquare })
  }
  for (const dir of takeDirections) {
    const takeSquare = shift(from, dir)
    const takeSquareInBoard = inBoard(takeSquare, board)
    const takenPiece = takeSquareInBoard ? atSquare(takeSquare, board) : null
    if (takeSquareInBoard && takenPiece?.side === getEnemySide(pieceAtSquare.side)) {
      moves.push({ from, to: takeSquare, takenPiece })
    }
  }

  return moves
}

function getQueenMoves(from: Square, board: Board): Move[] {
  const pieceAtSquare = atSquare(from, board)
  if (!pieceAtSquare) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(pieceAtSquare.type === 'knight')) {
    throw new Error(`Piece is not a knight to move!`)
  }
  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  return getTraversalUntilBlockOrEnemy(from, pieceAtSquare.side, allDirs, board)
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
    const pieceAtMoveSquare = atSquare(moveSquare, board)
    const squareEnemy = pieceAtMoveSquare?.side === getEnemySide(piece.side)
    if (squareEmpty) {
      moves.push({ from, to: moveSquare })
    }
    if (squareEnemy) {
      moves.push({ from, to: moveSquare, takenPiece: pieceAtMoveSquare })
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
    // may need to be careful here about GC
    const boardAfterMove = mutateBoard([
      { square: from, piece: null },
      { square: move.to, piece }
    ], board)

    if (!isCheck(piece.side, boardAfterMove)) {
      validMoves.push(move)
    }
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
  const enemySide = getEnemySide(side)
  const enemyMoves = getAllPotentialMoves(enemySide, board)
  return enemyMoves.some(move => move.to[0] === ownKingSquare[0]?.[0] && move.to[1] === ownKingSquare[0]?.[1])
}

export function move(board: Board, side: Side, from: Square, to: Square): {
  board: Board,
  move: Move
} {
  const validMoves = getValidMoves(from, board)
  const matchedValidMove = validMoves.find(v => v.to === to)
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error('No piece exists at square')
  }
  if (piece.side !== side) {
    throw new Error('Side to move is not piece side.')
  }
  if (!matchedValidMove) {
    throw new Error(`Move ${from}:${to} is not valid.`)
  }

  const boardAfterMove = mutateBoard([
    { square: from, piece: null },
    { square: to, piece }
  ], board)
  const inCheck = isCheck(side, boardAfterMove)
  if (inCheck) {
    throw new Error('Move would put you in check!')
  }

  return {
    board: boardAfterMove,
    move: matchedValidMove
  }
}

