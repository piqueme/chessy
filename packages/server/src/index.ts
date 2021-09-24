type PieceType = 'bishop' | 'knight' | 'rook' | 'king' | 'queen' | 'pawn';
type PieceSide = 'black' | 'white';
type ShortSide = 'b' | 'w';
type ShortName = 'B' | 'R'  | 'N' | 'K' | 'Q' | 'P';
export type Piece = {
  name: PieceType;
  side: PieceSide;
};

export type Board = (Piece | null)[][];

function toShorthand(piece: Piece): string {
  const shortName = {
    'bishop': 'B',
    'knight': 'N',
    'rook': 'R',
    'king': 'K',
    'queen': 'Q',
    'pawn': 'X'
  };
  const shortSide = {
    'white': 'w',
    'black': 'b'
  };
  return shortSide[piece.side] + shortName[piece.name];
}

export function fromShorthand(shorthand: string): Piece {
  const shortName = {
    'B': 'bishop',
    'N': 'knight',
    'R': 'rook',
    'K': 'king',
    'Q': 'queen',
    'P': 'pawn'
  };
  const shortSide = {
    'w': 'white',
    'b': 'black'
  };
  const side = shortSide[shorthand[0] as ShortSide] as PieceSide
  const name = shortName[shorthand[1] as ShortName] as PieceType
  if (!side || !name) { throw new Error('bad notation!' ); }
  return { name , side }
}

export function createBoard(): Board {
  const gen = fromShorthand;
  return [
    [gen('bR'), gen('bN'), gen('bB'), gen('bQ'), gen('bK'), gen('bB'), gen('bN'), gen('bR')],
    [gen('bP'), gen('bP'), gen('bP'), gen('bP'), gen('bP'), gen('bP'), gen('bP'), gen('bP')],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [gen('wP'), gen('wP'), gen('wP'), gen('wP'), gen('wP'), gen('wP'), gen('wP'), gen('wP')],
    [gen('wR'), gen('wN'), gen('wB'), gen('wQ'), gen('wK'), gen('wB'), gen('wN'), gen('wR')],
  ]
}

function printRow(row: (Piece | null)[]): string {
  return '|' + row.map(p => p ? toShorthand(p) : '  ').join('|') + '|'
}

export function printBoard(board: Board): string {
  if (!board[0]) { return ''; }
  const divider = '-' + '---'.repeat(board[0].length)
  return [
    divider,
    '\n',
    board.map(printRow).join('\n' + divider + '\n'),
    '\n',
    divider,
  ].join('');
}
