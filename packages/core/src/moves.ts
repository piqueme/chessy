import type { Board, Piece, PieceType, Square, Side, Direction } from './board'
import {
  getEnemySide,
  shift,
  inBoard,
  findPieces,
  atSquare,
  squareEquals,
  squareDiff,
  mutateBoard
} from './board'

export type Move = { from: Square, to: Square }
export type Take = { piece: Piece; square: Square }
export type MoveWithTake = Move & { take?: Take }
export type MoveResult = { board: Board; take?: Take; promotion?: PieceType }
export type CheckState = 'SAFE' | 'CHECK' | 'CHECKMATE'

function getTraversalUntilBlockOrEnemy(from: Square, side: Side, dirs: Direction[], board: Board): MoveWithTake[] {
  const traversal: MoveWithTake[] = []
  for (const dir of dirs) {
    let current = shift(from, dir)
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
        take: {
          square: current,
          piece: pieceAtEnd
        }
      })
    }
  }
  return traversal
}

function getFeasibleBishopMoves(from: Square, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(piece.type === 'bishop')) {
    throw new Error(`Piece is not a bishop to move!`)
  }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  const diagonalDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  return getTraversalUntilBlockOrEnemy(from, piece.side, diagonalDirs, board)
}

function getFeasibleRookMoves(from: Square, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(piece.type === 'rook')) {
    throw new Error(`Piece is not a rook to move!`)
  }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  const rowColDirs: Direction[] = [[-1, 0], [0, 1], [0, -1], [1, 0]]
  return getTraversalUntilBlockOrEnemy(from, piece.side, rowColDirs, board)
}

function getFeasibleKnightMoves(from: Square, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(piece.type === 'knight')) {
    throw new Error(`Piece is not a knight to move!`)
  }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  const jumpDirs: Direction[] = [[-1, 2], [-1, -2], [1, -2], [1, 2], [-2, -1], [-2, 1], [2, 1], [2, -1]]
  return getTraversalUntilBlockOrEnemy(from, piece.side, jumpDirs, board)
}

function getFeasiblePawnMoves(from: Square, previous: Move | null, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(piece.type === 'pawn')) {
    throw new Error(`Piece is not a pawn to move!`)
  }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  const moves: MoveWithTake[] = []

  const startRow = piece.side === 'black' ? 1 : board.length - 2
  const enemyStartRow = piece.side === 'black' ? board.length - 2 : 1
  const enemyJumpRow = piece.side === 'black' ? board.length - 4 : 3
  const moveDirection: Direction = piece.side === 'black' ? [1, 0] : [-1, 0]
  const jumpDirection: Direction = piece.side === 'black' ? [2, 0] : [-2, 0]
  const takeDirections: Direction[] = piece.side === 'black' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]

  const moveSquare = shift(from, moveDirection)
  if (inBoard(moveSquare, board) && !atSquare(moveSquare, board)) {
    moves.push({ from, to: moveSquare })
  }
  if (from[0] === startRow) {
    const jumpSquare = shift(from, jumpDirection)
    if (inBoard(jumpSquare, board) && !atSquare(jumpSquare, board)) {
      moves.push({ from, to: jumpSquare })
    }
  }
  // EN PASSANT
  if (previous) {
    const pieceAtPreviousMoveTarget = previous ? atSquare(previous.to, board) : null
    const enemyPawnMovedLast = pieceAtPreviousMoveTarget?.type === 'pawn' && pieceAtPreviousMoveTarget?.side === getEnemySide(side)
    const enemyPawnJumped = previous.from[0] === enemyStartRow && previous.to[0] === enemyJumpRow
    const diffToEnemyPawn = squareDiff(from, previous.to)
    const nextToEnemyPawn = squareEquals(diffToEnemyPawn, [0, -1]) || squareEquals(diffToEnemyPawn, [0, 1])
    if (enemyPawnMovedLast && enemyPawnJumped && nextToEnemyPawn) {
      const dir = shift(diffToEnemyPawn, side === 'black' ? [1, 0] : [-1, 0])
      const take = { square: previous.to, piece: pieceAtPreviousMoveTarget }
      moves.push({ from, to: shift(from, dir), take })
    }
  }
  for (const dir of takeDirections) {
    const takeSquare = shift(from, dir)
    const takeSquareInBoard = inBoard(takeSquare, board)
    const takenPiece = takeSquareInBoard ? atSquare(takeSquare, board) : null
    if (takeSquareInBoard && takenPiece?.side === getEnemySide(piece.side)) {
      const take = { square: takeSquare, piece: takenPiece }
      moves.push({ from, to: takeSquare, take })
    }
  }

  return moves
}

function getFeasibleQueenMoves(from: Square, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) {
    throw new Error(`Piece not available at ${from} to move!`)
  }
  if (!(piece.type === 'queen')) {
    throw new Error(`Piece is not a knight to move!`)
  }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  return getTraversalUntilBlockOrEnemy(from, piece.side, allDirs, board)
}

// TODO: Does not account for castling
function getFeasibleKingMoves(from: Square, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece || !(piece.type === 'king')) { throw new Error('Not a king being moved!'); }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }

  const allDirs : Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [0, 1], [0, -1], [1, 0]]
  const moves: MoveWithTake[] = []

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
      const take = { square: moveSquare, piece: pieceAtMoveSquare }
      moves.push({ from, to: moveSquare, take })
    }
  }

  return moves
}

