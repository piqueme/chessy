import React from 'react'

type Props = {
  children: React.ReactNode;
  border?: string;
}

/**
 * Responsive container which provides a height equal to the responsive width.
 */
function SquareFrame({ children, border }: Props): JSX.Element {
  return (
    <div css={{
      display: 'inline-block',
      position: 'relative',
      width: '100%',
      ...(border ? { border } : {})
    }}>
      <div css={{ marginTop: '100%' }} />
      <div css={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }}>
        {children}
      </div>
    </div>
  )
}

export default SquareFrame
