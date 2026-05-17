import React, { useState, useEffect, useCallback, useRef } from 'react'
import './TetrisGame.css'

const ROWS = 20
const COLS = 10

const SHAPES = [
  // I
  { shape: [[1, 1, 1, 1]], color: '#00ffff' },
  // O
  { shape: [[1, 1], [1, 1]], color: '#ffff00' },
  // T
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#aa00ff' },
  // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
  // Z
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
  // J
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' },
  // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffaa00' }
]

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function getRandomPiece() {
  const piece = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return {
    shape: piece.shape,
    color: piece.color,
    x: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2),
    y: 0
  }
}

export default function TetrisGame({ onScoreUpdate, isFocused }) {
  const [grid, setGrid] = useState(createEmptyGrid())
  const [piece, setPiece] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  // Use refs to avoid closures issues in event listeners
  const stateRef = useRef({ grid, piece, gameOver, score })
  stateRef.current = { grid, piece, gameOver, score }

  const spawnPiece = useCallback(() => {
    const nextPiece = getRandomPiece()
    setPiece(nextPiece)
    if (checkCollision(nextPiece, stateRef.current.grid)) {
      setGameOver(true)
    }
  }, [])

  useEffect(() => {
    if (!piece && !gameOver) {
      spawnPiece()
    }
  }, [piece, gameOver, spawnPiece])

  function checkCollision(p, currentGrid) {
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c]) {
          const newY = p.y + r
          const newX = p.x + c
          if (newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && currentGrid[newY][newX])) {
            return true
          }
        }
      }
    }
    return false
  }

  function mergePiece(p, currentGrid) {
    const newGrid = currentGrid.map(row => [...row])
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c] && p.y + r >= 0) {
          newGrid[p.y + r][p.x + c] = p.color
        }
      }
    }
    return newGrid
  }

  function clearLines(currentGrid) {
    let linesCleared = 0
    const newGrid = currentGrid.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++
        return false
      }
      return true
    })

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(null))
    }

    if (linesCleared > 0) {
      const addedScore = [0, 100, 300, 500, 800][linesCleared]
      const newScore = stateRef.current.score + addedScore
      setScore(newScore)
      if (onScoreUpdate) onScoreUpdate(newScore)
    }
    
    return newGrid
  }

  const moveDown = useCallback(() => {
    const { piece: p, grid: g, gameOver: over } = stateRef.current
    if (over || !p) return

    const nextPiece = { ...p, y: p.y + 1 }
    if (checkCollision(nextPiece, g)) {
      const mergedGrid = mergePiece(p, g)
      const finalGrid = clearLines(mergedGrid)
      setGrid(finalGrid)
      spawnPiece()
    } else {
      setPiece(nextPiece)
    }
  }, [spawnPiece])

  useEffect(() => {
    const interval = setInterval(moveDown, 800)
    return () => clearInterval(interval)
  }, [moveDown])

  useEffect(() => {
    const handleAction = (e) => {
      const { action } = e.detail
      const { piece: p, grid: g, gameOver: over } = stateRef.current
      if (over || !p) return

      let nextPiece = null
      
      switch(action) {
        case 'LEFT':
          nextPiece = { ...p, x: p.x - 1 }
          if (!checkCollision(nextPiece, g)) setPiece(nextPiece)
          break
        case 'RIGHT':
          nextPiece = { ...p, x: p.x + 1 }
          if (!checkCollision(nextPiece, g)) setPiece(nextPiece)
          break
        case 'CLICK': {
          // Rotate
          const rotatedShape = p.shape[0].map((_, i) => p.shape.map(row => row[i]).reverse())
          nextPiece = { ...p, shape: rotatedShape }
          if (!checkCollision(nextPiece, g)) setPiece(nextPiece)
          break
        }

      }
    }

    const handler = (e) => handleAction(e)
    window.addEventListener('eyebridge:activate', handler)
    return () => window.removeEventListener('eyebridge:activate', handler)
  }, [spawnPiece])

  // Render game playfield
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row])
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c] && piece.y + r >= 0 && piece.y + r < ROWS) {
            displayGrid[piece.y + r][piece.x + c] = piece.color
          }
        }
      }
    }

    return (
      <div className="tetris-board">
        {displayGrid.map((row, r) => (
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`tetris-cell ${cell ? 'filled' : ''}`}
              style={{ backgroundColor: cell || 'transparent' }}
            />
          ))
        ))}
        {gameOver && <div className="tetris-game-over">Oyun Bitti</div>}
      </div>
    )
  }

  return (
    <div className={`tetris-container ${isFocused ? 'game-focused' : ''}`}>
      {renderGrid()}
    </div>
  )
}
