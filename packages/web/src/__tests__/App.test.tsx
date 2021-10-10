import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

test('displays app', async () => {
  render(<App />)
  await waitFor(() => screen.getByText('Hello Vite + React!'))
  // expect(screen.getByRole('link')).toHaveTextContent('Learn React')
})
