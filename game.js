"use strict";
function toShorthand(piece) {
    const shortName = {
        'bishop': 'B',
        'knight': 'N',
        'rook': 'R',
        'king': 'K',
        'queen': 'Q',
        'pawn': 'P'
    };
    const shortSide = {
        'white': 'W',
        'black': 'B'
    };
    return shortName[piece.name] + shortSide[piece.side];
}
function fromShorthand(shorthand) {
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
    const side = shortSide[shorthand[0]];
    const name = shortName[shorthand[1]];
    if (!side || !name) {
        throw new Error('bad notation!');
    }
    return { name, side };
}
;
function createBoard() {
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
    ];
}
function printRow(row) {
    return '|' + row.map(p => toShorthand(p)).join('|') + '|';
}
function printBoard(board) {
    const divider = '-' + '---'.repeat(board[0].length);
    return [
        divider,
        '\n',
        board.map(printRow).join('\n' + divider + '\n'),
        divider
    ].join('');
}
