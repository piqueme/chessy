import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import GamePage from './GamePage'
import PuzzlesPage from './PuzzlesPage'

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="game/:gameId" element={<GamePage />} />
          <Route path="puzzles" element={<PuzzlesPage />} />
          <Route
            path="*"
            element={
              <main css={{ padding: "1rem" }}>
                <p> There's nothing here! </p>
              </main>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
