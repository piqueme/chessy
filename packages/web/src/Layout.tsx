import React from 'react'
import { Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'

export default function Layout(): JSX.Element {
  return (
    <div css={{ backgroundColor: '#f9f4ec', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        css={{
          backgroundColor: '#a04a27'
        }}
      >
        <Toolbar variant="dense" />
      </AppBar>
      <Container maxWidth="xl" css={{ marginTop: 48 }}>
        <Outlet />
      </Container>
    </div>
  )
}
