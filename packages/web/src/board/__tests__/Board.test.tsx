describe('Board', () => {
  test('should render', () => {
    expect(0).toEqual(0)
  })
})

/**
 * Square frame
 *  - children get injected
 *  - border changes color
 *
 * Board
 *  - pieces absolute and relative
 *  - view side switches orientation
 *  - shows col and row for last
 *  - triggers move end
 *  - shows all pieces
 *  - when piece is moving has pointer events
 *
 * Square
 *  - if row exists show
 *  - if col exists
 *  - size changes
 *  - onMoveEnd triggers
 *
 * Piece
 *  -
 */
