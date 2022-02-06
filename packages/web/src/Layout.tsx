import React from 'react'
import { Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'

export default function Layout(): JSX.Element {
  const navigate = useNavigate()

  return (
    <div css={{ backgroundColor: '#f9f4ec', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        css={{
          backgroundColor: '#a04a27'
        }}
      >
        <Toolbar variant="dense">
          <Typography variant="h6" component="div">
            Puzlr
          </Typography>
          <div css={{ display: 'flex', marginLeft: 18 }}>
            <Button
              sx={{ color: 'primary.contrastText' }}
              variant="text"
              onClick={() => { navigate('/puzzles') }}
            >
              Puzzles
            </Button>
            <Button
              sx={{ color: 'primary.contrastText' }}
              variant="text"
              onClick={() => { navigate('/about') }}
            >
              About
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" css={{ marginTop: 48 }}>
        <Outlet />
      </Container>
    </div>
  )
}