export function getFeasibleMoves(from: Square, previous: Move | null, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) { throw new Error(`No piece at square: ${from} to get moves for!`) }
  if (piece.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  switch(piece.type) {
    case 'pawn':
      return getFeasiblePawnMoves(from, previous, side, board)
    case 'bishop':
      return getFeasibleBishopMoves(from, side, board)
    case 'rook':
      return getFeasibleRookMoves(from, side, board)
    case 'knight':
      return getFeasibleKnightMoves(from, side, board)
    case 'queen':
      return getFeasibleQueenMoves(from, side, board)
    case 'king':
      return getFeasibleKingMoves(from, side, board)
  }
}

function annotateMoveWithTake(move: Move, previous: Move | null, side: Side, board: Board): MoveWithTake {
  const feasibleMoves = getFeasibleMoves(move.from, previous, side, board)
  const annotatedMove = feasibleMoves.find(feasibleMove => squareEquals(feasibleMove.to, move.to))
  if (!annotatedMove) { throw new Error('Given move is not feasible.'); }
  return annotatedMove
}

export function isFeasibleMove(move: Move, previous: Move | null, side: Side, board: Board): boolean {
  const feasibleMoves = getFeasibleMoves(move.from, previous, side, board)
  return feasibleMoves.some(feasibleMove => squareEquals(feasibleMove.to, move.to))
}

export function getAllFeasibleMoves(previous: Move | null, side: Side, board: Board): MoveWithTake[] {
  const squares = findPieces({ side }, board)
  return squares.map(
    square => getFeasibleMoves(square, previous, side, board)
  ).flat()
}

export function isCheck(previous: Move | null, side: Side, board: Board): boolean {
  const ownKingSquare = findPieces({ type: 'king', side: side }, board)
  const enemySide = getEnemySide(side)
  const enemyMoves = getAllFeasibleMoves(previous, enemySide, board)
  return enemyMoves.some(move => move.to[0] === ownKingSquare[0]?.[0] && move.to[1] === ownKingSquare[0]?.[1])
}

export function getValidMoves(from: Square, previous: Move | null, side: Side, board: Board): MoveWithTake[] {
  const piece = atSquare(from, board)
  if (!piece) { return [] }
  const feasibleMoves = getFeasibleMoves(from, previous, side, board)
  const validMoves: MoveWithTake[] = []
  feasibleMoves.forEach(move => {
    // may need to be careful here about GC
    const boardAfterMove = mutateBoard([
      { square: from, piece: null },
      { square: move.to, piece }
    ], board)

    if (!isCheck(previous, piece.side, boardAfterMove)) {
      validMoves.push(move)
    }
  })
  return validMoves
}

export function isValidMove(move: Move, previous: Move | null, side: Side, board: Board): boolean {
  const validMoves = getValidMoves(move.from, previous, side, board)
  return validMoves.some(validMove => squareEquals(validMove.to, move.to))
}

export function getAllValidMoves(previous: Move | null, side: Side, board: Board): MoveWithTake[] {
  const squares = findPieces({ side }, board)
  return squares.map(
    square => getValidMoves(square, previous, side, board)
  ).flat()
}

export function getCheckState(previous: Move | null, side: Side, board: Board): CheckState {
  const ownKingSquare = findPieces({ type: 'king', side: side }, board)[0]
  if (!ownKingSquare) { throw new Error('Could not find own king!') }

  const kingMoves = getValidMoves(ownKingSquare, previous, side, board)
  const hasCheck = isCheck(previous, side, board)
  const hasMate = kingMoves.length === 0 && hasCheck
  if (hasMate) { return 'CHECKMATE' }
  if (hasCheck) { return 'CHECK' }
  return 'SAFE'
}

export function canPromoteFromAssumedValidMove(move: Move, side: Side, board: Board): boolean {
  const piece = atSquare(move.from, board)
  const lastRow = side === 'black' ? board[board.length - 1] : 0
  if (piece?.side !== side) { throw new Error(`Piece moved does not match moving side.`) }
  return piece?.type === 'pawn' && move.to[0] === lastRow
}

export function executeMove(move: Move, previous: Move | null, promotePiece: PieceType | null, side: Side, board: Board): MoveResult {
  const isValid = isValidMove(move, previous, side, board)
  if (!isValid) {
    throw new Error(`Move ${move} is not valid.`)
  }
  const moveWithTake = annotateMoveWithTake(move, previous, side, board)
  let piece = atSquare(moveWithTake.from, board)
  const canPromote = canPromoteFromAssumedValidMove(moveWithTake, side, board)
  if (canPromote && !promotePiece) {
    throw new Error('Cannot make a final rank move without promotion.')
  }
  if (canPromote && promotePiece) {
    piece = { type: promotePiece, side };
  }
  const boardAfterMove = mutateBoard([
    { square: moveWithTake.from, piece: null },
    { square: moveWithTake.to, piece },
    ...(moveWithTake.take?.square && !squareEquals(moveWithTake.take?.square, move.to) ? [{ square: moveWithTake.take?.square, piece: null }] : [])
  ], board)

  return {
    board: boardAfterMove,
    ...(moveWithTake.take ? { take: moveWithTake.take } : {}),
    ...(promotePiece ? { promotion: promotePiece } : {})
  }
}

