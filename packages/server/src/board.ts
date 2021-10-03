type PieceType = 'bishop' | 'rook' | 'knight' | 'king' | 'queen' | 'pawn'
export type PieceSide = 'white' | 'black'
export type Piece = {
  type: PieceType;
  side: PieceSide;
}

export type Board = (Piece | null)[][]
export type Square = [number, number]


function countOccurrences<T>(arr: T[], item: T): number {
  const occurrences = arr.reduce<Map<T, number>>((acc, item) => {
    return acc.set(item, (acc.get(item) || 0) + 1)
  }, new Map())
  return occurrences.get(item) || 0
}

function range(n: number): Array<number> {
  return Array.from(Array(n).keys())
}

function reverseMap<T, U>(map: Map<U, T>): Map<T, U> {
  return new Map(
    Array.from(map, a => (a.reverse() as [T, U]))
  )
}

const pieceTypeSerializationMap: Map<PieceType, string> = new Map([
  ['bishop', 'B'],
  ['knight', 'N'],
  ['rook', 'R'],
  ['king', 'K'],
  ['queen', 'Q'],
  ['pawn', 'P']
])

const reversePieceTypeMap = reverseMap(pieceTypeSerializationMap)

const sideSerializationMap: Map<PieceSide, string> = new Map([
  ['white', 'w'],
  ['black', 'b']
])

const reverseSideMap = reverseMap(sideSerializationMap)

export function opposite(side: PieceSide): PieceSide {
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

export function serializeBoard(board: Board): string {
  const serializeRow = (row: (Piece | null)[]): string => {
    return [
      '|',
      row.map(piece => piece ? serializePiece(piece) : '  ').join('|'),
      '|'
    ].join('')
  }

  if (!board[0]) { return '' }
  const numCols = board[0].length;
  const rowDivider = '-'.repeat(3 * numCols + 1)
  const serializedRows = board.map(serializeRow)
  return [
    rowDivider,
    serializedRows.join('\n' + rowDivider + '\n'),
    rowDivider,
  ].join('\n')
}

export function findPieces({ type, side }: {
  type?: PieceType,
  side?: PieceSide
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
  if (!board[0]) { return false }
  return (
    square[0] >= 0 && square[0] < board.length &&
    square[1] >= 0 && square[1] < board[0].length
  )
}

export function atSquare(square: Square, board: Board): Piece | null {
  if (!inBoard(square, board)) { throw new Error('Square is not in board!') }
  // at this point we can make Type assertions since we know the square exists
  const row = board[square[0]] as (Piece | null)[]
  const pieceAtSquare = row[square[1]] as Piece | null
  return pieceAtSquare
}

function isBoardValid(board: Board): boolean {
  const colsPerRow = board.map(row => row.length)
  const uniqueColsPerRow = new Set(colsPerRow).size
  return (uniqueColsPerRow == 1 && !!board[0] && board[0].length > 0)
}

export function getAllSquares(board: Board): Square[] {
  if (!board[0]) { return []; }
  const squares: Square[] = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      squares.push([i, j])
    }
  }
  return squares
}

export function serializeSquare(square: Square, board: Board): string {
  if (!isBoardValid(board)) { throw new Error('Invalid board.') }
  if (!inBoard(square, board)) { throw new Error(`Square ${square} is not in board.`) }

  const numRows = board.length
  const colString = String.fromCharCode('a'.charCodeAt(0) + square[1])
  const rowString = numRows - square[0]
  return `${colString}${rowString}`
}

export function shift(square: Square, change: [number, number]): Square {
  return [square[0] + change[0], square[1] + change[1]]
}
