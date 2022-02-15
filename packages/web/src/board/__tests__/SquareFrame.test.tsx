import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SquareFrame from '../SquareFrame'

function TestComponent(): JSX.Element {
  return <div className="test-component"> Test Component Text </div>
}

describe('SquareFrame', () => {
  test('renders as previously (snapshot)', async () => {
    const { container } = render(
      <SquareFrame>
        <TestComponent />
      </SquareFrame>
    )

    await waitFor(() => screen.getByText('Test Component Text'))
    expect(container).toMatchInlineSnapshot(`
.emotion-0 {
  display: inline-block;
  position: relative;
  width: 100%;
}

.emotion-1 {
  margin-top: 100%;
}

.emotion-2 {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

<div>
  <div
    class="emotion-0"
  >
    <div
      class="emotion-1"
    />
    <div
      class="emotion-2"
    >
      <div
        class="test-component"
      >
         Test Component Text 
      </div>
    </div>
  </div>
</div>
`)
  })

  test('renders all passed children', async () => {
    render(
      <SquareFrame>
        <TestComponent />
        <TestComponent />
      </SquareFrame>
    )

    await waitFor(() => screen.getAllByText('Test Component Text'))
    const testComponents = screen.getAllByText('Test Component Text')
    expect(testComponents).toHaveLength(2)
  })

  test('includes border css when passed', async () => {
    const { container } = render(
      <SquareFrame border='1px solid black'>
        <TestComponent />
      </SquareFrame>
    )

    await waitFor(() => screen.getByText('Test Component Text'))
    expect(container.firstChild).toHaveStyleRule('border', '1px solid black')
  })
})
