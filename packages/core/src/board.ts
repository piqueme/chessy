import {
  countOccurrences,
  range,
  reverseMap
} from './utils'

/**
 * What should the Board module contains?
 *  - key types for board, squares, pieces
 *  - utility methods for updating the board, finding pieces and squares
 *
 * How should we structure the methods?
 *  - read and mutation methods should clearly distinguish
 *  - allow importing individual methods for lower size
 *  - when importing help with namespacing
 */

export type Mutation = { square: Square; piece: Piece | null }
export type PieceType = 'bishop' | 'rook' | 'knight' | 'king' | 'queen' | 'pawn'
export type Side = 'white' | 'black'
export type Piece = Readonly<{
  type: PieceType;
  side: Side;
}>

type MutableRow = [(Piece | null), ...(Piece | null)[]]
type Row = Readonly<MutableRow>
export type Board = Readonly<[Row, ...Row[]]>
export type Square = [number, number]
export type Direction = [number, number]

const pieceTypeSerializationMap: Map<PieceType, string> = new Map([
  ['bishop', 'B'],
  ['knight', 'N'],
  ['rook', 'R'],
  ['king', 'K'],
  ['queen', 'Q'],
  ['pawn', 'P']
])
const reversePieceTypeMap = reverseMap(pieceTypeSerializationMap)

const sideSerializationMap: Map<Side, string> = new Map([
  ['white', 'w'],
  ['black', 'b']
])
const reverseSideMap = reverseMap(sideSerializationMap)

export function getEnemySide(side: Side): Side {
  return (side === 'black') ? 'white' : 'black'
}

export function serializePiece(piece: Piece): string {
  const pieceTypeShort = pieceTypeSerializationMap.get(piece.type)
  const sideShort = sideSerializationMap.get(piece.side)
  if (!pieceTypeShort || !sideShort) {
    throw new Error('Failed to translate piece to shortform text.')
  }
  return sideShort + pieceTypeShort
}

export function readPieceType(pieceTypeString: string): PieceType {
  const typeData = reversePieceTypeMap.get(pieceTypeString)
  if (!typeData) { throw new Error('Piece type could not be read!') }
  return typeData
}

export function readPiece(pieceString: string): Piece {
  const side = pieceString[0]
  const type = pieceString[1]
  if (!type || !side) {
    throw new Error(`Failed to parse piece from shortform string: ${pieceString}`)
  }
  const typeData = reversePieceTypeMap.get(type)
  const sideData = reverseSideMap.get(side)
  if (!typeData || !sideData) {
    throw new Error(`Failed to parse piece from shortform string: ${pieceString}`)
  }
  return { type: typeData, side: sideData }
}

export function isBoardValid(board: Readonly<Readonly<(Piece | null)[]>[]>): board is Board {
  const colsPerRow = board.map(row => row.length)
  const uniqueColsPerRow = new Set(colsPerRow).size
  return (uniqueColsPerRow == 1 && !!board[0] && board[0].length > 0)
}

export function serializeBoard(board: Board): string {
  const serializeRow = (row: Row): string => {
    return [
      '|',
      row.map(piece => piece ? serializePiece(piece) : '  ').join('|'),
      '|'
    ].join('')
  }

  const numCols = board[0].length;
  const rowDivider = '-'.repeat(3 * numCols + 1)
  const serializedRows = board.map(serializeRow)
  return [
    rowDivider,
    serializedRows.join('\n' + rowDivider + '\n'),
    rowDivider,
  ].join('\n')
}

export function readBoard(serializedBoard: string): Board {
  const lineSplit = serializedBoard.split('\n')
  try {
    const firstColumn = lineSplit.map(line => line[0])
    const numRows = countOccurrences(firstColumn, '|')

    // check if dividers are made of dashes
    const dividers = range(numRows + 1).map(rowIdx => lineSplit[2 * rowIdx])
    if (!dividers.every(
      divider => !!divider && divider.split('').every(c => c == '-')
    )) {
      throw new Error(`Failed to parse board:\n${serializedBoard}`)
    }

    // parse rows
    const board = range(numRows).map(rowIdx => {
      const row = lineSplit[rowIdx * 2 + 1]
      if (!row) { throw new Error(); }
      const rowSplit = row.substr(1, row.length - 2).split('|')
      return rowSplit.map(pieceString => (
        (pieceString == '  ' ? null : readPiece(pieceString))
      ))
    })

    if (!isBoardValid(board)) {
      throw new Error(`Failed to parse board:\n${serializedBoard}`)
    }
    return board
  } catch (err) {
    throw new Error(`Failed to parse board:\n${serializedBoard}`)
  }
}

