import React, { useState, useContext, createContext } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Game, Piece, Board, Square } from '@chessy/core'
import * as gameLogic from '@chessy/core'
import './App.css'

const gameMutations = gameLogic.gameMutations

// State
//  game: Game
//  view: { number, viewing }
//
//  onClick -> createGame
//    API call
//    setGame()
//
//  onMove ->
//    API call
//    executeMove(game)
const API_HOST = 'http://127.0.0.1:8080'

const GameContext = createContext<{
  game: Game | null,
  executeMove: (from: Square, to: Square) => void
}>({
  game: null,
  executeMove: (from: Square, to: Square) => {}
})

function getSquares(board: Board): Square[] {
  const squares: Square[] = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      squares.push([i, j])
    }
  }
  return squares
}

// piece is draggable
// need to know starting position of piece for movement
//  can find it using piece data
//  can pass square data into piece (but re-creates piece on each movement?)

function DraggablePiece({ piece, square }: { piece: Piece, square: Square }): JSX.Element {
  const [{ opacity }, dragRef] = useDrag(() => ({
    type: 'piece',
    item: [square[0], square[1]],
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1
    })
  }), [square[0], square[1]])
  return (
    <div
      ref={dragRef}
      style={{ opacity }}
      className={`Piece ${piece.type}-${piece.side}`}
    />
  )
}

function BoardSquare({ square, piece }: { square: Square; piece?: Piece | null }): JSX.Element {
  const squareParity = (square[0] + square[1]) % 2
  const squareSide = squareParity === 1 ? 'black' : 'white'
  const { executeMove } = useContext(GameContext)
  const [, drop] = useDrop(() => ({
    accept: 'piece',
    drop: (item: Square) => {
      executeMove(item, square)
    }
  }), [square[0], square[1]])
  return (
    <div ref={drop} className={`Square ${squareSide}`}>
      {piece && <DraggablePiece piece={piece} square={square} />}
    </div>
  )
}

// get board squares
function BoardComponent({ board }: { board: Board }): JSX.Element {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="Board">
        {getSquares(board).map(([row, col]) => {
          // some hacky shit here with undefined and null
          const piece = board[row]?.[col] || null
          return (
            <BoardSquare key={`${row}-${col}`} square={[row, col]} piece={piece} />
          )
        })}
      </div>
    </DndProvider>
  )
}

function App(): JSX.Element {
  const [game, setGame] = useState<Game | null>(null)
  const initialGameContext = {
    game,
    executeMove: (from: Square, to: Square) => {
      if (!game) { throw new Error('game not ready') }
      const updatedGame = gameMutations.executeGameMove(from, to, game)
      setGame({ ...updatedGame })
    }
  }
  return (
    <GameContext.Provider value={initialGameContext}>
      <div className="App">
        <div className="content">
          <h1> Chessy </h1>
          {!game ? (
            <button
              onClick={async () => {
                const response = await fetch(`${API_HOST}/game`, { method: 'POST' })
                const newGame: Game = await response.json()
                setGame(newGame)
              }}
            >
              Create Game
            </button>
          ) : <BoardComponent board={game.board} />}
        </div>
      </div>
    </GameContext.Provider>
  )
}

export default App

// SERVER
// create game
//  standard board
// propose (user, game, ...)
// game manager
//  getGames(user)
//  getGame(game)
//
// CLIENT
// button -> create game
// connect via API, configure local!
