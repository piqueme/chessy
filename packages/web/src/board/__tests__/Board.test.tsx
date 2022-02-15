import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Board from '../Board'
import { readBoard } from '@chessy/core'
import type { Square as SquareData, Piece as PieceData } from '@chessy/core'

// WARNING: These tests are modestly brittle (implementation-dependent).

function getStyle(node: Element): CSSStyleDeclaration {
  return window.getComputedStyle(node)
}

const testBoard = readBoard([
  '-------------------------',
  '|bR|  |  |  |  |  |  |  |',
  '-------------------------',
  '|  |  |  |  |  |  |  |  |',
  '-------------------------',
  '|  |  |  |bN|bP|  |  |  |',
  '-------------------------',
  '|  |wB|  |  |  |  |  |  |',
  '-------------------------',
  '|  |wK|  |  |  |  |  |  |',
  '-------------------------',
  '|  |  |  |wP|  |  |  |  |',
  '-------------------------',
  '|  |  |  |  |  |  |  |  |',
  '-------------------------',
  '|  |  |  |  |  |  |  |  |',
  '-------------------------',
].join('\n'))

describe('Board', () => {
  test('renders correct number of square and piece divs', () => {
    const { container } = render(
      <Board
        board={testBoard}
        sideToView="white"
        sideToMove="white"
        onPieceDragStart={jest.fn()}
        onPieceDrop={jest.fn()}
      />
    )

    const boardNode = container.children[0]?.children[1]?.children[0]
    const numSquares = 64
    const numPieces = 6
    expect(boardNode?.children).toHaveLength(numSquares + numPieces)
  })

  test('renders pieces in correct positions', () => {
    const { container } = render(
      <Board
        board={testBoard}
        sideToView="white"
        sideToMove="white"
        onPieceDragStart={jest.fn()}
        onPieceDrop={jest.fn()}
      />
    )

    const boardNode = container.children[0]?.children[1]?.children[0]
    const boardChildren = Array.from(boardNode?.children || [])
    const pieceNodes = boardChildren.slice(64)

    const piecePositions = pieceNodes
      .filter(p => !!p)
      .map(getStyle)
      .map(style => ({
        top: style.getPropertyValue('top'),
        left: style.getPropertyValue('left')
      }))

    const expectedPiecePositions = [
      { top: '0%', left: '0%' },
      { top: '25%', left: '37.5%' },
      { top: '25%', left: '50%' },
      { top: '37.5%', left: '12.5%' },
      { top: '50%', left: '12.5%' },
      { top: '62.5%', left: '37.5%' }
    ]

    expect(piecePositions).toEqual(expectedPiecePositions)
  })

  test('renders pieces in correct positions when viewed from black side', () => {
    const { container } = render(
      <Board
        board={testBoard}
        sideToView="black"
        sideToMove="white"
        onPieceDragStart={jest.fn()}
        onPieceDrop={jest.fn()}
      />
    )

    const boardNode = container.children[0]?.children[1]?.children[0]
    const boardChildren = Array.from(boardNode?.children || [])
    const pieceNodes = boardChildren.slice(64)

    const piecePositions = pieceNodes
      .filter(p => !!p)
      .map(getStyle)
      .map(style => ({
        top: style.getPropertyValue('top'),
        left: style.getPropertyValue('left')
      }))

    const expectedPiecePositions = [
      { top: '25%', left: '50%' },
      { top: '37.5%', left: '75%' },
      { top: '50%', left: '75%' },
      { top: '62.5%', left: '37.5%' },
      { top: '62.5%', left: '50%' },
      { top: '87.5%', left: '87.5%' },
    ]

    expect(piecePositions).toEqual(expectedPiecePositions)
  })

  test('calls drag and drop handlers on piece drag/drop', () => {
    let dragSquare: SquareData | null = null
    let dragPiece: PieceData | null = null
    let dropSquare: SquareData | null = null

    const { container } = render(
      <Board
        board={testBoard}
        sideToView="white"
        sideToMove="white"
        onPieceDragStart={
          jest.fn((square, piece) => {
            dragSquare = square
            dragPiece = piece
          })}
        onPieceDrop={
          jest.fn((square) => {
            dropSquare = square
          })}
      />
    )

    const boardNode = container.children[0]?.children[1]?.children[0]
    const boardChildren = Array.from(boardNode?.children || [])
    const pieceNode = boardChildren.slice(64)[3]
    const squareNode = boardChildren[1]
    fireEvent.dragStart(pieceNode!)
    fireEvent.dragEnter(squareNode!)
    fireEvent.dragOver(squareNode!)
    fireEvent.drop(squareNode!)

    const { side, type } = dragPiece!

    expect(dragSquare).toEqual([3, 1])
    expect({ side, type }).toEqual({ type: 'bishop', side: 'white' })
    expect(dropSquare).toEqual([0, 1])
  })
})