function readCompressedRow(row: string): (Piece | null)[] {
  const parsedRow: (Piece | null)[] = []
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (!char) { throw new Error('Parsing error.') }
    const spaces = parseInt(char, 10)
    if (spaces) {
      for (let j = 0; j < spaces; j++) {
        parsedRow.push(null)
      }
    } else {
      const pieceType = reversePieceTypeMap.get(char.toUpperCase())
      if (!pieceType) { throw new Error('Parsing error.') }
      const side = (char.toUpperCase() === char) ? 'white' : 'black'
      parsedRow.push({ type: pieceType, side })
    }
  }
  return parsedRow
}

export function readCompressedBoard(compressedBoard: string): Board {
  const rows = compressedBoard.split('/')
  const parsedRows = rows.map(readCompressedRow)
  if (!isBoardValid(parsedRows)) { throw new Error('Invalid board!') }
  return parsedRows
}

function serializeCompressedRow(row: Row): string {
  const compressedRow = row.reduce<[string, number]>((acc, pieceOrNull) => {
    if (pieceOrNull === null) {
      return [acc[0], acc[1] + 1]
    }
    const spaceString = acc[1] > 0 ? acc[1].toString() : ''
    const pieceString = pieceTypeSerializationMap.get(pieceOrNull.type)
    if (!pieceString) {
      throw new Error(`Invalid piece ${pieceOrNull} being serialized!`)
    }
    const pieceWithSideString = pieceOrNull.side === 'white' ? pieceString : pieceString.toLowerCase()
    return [acc[0] + spaceString + pieceWithSideString, 0]
  }, ['', 0])

  const endSpaceString = compressedRow[1] > 0 ? compressedRow[1].toString() : ''
  return compressedRow[0] + endSpaceString
}

export function serializeCompressedBoard(board: Board): string {
  return board.map(serializeCompressedRow).join('/')
}

export function createStandardBoard(): Board {
  return readBoard([
    '-------------------------',
    '|bR|bN|bB|bQ|bK|bB|bN|bR|',
    '-------------------------',
    '|bP|bP|bP|bP|bP|bP|bP|bP|',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|  |  |  |  |  |  |  |  |',
    '-------------------------',
    '|wP|wP|wP|wP|wP|wP|wP|wP|',
    '-------------------------',
    '|wR|wN|wB|wQ|wK|wB|wN|wR|',
    '-------------------------',
  ].join('\n'))
}

export function inBoard(square: Square, board: Board): boolean {
  return (
    square[0] >= 0 && square[0] < board.length &&
    square[1] >= 0 && square[1] < board[0].length
  )
}

export function atSquare(square: Square, board: Board): Piece | null {
  if (!inBoard(square, board)) {
    throw new Error(`Square ${square} is not in board!`)
  }
  // at this point we can make Type assertions since we know the square exists
  const row = board[square[0]] as Readonly<(Piece | null)[]>
  const pieceAtSquare = row[square[1]] as Piece | null
  return pieceAtSquare
}

export function getAllSquares(board: Board): Square[] {
  const squares: Square[] = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      squares.push([i, j])
    }
  }
  return squares
}

export function findPieces({ type, side }: {
  type?: PieceType,
  side?: Side
}, board: Board): Square[] {
  const allSquares = getAllSquares(board)
  return allSquares.filter(square => {
    const piece = atSquare(square, board)
    if (!piece) { return false; }
    if (type && !(piece?.type === type)) {
      return false
    }
    if (side && !(piece?.side === side)) {
      return false
    }
    return true
  });
}

export function serializeSquare(square: Square, board: Board): string {
  if (!inBoard(square, board)) { throw new Error(`Square ${square} is not in board.`) }

  const numRows = board.length
  const colString = String.fromCharCode('a'.charCodeAt(0) + square[1])
  const rowString = numRows - square[0]
  return `${colString}${rowString}`
}

export function shift(square: Square, change: [number, number]): Square {
  return [square[0] + change[0], square[1] + change[1]]
}

export function squareEquals(square1: Square, square2: Square): boolean {
  return square1[0] === square2[0] && square1[1] === square2[1]
}

export function squareDiff(square1: Square, square2: Square): [number, number] {
  return [square2[0] - square1[0], square2[1] - square1[1]]
}

export function mutateBoard(
  mutations: Mutation[],
  board: Board
): Board {
  const newBoard = [...board.map(row => [...row])]
  mutations.forEach(({ square, piece }) => {
    if (!inBoard(square, board)) {
      throw new Error(`Square ${square} is not in board.`)
    }
    // we know the square is in the board now
    const row = newBoard[square[0]] as (Piece | null)[]
    row[square[1]] = piece
  })
  if (!isBoardValid(newBoard)) {
    throw new Error('Mutations resulted in an invalid board!')
  }
  return newBoard
}
